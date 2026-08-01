import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

(function () {
  const container = document.getElementById('sculpture');
  if (!container) return;
  let W = window.innerWidth, H = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
  camera.position.set(0, 0.4, 6.2);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 3.0);
  key.position.set(4, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-4, -1, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.8);
  rim.position.set(-2, 1, -6);
  scene.add(rim);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false });
  } catch (e) {
    console.warn('[sculpture] WebGL unavailable — page content stays readable, sculpture skipped.', e);
    return;
  }
  renderer.setPixelRatio(1); // explicit DPR cap: the ASCII grid is resolution-independent → avoid retina overdraw
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 1);

  // Bloom post-process: bright pixels bleed into surrounding pixels BEFORE AsciiEffect samples,
  // so distinct 3D objects merge into one continuous lit field. This is what makes the ASCII
  // grid read as a unified TUI instead of separate rectangular char clusters.
  // Built LAZILY, after the first frame is on screen. Constructing UnrealBloomPass compiles
  // roughly seven shader programs and allocates five mip-level render targets, and none of that
  // can overlap the first paint — it was the bulk of the ~2s gap between the text appearing
  // (FCP 200ms) and the sculpture appearing (2372ms), which read as a broken half-empty page.
  //
  // Frame 1 renders straight through the renderer, so the sculpture shows up as soon as Three.js
  // has parsed. The bloom chain is then built during an idle slot and swapped in; the ASCII grid
  // simply gets its glow a few frames later, which is invisible next to a 2s blank.
  let composer = null;
  const buildBloom = () => {
    if (composer) return;
    const c = new EffectComposer(renderer);
    c.setSize(W, H);
    c.addPass(new RenderPass(scene, camera));
    // strength, radius, threshold:
    //   strength 1.4 — strong bleed but not blown out
    //   radius 0.85 — wide bloom, helps objects merge
    //   threshold 0.18 — only meaningfully lit pixels bloom (avoids ambient glow)
    c.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 1.4, 0.85, 0.18));
    composer = c;
  };

  // Hijack renderer.render → route through the composer when called from outside (AsciiEffect),
  // but use the ORIGINAL render when called from inside (composer's RenderPass needs the raw render).
  // Guarded with a re-entry flag to prevent infinite recursion.
  const origRender = renderer.render.bind(renderer);
  let viaComposer = false;
  let framesDrawn = 0;
  renderer.render = function (s, c) {
    if (viaComposer) {
      origRender(s, c);   // RenderPass is calling us — do the real render
    } else if (!composer) {
      origRender(s, c);   // pre-bloom frames: straight through, so frame 1 is not gated on shaders
      if (++framesDrawn === 1) {
        const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
        idle(buildBloom);
      }
    } else {
      viaComposer = true;
      composer.render();   // AsciiEffect is calling us — go through the bloom pipeline
      viaComposer = false;
    }
  };

  // Cellular ramp: soft dots at the dim end (mist), block chars at the bright end (cells).
  // Block-char cores read as agent units / "divs of a system"; soft chars wrap them like membrane.
  const effect = new AsciiEffect(renderer, ' .·:;-+*░▒▓█', { invert: true, resolution: 0.11 });
  effect.setSize(W, H);
  const dom = effect.domElement;
  dom.style.opacity = '0';
  dom.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  dom.style.fontFamily = '"JetBrains Mono", ui-monospace, monospace';
  container.appendChild(dom);

  function handleResize() {
    W = window.innerWidth; H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    // The bloom chain is built lazily (see buildBloom), so it may not exist yet on an early
    // resize. EffectComposer.setSize resizes its own passes, including the bloom pass.
    if (composer) composer.setSize(W, H);
    effect.setSize(W, H);
  }
  window.addEventListener('resize', handleResize);

  // Lambert: no specular highlights = no hard bright "panel" hotspots on each object.
  // Emissive baseline so unlit faces still contribute char density (avoids hard silhouette edges).
  const mat = () => new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x2a2a2a });

  // White line material — picked up by bloom, reads as glowing agent-network wire.
  const lineMat = () => new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  // Build a single-segment line between two [x,y,z] tuples or Vector3s.
  function wire(p1, p2) {
    const a = Array.isArray(p1) ? new THREE.Vector3(p1[0], p1[1], p1[2]) : p1;
    const b = Array.isArray(p2) ? new THREE.Vector3(p2[0], p2[1], p2[2]) : p2;
    const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
    return new THREE.Line(geom, lineMat());
  }
  // Tiny "cell" cube — bacterial unit. Used to add cellular density around shapes.
  function cell(x, y, z, size = 0.1) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat());
    c.position.set(x, y, z);
    c.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    return c;
  }

  // 01 Faceted crystalline spire — stacked icosahedra + dual orbital rings + fragments
  function makeObelisk() {
    const g = new THREE.Group();
    // Stack of faceted polyhedra forming a tapered crystal spire (5 elements)
    const stack = [
      { type: 'ico', size: 0.55, y: -1.5, rot: 0 },
      { type: 'ico', size: 0.48, y: -0.7, rot: Math.PI / 5 },
      { type: 'oct', size: 0.5,  y:  0.1, rot: Math.PI / 4 },
      { type: 'ico', size: 0.38, y:  0.85, rot: Math.PI / 3 },
      { type: 'oct', size: 0.32, y:  1.55, rot: Math.PI / 6 },
      { type: 'tet', size: 0.4,  y:  2.25, rot: 0 },
    ];
    stack.forEach(item => {
      let geom;
      if (item.type === 'ico') geom = new THREE.IcosahedronGeometry(item.size, 0);
      else if (item.type === 'oct') geom = new THREE.OctahedronGeometry(item.size, 0);
      else geom = new THREE.TetrahedronGeometry(item.size, 0);
      const m = new THREE.Mesh(geom, mat());
      m.position.y = item.y;
      m.rotation.y = item.rot;
      g.add(m);
    });
    // Two orbital rings at different angles
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.025, 6, 64), mat());
    r1.rotation.x = Math.PI / 2.2;
    g.add(r1);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.02, 6, 64), mat());
    r2.rotation.x = Math.PI / 1.7;
    r2.rotation.z = Math.PI / 6;
    g.add(r2);
    // Floating tetrahedron fragments (orbiting debris)
    for (let i = 0; i < 10; i++) {
      const frag = new THREE.Mesh(new THREE.TetrahedronGeometry(0.09 + Math.random() * 0.1), mat());
      const t = (i / 10) * Math.PI * 2 + Math.random() * 0.3;
      const r = 2.3 + Math.random() * 0.5;
      const p = (Math.random() - 0.5) * 0.8;
      frag.position.set(r * Math.cos(t), p, r * Math.sin(t));
      frag.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      g.add(frag);
    }
    // Cellular density: 8 small cell-cubes scattered in mid-orbit
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const r = 1.4 + Math.random() * 0.5;
      g.add(cell(r * Math.cos(t), -0.6 + Math.random() * 1.6, r * Math.sin(t), 0.09));
    }
    // Wires connecting consecutive stack elements (vertical agent chain)
    for (let i = 0; i < stack.length - 1; i++) {
      g.add(wire([0, stack[i].y, 0], [0, stack[i + 1].y, 0]));
    }
    return g;
  }

  // 02 Broken cube — central cube + 18 varied shards + radiating splinters
  function makeBrokenCube() {
    const g = new THREE.Group();
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), mat());
    g.add(cube);
    // Cubic shards
    for (let i = 0; i < 14; i++) {
      const s = 0.18 + Math.random() * 0.32;
      const shard = new THREE.Mesh(new THREE.BoxGeometry(s, s, s * (0.5 + Math.random())), mat());
      const r = 1.8 + Math.random() * 1.4;
      const t = Math.random() * Math.PI * 2;
      const p = (Math.random() - 0.5) * Math.PI;
      shard.position.set(r * Math.cos(t) * Math.cos(p), r * Math.sin(p), r * Math.sin(t) * Math.cos(p));
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      g.add(shard);
    }
    // Long splinters radiating outward
    for (let i = 0; i < 6; i++) {
      const splinter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.9 + Math.random() * 0.6), mat());
      const t = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
      const p = (Math.random() - 0.5) * Math.PI * 0.6;
      const r = 1.7;
      splinter.position.set(r * Math.cos(t) * Math.cos(p), r * Math.sin(p), r * Math.sin(t) * Math.cos(p));
      splinter.lookAt(0, 0, 0);
      g.add(splinter);
    }
    // Cellular density: 10 small cells scattered around the central core
    for (let i = 0; i < 10; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = (Math.random() - 0.5) * Math.PI;
      const r = 1.5 + Math.random() * 1.6;
      g.add(cell(r * Math.cos(t) * Math.cos(p), r * Math.sin(p), r * Math.sin(t) * Math.cos(p), 0.08 + Math.random() * 0.05));
    }
    // Wires from central cube to 6 distributed shards (agent comms)
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 2 * (i / 6);
      const r = 1.9;
      g.add(wire([0, 0, 0], [r * Math.cos(a), (Math.random() - 0.5) * 1.4, r * Math.sin(a)]));
    }
    return g;
  }

  // 03 Quartered lattice — 2x2 cubes + cross + inner smaller cubes + outer frame
  function makeQuartered() {
    const g = new THREE.Group();
    const sz = 0.7, gap = 0.22;
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), mat());
      c.position.set((x - 0.5) * (sz + gap), (y - 0.5) * (sz + gap), 0);
      g.add(c);
      // Inner smaller cube (depth)
      const inner = new THREE.Mesh(new THREE.BoxGeometry(sz * 0.4, sz * 0.4, sz * 0.4), mat());
      inner.position.set((x - 0.5) * (sz + gap), (y - 0.5) * (sz + gap), -0.5);
      g.add(inner);
    }
    // Central cross
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.85, 0.08), mat());
    g.add(v);
    const h = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 0.08), mat());
    g.add(h);
    const z = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.4), mat());
    g.add(z);
    // Outer frame corners
    const frameSize = 1.0;
    for (let dx of [-1, 1]) for (let dy of [-1, 1]) for (let dz of [-1, 1]) {
      const corner = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), mat());
      corner.position.set(dx * frameSize, dy * frameSize, dz * frameSize * 0.6);
      g.add(corner);
    }
    // Wires connecting the 4 main cubes in an X — visualizes the network
    const cells4 = [
      [-0.5 * (sz + gap), -0.5 * (sz + gap), 0],
      [ 0.5 * (sz + gap), -0.5 * (sz + gap), 0],
      [ 0.5 * (sz + gap),  0.5 * (sz + gap), 0],
      [-0.5 * (sz + gap),  0.5 * (sz + gap), 0],
    ];
    g.add(wire(cells4[0], cells4[2])); // diagonal
    g.add(wire(cells4[1], cells4[3])); // other diagonal
    g.add(wire(cells4[0], cells4[1])); // bottom edge
    g.add(wire(cells4[1], cells4[2])); // right edge
    g.add(wire(cells4[2], cells4[3])); // top edge
    g.add(wire(cells4[3], cells4[0])); // left edge
    // Cellular density at edge midpoints
    for (let i = 0; i < cells4.length; i++) {
      const a = cells4[i];
      const b = cells4[(i + 1) % cells4.length];
      g.add(cell((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0, 0.08));
    }
    return g;
  }

  // 04 Torii — pillars + capstones + 2 beams + sign tablet + base stones
  function makeTorii() {
    const g = new THREE.Group();
    // Pillars
    const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 2.8, 8), mat());
    lp.position.set(-1.0, -0.2, 0); g.add(lp);
    const rp = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 2.8, 8), mat());
    rp.position.set(1.0, -0.2, 0); g.add(rp);
    // Pillar caps
    const lc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.12, 8), mat());
    lc.position.set(-1.0, 1.26, 0); g.add(lc);
    const rc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.12, 8), mat());
    rc.position.set(1.0, 1.26, 0); g.add(rc);
    // Top beam (extends past pillars)
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.32), mat());
    top.position.y = 1.5; g.add(top);
    // Top beam upper trim
    const trim = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 0.34), mat());
    trim.position.y = 1.62; g.add(trim);
    // Lower beam
    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.13, 0.24), mat());
    lower.position.y = 1.08; g.add(lower);
    // Sign tablet between beams
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.06), mat());
    sign.position.y = 1.29; g.add(sign);
    // Base stones
    const lbs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), mat());
    lbs.position.set(-1.0, -1.7, 0); g.add(lbs);
    const rbs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), mat());
    rbs.position.set(1.0, -1.7, 0); g.add(rbs);
    return g;
  }

  // 05 Stratified — 9 layers + binding rod + page details
  function makeStratified() {
    const g = new THREE.Group();
    const layers = 9;
    for (let i = 0; i < layers; i++) {
      const w = 1.7 + (Math.random() - 0.5) * 0.7;
      const layer = new THREE.Mesh(new THREE.BoxGeometry(w, 0.11, 0.85), mat());
      layer.position.y = (i - (layers - 1) / 2) * 0.27;
      layer.position.z = (Math.random() - 0.5) * 0.22;
      layer.position.x = (Math.random() - 0.5) * 0.22;
      layer.rotation.y = (Math.random() - 0.5) * 0.18;
      g.add(layer);
      // Page-edge accent
      const edge = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.03, 0.04), mat());
      edge.position.copy(layer.position);
      edge.position.z += 0.42;
      edge.position.y -= 0.02;
      edge.rotation.y = layer.rotation.y;
      g.add(edge);
    }
    // Binding rod (vertical accent through layers)
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8), mat());
    rod.position.x = -0.85;
    g.add(rod);
    return g;
  }

  // 06 Portal — frame + threshold + keystone + side pilasters + inner orb
  function makePortal() {
    const g = new THREE.Group();
    const h = 2.4, topW = 0.6, botW = 2.0;
    const len = Math.sqrt(h * h + ((botW - topW) / 2) ** 2);
    const ang = Math.atan2((botW - topW) / 2, h);
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.18, len, 0.18), mat());
    left.position.set(-(topW + botW) / 4, 0, 0);
    left.rotation.z = ang;
    g.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.18, len, 0.18), mat());
    right.position.set((topW + botW) / 4, 0, 0);
    right.rotation.z = -ang;
    g.add(right);
    const top = new THREE.Mesh(new THREE.BoxGeometry(topW + 0.2, 0.16, 0.2), mat());
    top.position.y = h / 2; g.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(botW + 0.4, 0.16, 0.22), mat());
    bot.position.y = -h / 2; g.add(bot);
    // Keystone (top center)
    const key = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 4), mat());
    key.position.y = h / 2 + 0.22; g.add(key);
    // Threshold (lower wide stone)
    const thresh = new THREE.Mesh(new THREE.BoxGeometry(botW + 0.7, 0.12, 0.35), mat());
    thresh.position.y = -h / 2 - 0.16; g.add(thresh);
    // Inner orb (light at the center of the portal)
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), mat());
    orb.position.set(0, -0.1, -0.2); g.add(orb);
    // Side pilasters
    const lpil = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.7, 0.1), mat());
    lpil.position.set(-(botW / 2 + 0.18), -0.15, 0); g.add(lpil);
    const rpil = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.7, 0.1), mat());
    rpil.position.set((botW / 2 + 0.18), -0.15, 0); g.add(rpil);
    // Perspective rays from inner orb to 4 frame corners (network from the agent core)
    const orbPos = [0, -0.1, -0.2];
    g.add(wire(orbPos, [-topW / 2, h / 2, 0]));
    g.add(wire(orbPos, [ topW / 2, h / 2, 0]));
    g.add(wire(orbPos, [-botW / 2, -h / 2, 0]));
    g.add(wire(orbPos, [ botW / 2, -h / 2, 0]));
    // Cellular density: 6 small cells inside the threshold area
    for (let i = 0; i < 6; i++) {
      g.add(cell((Math.random() - 0.5) * botW * 0.8, (Math.random() - 0.5) * h * 0.6, (Math.random() - 0.5) * 0.4, 0.07));
    }
    return g;
  }

  const shapes = {
    1: makeObelisk(),
    2: makeBrokenCube(),
    3: makeQuartered(),
    4: makeTorii(),
    5: makeStratified(),
    6: makePortal(),
  };

  // Capture each child's design position + scale once as the permanent home pose.
  function captureOriginals(shape) {
    shape.children.forEach(child => {
      child.userData.homePos = child.position.clone();
      child.userData.homeScale = child.scale.clone();
      child.userData.origPos = child.position.clone();
      child.userData.origScale = child.scale.clone();
    });
  }
  function resetShape(shape) {
    shape.children.forEach(child => {
      child.position.copy(child.userData.homePos);
      child.scale.copy(child.userData.homeScale);
      child.userData.origPos.copy(child.userData.homePos);
      child.userData.origScale.copy(child.userData.homeScale);
    });
  }
  Object.values(shapes).forEach(captureOriginals);

  let current = null;
  let incoming = null;
  let morphing = false;
  let morphRAF = null;
  let needsRender = true;            // dirty flag — render only when the scene actually changes
  const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = rmq.matches;   // live (updated on change), not read-once
  rmq.addEventListener('change', (e) => { reducedMotion = e.matches; needsRender = true; });

  function gatherPos() {
    // Tight cluster — pieces converge into a compact blob, not a spread constellation.
    return new THREE.Vector3(
      (Math.random() - 0.5) * 0.38,
      (Math.random() - 0.5) * 0.38,
      (Math.random() - 0.5) * 0.20,
    );
  }

  // Per-transition shared parameters. Set in __sculpt3D before each morph.
  // ALL pieces in the morph flow along the same shared curve direction → coherent motion.
  const transitionCurve = new THREE.Vector3();
  // Perpendicular axis for the slow flutter — micro-drift, NOT orbits (sin period > morph duration).
  const transitionFlutterDir = new THREE.Vector3();

  function startMorph(shape, leaving) {
    let i = 0;
    shape.children.forEach(child => {
      child.userData.idx = i++;
      const center = gatherPos();
      child.userData.centerPos = center;
      child.userData.designPos = child.userData.origPos.clone();
      child.userData.fullScale = child.userData.origScale.clone();
      child.userData.smallScale = child.userData.origScale.clone().multiplyScalar(0.32);
      child.userData.leaving = leaving;
      // Per-piece time stagger.
      child.userData.delay = Math.random() * 0.18;
      // Per-piece wind susceptibility — lighter "grains" drift further in the same wind.
      child.userData.windFactor = 0.75 + Math.random() * 0.5; // 0.75–1.25
      // Random phase for micro-flutter.
      child.userData.flutterPhase = Math.random() * Math.PI * 2;
      // Initial detachment kick — leaving pieces visibly loosen from rigid structure at t=0.
      if (leaving) {
        child.userData.kickOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.16,
          (Math.random() - 0.5) * 0.16,
          (Math.random() - 0.5) * 0.10,
        );
      } else {
        child.position.copy(center);
        child.scale.copy(child.userData.smallScale);
      }
    });
  }

  // easeInOutSine — the gentlest standard ease. No acceleration spike at midpoint.
  const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;
  const phase = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));

  // Tween each piece with three layered behaviors:
  //   1. Base lerp along shared curve (windFactor varies bow per piece)
  //   2. Detachment kick on leaving pieces — visible "loosening" at t=0, fades to 0 at pool
  //   3. Slow perpendicular flutter — sub-cycle (period > morph length), reads as drift not orbit
  function tweenShape(shape, t, time) {
    shape.children.forEach(child => {
      const u = child.userData;
      const d = u.delay;
      const pos = new THREE.Vector3();
      let scl;
      let pPos;
      if (u.leaving) {
        pPos = ease(phase(t, 0.00 + d, 0.45 + d));
        const pS1 = phase(t, 0.25 + d, 0.45 + d);
        const pS2 = phase(t, 0.45 + d, 0.55 + d);
        pos.copy(u.designPos).lerp(u.centerPos, pPos);
        if (pS2 > 0) {
          scl = u.smallScale.clone().lerp(new THREE.Vector3(0.001, 0.001, 0.001), pS2);
        } else {
          scl = u.fullScale.clone().lerp(u.smallScale, pS1);
        }
      } else {
        pPos = ease(phase(t, 0.55 - d, 1.00 - d));
        const pS1 = phase(t, 0.45, 0.55);
        const pS2 = phase(t, 0.55, 0.85 - d);
        pos.copy(u.centerPos).lerp(u.designPos, pPos);
        if (pS2 > 0) {
          scl = u.smallScale.clone().lerp(u.fullScale, ease(pS2));
        } else {
          scl = new THREE.Vector3(0.001, 0.001, 0.001).lerp(u.smallScale, pS1);
        }
      }

      // Layer 1: Shared curve bow, modulated by per-piece windFactor.
      const bow = Math.sin(pPos * Math.PI) * u.windFactor;
      pos.x += transitionCurve.x * bow;
      pos.y += transitionCurve.y * bow;
      pos.z += transitionCurve.z * bow;

      // Layer 2: Detachment kick — leaving pieces start displaced, kick fades as they reach pool.
      if (u.leaving && u.kickOffset) {
        const kickFade = 1 - pPos;
        pos.x += u.kickOffset.x * kickFade;
        pos.y += u.kickOffset.y * kickFade;
        pos.z += u.kickOffset.z * kickFade;
      }

      // Layer 3: Micro-flutter perpendicular to wind. Angular freq 0.75 rad/s → period ~8.4s.
      // Over a 5.2s morph, pieces complete <0.65 of a cycle — no full loop, reads as a soft drift.
      const clusterEnv = 1 - Math.min(1, Math.abs(t - 0.5) * 2.0);
      if (clusterEnv > 0) {
        const w = clusterEnv * clusterEnv;
        const flutter = Math.sin(time * 0.75 + u.flutterPhase) * 0.14 * w * u.windFactor;
        pos.x += transitionFlutterDir.x * flutter;
        pos.y += transitionFlutterDir.y * flutter;
        pos.z += transitionFlutterDir.z * flutter;
      }

      child.position.copy(pos);
      child.scale.copy(scl);
    });
  }

  function abortMorph() {
    if (!morphing) return;
    cancelAnimationFrame(morphRAF);
    morphRAF = null;
    // Snapshot the incoming shape's live positions as its new design origin
    // so the next morph starts from wherever pieces are right now.
    if (incoming) {
      incoming.children.forEach(child => {
        child.userData.origPos.copy(child.position);
        child.userData.origScale.copy(child.scale);
      });
    }
    // Remove the old leaving shape.
    if (current && current !== incoming) {
      scene.remove(current);
      resetShape(current);
      current.position.set(0, 0, 0);
    }
    // The incoming shape is now current.
    if (incoming) {
      current = incoming;
      current.position.set(0, 0, 0);
    }
    incoming = null;
    morphing = false;
  }

  window.__sculpt3D = function (n) {
    const next = shapes[n];
    if (!next || next === current) return;

    if (morphing) abortMorph();

    if (!current) {
      resetShape(next);
      scene.add(next);
      current = next;
      dom.style.opacity = '1';
      needsRender = true;
      return;
    }

    if (reducedMotion) {
      // reduced-motion: swap shapes instantly, skip the 5.2s scatter morph
      scene.remove(current);
      resetShape(current);
      resetShape(next);
      next.position.set(0, 0, 0);
      scene.add(next);
      current = next;
      incoming = null;
      needsRender = true;
      return;
    }

    morphing = true;
    incoming = next;
    transitionCurve.set(
      (Math.random() - 0.5),
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.6,
    ).normalize().multiplyScalar(0.4 + Math.random() * 0.25);
    transitionFlutterDir.copy(transitionCurve).cross(new THREE.Vector3(0, 1, 0));
    if (transitionFlutterDir.lengthSq() < 0.0001) transitionFlutterDir.set(1, 0, 0);
    transitionFlutterDir.normalize();

    resetShape(next);
    startMorph(current, true);
    startMorph(next, false);
    scene.add(next);

    const duration = 5200;
    const startT = performance.now();
    function step() {
      const elapsed = performance.now() - startT;
      const t = Math.min(1, elapsed / duration);
      const time = elapsed / 1000;
      tweenShape(current, t, time);
      tweenShape(next, t, time);
      const breathZone = 1 - Math.min(1, Math.abs(t - 0.5) * 2.0);
      if (breathZone > 0) {
        const w = breathZone * breathZone;
        const bx = Math.sin(time * 0.5) * 0.22 * w;
        const by = Math.cos(time * 0.38) * 0.17 * w;
        const bz = Math.sin(time * 0.62) * 0.09 * w;
        current.position.set(bx, by, bz);
        next.position.set(bx, by, bz);
      } else {
        current.position.set(0, 0, 0);
        next.position.set(0, 0, 0);
      }
      if (t < 1) {
        morphRAF = requestAnimationFrame(step);
      } else {
        scene.remove(current);
        resetShape(current);
        current.position.set(0, 0, 0);
        current = next;
        current.position.set(0, 0, 0);
        incoming = null;
        morphing = false;
        morphRAF = null;
      }
    }
    morphRAF = requestAnimationFrame(step);
  };

  // Initial placement
  // Place this page's configured shape instantly (cold-start, no morph). Router pages set
  // window.OOPUO.sculpture; the single-page legacy home has none → shape 1. Avoids a spurious
  // 5.2s morph (1 → page shape) that read as a blank canvas on load.
  window.__sculpt3D((window.OOPUO && window.OOPUO.sculpture) || 1);
  setTimeout(() => { dom.style.opacity = '1'; }, 250);

  // Render cadence is CAPPED. One effect.render() is not cheap: WebGL + the bloom passes, then a
  // getImageData readback, then AsciiEffect builds a ~44,000-character HTML string and assigns it
  // to innerHTML — which the browser must parse, restyle, lay out and paint. That cannot finish in
  // a 16ms budget, so asking for it every frame did not produce 60fps; it produced 7fps with long
  // tasks of 90–340ms back to back, and the whole page felt heavy because the main thread never
  // got a gap. Rendering ~30 times a second instead leaves real idle time between frames, which is
  // what makes scrolling and hover feel responsive.
  const RENDER_INTERVAL = 1000 / 30;
  // Rotation is time-based so the sculpture turns at the same visual speed whatever the cadence.
  // ROT_* are the original per-frame values expressed per millisecond at 60fps.
  const ROT_Y = 0.0055 / (1000 / 60);
  const ROT_X = 0.0017 / (1000 / 60);
  let lastRenderAt = 0, lastFrameAt = 0;

  function animate(now) {
    requestAnimationFrame(animate);
    if (document.hidden) { lastFrameAt = 0; return; }  // tab hidden → no ASCII DOM rewrite at all
    if (!now) now = performance.now();
    const dt = lastFrameAt ? Math.min(now - lastFrameAt, 100) : 0;   // clamp: a background tab
    lastFrameAt = now;                                               // must not jump the rotation

    if (!reducedMotion) {
      if (current) { current.rotation.y += ROT_Y * dt; current.rotation.x += ROT_X * dt; }
      if (incoming) { incoming.rotation.y += ROT_Y * dt; incoming.rotation.x += ROT_X * dt; }
      needsRender = true;
    }
    if (morphing) needsRender = true;   // morph animates the scene → still capped, but always dirty
    if (needsRender && now - lastRenderAt >= RENDER_INTERVAL) {
      lastRenderAt = now;
      effect.render(scene, camera);
      if (reducedMotion && !morphing) needsRender = false; // static under reduced-motion → render once, then idle
    }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) needsRender = true; });
  animate();
})();
