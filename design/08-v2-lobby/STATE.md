# Lobby v2 — Current Prototype State

**Last updated:** 2026-05-17 · End of build session.

This is the canonical state doc for the v2 lobby prototype. If anything contradicts code, **the code wins** — update this file. Pulled together so a fresh session can resume in 5 minutes instead of 30.

---

## 1. Where it lives

| File | Purpose |
|---|---|
| `public/lobby.html` | **THE prototype.** Single self-contained HTML file (~2000 lines, inline CSS + JS + Three.js module). Served by Astro dev server at `http://localhost:4321/lobby.html`. |
| `public/oopuo-logo.svg` | Black mark, 1024×544 viewBox |
| `public/oopuo-logo-white.svg` | White mark, used as favicon |
| `.claude/launch.json` | Dev server config (`npm run dev`) |

> ⚠️ Do **not** use `design/08-v2-lobby/PROTOTYPE.html` — that's a stale predecessor.

The Astro v1 site in `src/pages/` still exists separately. v1 and v2 are not yet merged.

---

## 2. Architecture

### Rendering pipeline (the sculpture)

1. **Three.js scene** with 6 procedural shape groups (one per main room), three lights (key + fill + rim), MeshLambertMaterial + emissive baseline.
2. **EffectComposer** chain: `RenderPass → UnrealBloomPass` (strength 1.4, radius 0.85, threshold 0.18). Bright pixels bleed → unified field instead of distinct silhouettes.
3. **AsciiEffect** reads the bloomed canvas, outputs a `<div>` of characters. `renderer.render` is monkey-patched to route through the composer (with re-entry guard to prevent infinite recursion).
4. **CSS layer on the AsciiEffect output:** radial gradient via `background-clip: text` colours characters by position (bright core → mid → edge fade). Drop-shadow adds glow. `filter: blur(0.9px)` softens the grid.

### Six shapes (one per main room)

| Room | Shape | Composition |
|---|---|---|
| 01 Arrival | Crystal spire | 6-element polyhedral stack + 2 orbital rings + 10 fragments + 8 cell satellites + 5 wires |
| 02 The Gap | Broken cube | Central cube + 14 shards + 6 splinters + 10 cells + 6 radiating wires |
| 03 Modules | Quartered lattice | 2×2 cubes + cross spar + 6 connecting wires + edge cells |
| 04 Studio | Torii gate | Pillars + capstones + 2 beams + sign tablet + base stones |
| 05 Blog | Stratified stack | 9 layers + binding rod + edge accents |
| 06 Invitation | Trapezoidal portal | Frame + threshold + keystone + inner orb + pilasters + 4 perspective wires |

### Morph system

- **Duration:** 5.2 seconds, easeInOutSine.
- **Three layered behaviours** per piece:
  1. Position lerp (design → cluster → design) with shared curve direction × per-piece `windFactor` (0.75–1.25).
  2. Initial detachment kick at t=0 (small random offset, fades to 0 at pool).
  3. Sub-cycle flutter perpendicular to wind (period > morph length, so pieces never complete a cycle — micro-drift, not orbits).
- **Group-level breathing:** entire cluster drifts as one body during the middle window (no per-piece chaos).
- **Per-piece stagger:** time delay 0–0.18 so pieces don't move in lock-step.

### Color system

Block-shade ramp: `' .·:;-+*░▒▓█'`. Two palette families:

| Variable | Default (rooms 1–4, 6) | Blog (room 5) |
|---|---|---|
| `--grad-0` | `#DFF7F9` cyan-white | `#F7E8D6` warm-white |
| `--grad-1` | `#67E8F9` light cyan | `#E0B080` tan |
| `--grad-2` | `#22D3EE` cyan | `#C4814A` warm orange (brand warm) |
| `--grad-3` | `#0E9FBE` deep cyan | `#8B5A2E` deep brown |
| `--teal` | `#0E9FBE` | `#C4814A` |
| `--shadow-rgb` | `34, 211, 238` | `196, 129, 74` |

All registered as `@property <color>` for transition support. Body has `transition: --grad-X 4s ease, --teal 4s ease` so palette morphs smoothly when scrolling between rooms. Nav rail + brand-mark + buttons all use `var(--teal)` → follow the same transition.

**Three layered animations on the sculpture:**

| Animation | Duration | Effect |
|---|---|---|
| `hueGlow` | 36s ease-in-out | ±10° narrow hue drift |
| `hueBreath` | 3.5s ease-in-out | ±2° micro-shimmer |
| `colorDance` | 42s ease-in-out | Gradient center drifts across viewport (55%–72% horiz, 42%–58% vert), ellipse aspect reshapes (38%–48% × 50%–62%) |

---

## 3. Navigation

- **6 main rooms** + 4 sub-rooms (Modules → Overview/Examples/Process/Pricing).
- **Snap-to-room** via wheel/touch/keyboard. Blog room (5) decouples wheel — content scrolls internally until edges, then wheel triggers room nav.
- **Direction-aware slide:** rooms `translateY(±60px)` based on scroll direction. Plus random `--room-tilt` (±0.45°) and `--room-origin-x` (20%–80%) per transition for asymmetric organic feel. Duration 1.25s/1.35s.
- **Sub-rail:** second vertical column appears when entering a module. COL 0 main rail shifts left, COL 1 slides in. Active node has spotlight glow + horizontal stick.
- **Prev/Next arrow buttons** at `bottom: 110px` inside sub-rooms.
- **HUD persistence:** brand mark + wordmark + Enterprise link + counter + section title + NEXT label all at z-index ≥ 30, untouched by morphs/transitions. Mark inverts to white on `data-theme="dark"` rooms.

