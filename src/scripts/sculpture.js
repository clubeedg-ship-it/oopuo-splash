// OOPUO sculpture engine — ported verbatim from the design canvas (public/lobby.html).
// Renders one of six procedural Three.js shapes through a bloom + ASCII pipeline into
// #sculpture. Palette/colour is driven entirely by CSS (body[data-room] + --grad-* vars);
// this module only handles geometry, morphing, and rotation.
//
// Public API: window.__sculpt3D(n)  — morph to shape n (1–6).
// The module is a persistent View-Transitions island: it initialises once and keeps
// running across Astro page swaps. The Layout updates body[data-room] + calls __sculpt3D
// on navigation (see Sculpture.astro).

import * as THREE from 'three';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function initSculpture() {
  const container = document.getElementById('sculpture');
  if (!container) return;
  // Guard: only mount the engine once, even if the script re-evaluates.
  if (container.dataset.mounted === '1') return;
  container.dataset.mounted = '1';

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

  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 1);

  // Bloom post-process: bright pixels bleed into surrounding pixels BEFORE AsciiEffect samples,
  // so distinct 3D objects merge into one continuous lit field.
  const composer = new EffectComposer(renderer);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(W, H), 1.4, 0.85, 0.18);
  composer.addPass(bloomPass);

  // Hijack renderer.render → route through the composer when called from outside (AsciiEffect),
  // but use the ORIGINAL render when called from inside (RenderPass needs the raw render).
  const origRender = renderer.render.bind(renderer);
  let viaComposer = false;
  renderer.render = function (s, c) {
    if (viaComposer) {
      origRender(s, c);
    } else {
      viaComposer = true;
      composer.render();
      viaComposer = false;
    }
  };

  // Cellular ramp: soft dots at the dim end (mist), block chars at the bright end (cells).
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
    composer.setSize(W, H);
    bloomPass.setSize(W, H);
    effect.setSize(W, H);
  }
  window.addEventListener('resize', handleResize);

  // Lambert: no specular highlights = no hard bright "panel" hotspots on each object.
  const mat = () => new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x2a2a2a });
  const lineMat = () => new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  function wire(p1, p2) {
    const a = Array.isArray(p1) ? new THREE.Vector3(p1[0], p1[1], p1[2]) : p1;
    const b = Array.isArray(p2) ? new THREE.Vector3(p2[0], p2[1], p2[2]) : p2;
    const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
    return new THREE.Line(geom, lineMat());
  }
  function cell(x, y, z, size = 0.1) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat());
    c.position.set(x, y, z);
    c.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    return c;
  }

  // 01 Faceted crystalline spire
  function makeObelisk() {
    const g = new THREE.Group();
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
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.025, 6, 64), mat());
    r1.rotation.x = Math.PI / 2.2;
    g.add(r1);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.02, 6, 64), mat());
    r2.rotation.x = Math.PI / 1.7;
    r2.rotation.z = Math.PI / 6;
    g.add(r2);
    for (let i = 0; i < 10; i++) {
      const frag = new THREE.Mesh(new THREE.TetrahedronGeometry(0.09 + Math.random() * 0.1), mat());
      const t = (i / 10) * Math.PI * 2 + Math.random() * 0.3;
      const r = 2.3 + Math.random() * 0.5;
      const p = (Math.random() - 0.5) * 0.8;
      frag.position.set(r * Math.cos(t), p, r * Math.sin(t));
      frag.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      g.add(frag);
    }
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const r = 1.4 + Math.random() * 0.5;
      g.add(cell(r * Math.cos(t), -0.6 + Math.random() * 1.6, r * Math.sin(t), 0.09));
    }
    for (let i = 0; i < stack.length - 1; i++) {
      g.add(wire([0, stack[i].y, 0], [0, stack[i + 1].y, 0]));
    }
    return g;
  }

  // 02 Broken cube
  function makeBrokenCube() {
    const g = new THREE.Group();
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), mat());
    g.add(cube);
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
    for (let i = 0; i < 6; i++) {
      const splinter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.9 + Math.random() * 0.6), mat());
      const t = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
      const p = (Math.random() - 0.5) * Math.PI * 0.6;
      const r = 1.7;
      splinter.position.set(r * Math.cos(t) * Math.cos(p), r * Math.sin(p), r * Math.sin(t) * Math.cos(p));
      splinter.lookAt(0, 0, 0);
      g.add(splinter);
    }
    for (let i = 0; i < 10; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = (Math.random() - 0.5) * Math.PI;
      const r = 1.5 + Math.random() * 1.6;
      g.add(cell(r * Math.cos(t) * Math.cos(p), r * Math.sin(p), r * Math.sin(t) * Math.cos(p), 0.08 + Math.random() * 0.05));
    }
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 2 * (i / 6);
      const r = 1.9;
      g.add(wire([0, 0, 0], [r * Math.cos(a), (Math.random() - 0.5) * 1.4, r * Math.sin(a)]));
    }
    return g;
  }

  // 03 Quartered lattice
  function makeQuartered() {
    const g = new THREE.Group();
    const sz = 0.7, gap = 0.22;
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), mat());
      c.position.set((x - 0.5) * (sz + gap), (y - 0.5) * (sz + gap), 0);
      g.add(c);
      const inner = new THREE.Mesh(new THREE.BoxGeometry(sz * 0.4, sz * 0.4, sz * 0.4), mat());
      inner.position.set((x - 0.5) * (sz + gap), (y - 0.5) * (sz + gap), -0.5);
      g.add(inner);
    }
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.85, 0.08), mat());
    g.add(v);
    const h = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 0.08), mat());
    g.add(h);
    const z = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.4), mat());
    g.add(z);
    const frameSize = 1.0;
    for (let dx of [-1, 1]) for (let dy of [-1, 1]) for (let dz of [-1, 1]) {
      const corner = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), mat());
      corner.position.set(dx * frameSize, dy * frameSize, dz * frameSize * 0.6);
      g.add(corner);
    }
    const cells4 = [
      [-0.5 * (sz + gap), -0.5 * (sz + gap), 0],
      [ 0.5 * (sz + gap), -0.5 * (sz + gap), 0],
      [ 0.5 * (sz + gap),  0.5 * (sz + gap), 0],
      [-0.5 * (sz + gap),  0.5 * (sz + gap), 0],
    ];
    g.add(wire(cells4[0], cells4[2]));
    g.add(wire(cells4[1], cells4[3]));
    g.add(wire(cells4[0], cells4[1]));
    g.add(wire(cells4[1], cells4[2]));
    g.add(wire(cells4[2], cells4[3]));
    g.add(wire(cells4[3], cells4[0]));
    for (let i = 0; i < cells4.length; i++) {
      const a = cells4[i];
      const b = cells4[(i + 1) % cells4.length];
      g.add(cell((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0, 0.08));
    }
    return g;
  }

  // 04 Torii
  function makeTorii() {
    const g = new THREE.Group();
    const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 2.8, 8), mat());
    lp.position.set(-1.0, -0.2, 0); g.add(lp);
    const rp = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 2.8, 8), mat());
    rp.position.set(1.0, -0.2, 0); g.add(rp);
    const lc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.12, 8), mat());
    lc.position.set(-1.0, 1.26, 0); g.add(lc);
    const rc = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.12, 8), mat());
    rc.position.set(1.0, 1.26, 0); g.add(rc);
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.32), mat());
    top.position.y = 1.5; g.add(top);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 0.34), mat());
    trim.position.y = 1.62; g.add(trim);
    const lower = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.13, 0.24), mat());
    lower.position.y = 1.08; g.add(lower);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.06), mat());
    sign.position.y = 1.29; g.add(sign);
    const lbs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), mat());
    lbs.position.set(-1.0, -1.7, 0); g.add(lbs);
    const rbs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), mat());
    rbs.position.set(1.0, -1.7, 0); g.add(rbs);
    return g;
  }

  // 05 Stratified
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
      const edge = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.03, 0.04), mat());
      edge.position.copy(layer.position);
      edge.position.z += 0.42;
      edge.position.y -= 0.02;
      edge.rotation.y = layer.rotation.y;
      g.add(edge);
    }
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8), mat());
    rod.position.x = -0.85;
    g.add(rod);
    return g;
  }

  // 06 Portal
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
    const keystone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 4), mat());
    keystone.position.y = h / 2 + 0.22; g.add(keystone);
    const thresh = new THREE.Mesh(new THREE.BoxGeometry(botW + 0.7, 0.12, 0.35), mat());
    thresh.position.y = -h / 2 - 0.16; g.add(thresh);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), mat());
    orb.position.set(0, -0.1, -0.2); g.add(orb);
    const lpil = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.7, 0.1), mat());
    lpil.position.set(-(botW / 2 + 0.18), -0.15, 0); g.add(lpil);
    const rpil = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.7, 0.1), mat());
    rpil.position.set((botW / 2 + 0.18), -0.15, 0); g.add(rpil);
    const orbPos = [0, -0.1, -0.2];
    g.add(wire(orbPos, [-topW / 2, h / 2, 0]));
    g.add(wire(orbPos, [ topW / 2, h / 2, 0]));
    g.add(wire(orbPos, [-botW / 2, -h / 2, 0]));
    g.add(wire(orbPos, [ botW / 2, -h / 2, 0]));
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

  function gatherPos() {
    return new THREE.Vector3(
      (Math.random() - 0.5) * 0.38,
      (Math.random() - 0.5) * 0.38,
      (Math.random() - 0.5) * 0.20,
    );
  }

  const transitionCurve = new THREE.Vector3();
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
      child.userData.delay = Math.random() * 0.18;
      child.userData.windFactor = 0.75 + Math.random() * 0.5;
      child.userData.flutterPhase = Math.random() * Math.PI * 2;
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

  const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;
  const phase = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));

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

      const bow = Math.sin(pPos * Math.PI) * u.windFactor;
      pos.x += transitionCurve.x * bow;
      pos.y += transitionCurve.y * bow;
      pos.z += transitionCurve.z * bow;

      if (u.leaving && u.kickOffset) {
        const kickFade = 1 - pPos;
        pos.x += u.kickOffset.x * kickFade;
        pos.y += u.kickOffset.y * kickFade;
        pos.z += u.kickOffset.z * kickFade;
      }

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
    if (incoming) {
      incoming.children.forEach(child => {
        child.userData.origPos.copy(child.position);
        child.userData.origScale.copy(child.scale);
      });
    }
    if (current && current !== incoming) {
      scene.remove(current);
      resetShape(current);
      current.position.set(0, 0, 0);
    }
    if (incoming) {
      current = incoming;
      current.position.set(0, 0, 0);
    }
    incoming = null;
    morphing = false;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.__sculpt3D = function (n) {
    const next = shapes[n];
    if (!next || next === current) return;

    if (morphing) abortMorph();

    // First placement, or reduced-motion: snap instantly (no morph).
    if (!current || reducedMotion) {
      if (current && current !== next) { scene.remove(current); resetShape(current); current.position.set(0, 0, 0); }
      resetShape(next);
      scene.add(next);
      current = next;
      current.position.set(0, 0, 0);
      dom.style.opacity = '1';
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

  // Initial placement — room comes from <body data-room>, default 1.
  const initialRoom = parseInt(document.body.dataset.room || '1', 10) || 1;
  window.__sculpt3D(initialRoom);
  setTimeout(() => { dom.style.opacity = '1'; }, 250);

  function animate() {
    requestAnimationFrame(animate);
    if (!reducedMotion) {
      if (current) { current.rotation.y += 0.0055; current.rotation.x += 0.0017; }
      if (incoming) { incoming.rotation.y += 0.0055; incoming.rotation.x += 0.0017; }
    }
    effect.render(scene, camera);
  }
  animate();
}

// Init now if the DOM is ready, else on DOMContentLoaded. The container persists across
// Astro View Transitions (transition:persist), so this only mounts once.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSculpture, { once: true });
} else {
  initSculpture();
}