### URL hash routing

Format: `#NN` for rooms, `#03/M.01/N` for sub-pages.

- `writeHash()` via `history.pushState` on every nav state change (`go`, `enterMod`, `switchSub`, `exitMod`).
- `popstate` listener restores state from hash on browser back/forward.
- On page load, `restoreFromHash()` runs 160ms after initial paint to navigate to the deep-linked state.
- `restoringHash` flag prevents history pollution during programmatic restoration.

Shareable URLs work. Cmd+R preserves state. Browser back/forward traverses navigation history.

---

## 4. Blog (room 5) — editorial ambience

- **Page background unchanged** — same `#F0F2F6` as other rooms. The ambience switch is sculpture-color-only (`--grad-*` + `--teal` shift to warm family via `body[data-room="5"]`).
- **Editorial typography:** Instrument Serif italic for `<h1 class="blog-title">`, mono uppercase for dates/categories, sans for body.
- **Layout:** large "Blog" title → pill filter row → horizontal rule → text-only featured post → 3-column grid of cards (subtle bg-surface heroes with category glyph).
- **HUD backdrop:** top 84px gets `backdrop-filter: blur(14px)` so content scrolls cleanly under without overlapping HUD elements.
- **Internal scroll** in the room itself (`overflow-y: auto`), wheel handler defers to internal scroll first.

---

## 5. HUD

| Element | Position | Size |
|---|---|---|
| Brand mark | Top-left, in `.tl` | 124×66px |
| "OOPUO" wordmark | Inline with mark | 36px Instrument Sans 700 |
| Enterprise link | Top-right `.ent` | 10.5px mono, right-divider |
| Counter | Top-right `.tr` | 10.5px mono, current+total |
| Section title | Top-center, `.section-title` | 12px mono with teal tick above |
| NEXT label | Bottom-right `.br` | 10.5px mono with arrow |

---

## 6. What works

- 6 main rooms + 4 Modules sub-pages
- Sculpture morph between any two shapes (continuous rotation across morph)
- Smooth 4s palette transitions on room change (sculpture + nav rail + brand dot together)
- Mouse wheel, arrow keys, touch swipe, ball clicks
- Sub-page nav via col1 balls, prev/next arrows, or up/down arrow keys
- URL hash sync + browser back/forward + Cmd+R state preservation
- HUD persistence + theme inversion
- `prefers-reduced-motion` support
- Tab favicon (white logo) + browser tab title

---

## 7. Known issues / TBD

### Bugs
- **Morph abort on fast scroll** (UNFIXED, planned): when user scrolls quickly between rooms, the in-flight morph completes to the *previous* target before starting the queued one. User briefly sees wrong sculpture for their room. Architecture change needed: cancel `requestAnimationFrame` + capture live piece positions as new `fromPos` + re-target. ~30–40 lines of touchy code in the morph state machine. Planned for next session.

### Stubs (not yet wired)
- Module M.02, M.03, M.04 sub-pages (Examples, Process, Pricing) — only show generic placeholder. Only Websites has all 4 with real content.
- Blog post reading view — cards are clickable visual placeholders, no actual post pages.
- Pill category filters — visual only, no filtering logic.
- Enterprise link — `href="#enterprise"`, no destination page.
- All contact CTAs ("Book a free call", "Send a message") — no handlers.

### Production gaps
- No real URLs for blog posts (currently single-page hash routing only). SEO-blocking.
- Astro v1 site (`src/pages/`) and v2 prototype not merged. Need to decide migration path before launch.
- Logo favicon wide aspect (1.88:1) gets letterboxed in square tab-icon space — consider a square-cropped variant.
- Performance on low-end hardware not benchmarked (Three.js + bloom + ASCII is heavy on mobile).

---

## 8. File map for the lobby v2

```
public/
  lobby.html               ← THE PROTOTYPE
  oopuo-logo.svg           ← black mark
  oopuo-logo-white.svg     ← white mark (favicon)
  robots.txt
  ... (Astro v1 static assets)

design/08-v2-lobby/
  STATE.md                 ← THIS FILE (canonical state)
  MOODBOARD.md             ← original Japanese-minimal vision (still valid in spirit)
  REFERENCES.md            ← research refs (Vercel, Severance, etc., still valid)
  GRAPH.md                 ← site graph + multi-column nav schema (still valid)
  WIREFRAMES.md            ← ⚠ STALE — design diverged, kept for archive
  INTERACTIONS.md          ← ⚠ STALE — completely different morph system now
  PROTOTYPE.html           ← ⚠ STALE — DO NOT USE; live version is public/lobby.html
```

---

## 9. How to resume

1. Run `npm run dev` (or use `.claude/launch.json` → Astro Dev).
2. Open `http://localhost:4321/lobby.html`.
3. All edits to the prototype go in `public/lobby.html`. Single file, inline everything.
4. The Three.js module is at the bottom of the file (`<script type="module">`).
5. The main IIFE for navigation/state is in the inline `<script>` above it.

**Top priorities for next session** (in order):
1. Morph abort fix (architectural — see §7).
2. Wire blog post reading view (currently stub).
3. Decide v1 vs v2 production direction. Either:
   - Port lobby into Astro pages (proper URLs, SEO, View Transitions API)
   - Or commit to single-file lobby + add per-route static HTML files
