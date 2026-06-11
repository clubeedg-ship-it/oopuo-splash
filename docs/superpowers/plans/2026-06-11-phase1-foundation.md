# Phase 1 — Shared Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the ~2,000-line engine that is copy-pasted into all 4 locale files into ONE shared `assets/` set (CSS + JS + self-hosted fonts + self-hosted three.js), driven by a tiny per-page `window.OOPUO` config — **with the on-screen experience byte-for-byte identical to today** — and remove the dead code, the GDPR-exposed third-party CDNs, and the reduced-motion / a11y defects flagged in the audit.

**Architecture:** The 4 pages stay single-page snap-scroll canvases (no routing yet — that's Phase 2). Each page keeps only its own *content* DOM + a small `window.OOPUO` config block, and `<link>`s/`<script>`s the shared assets. The engine is unchanged logic, just relocated and parameterised. This is a **refactor, not a redesign**: every task ends with a visual/behavioural equivalence check before commit.

**Tech Stack:** Plain static HTML/CSS/JS, no build. Shared files under `public_html/assets/`. Fonts self-hosted as woff2 (`google-webfonts-helper` or direct download). three@0.160.0 vendored as the minified module build + addons. Verification: local `python3 -m http.server 4330`, Playwright/preview screenshots for visual equivalence, `preview_network` to prove third-party origins are gone, `preview_eval` for behaviour.

**Why (audit refs, PROJECT.md §C.1):** the engine is 99.95% identical across files (one divergent line, `LABELS`) — so every fix today must be applied 4× and drift is already happening (the NL/FR HubSpot divergence). Google Fonts + unpkg load from third-party CDNs on every page (LG München I GDPR exposure for an EU-compliance vendor; unminified ~1.2 MB three.js + 9-request waterfall, no SRI/fallback). `prefers-reduced-motion` stops rotation but not the 5.2 s morph (the CLAUDE.md §5 invariant is currently false). Hidden rooms are `opacity:0` only → a11y-tree/tab pollution; `--ink-faint` is 2.7:1. ~180 lines of dead `__dead_oldShapes` ship 4×.

**Hard constraints:**
- **UX identical.** If a task changes the look or feel beyond the explicitly-intended fixes (localised `— END`, reduced-motion, focus rings, contrast), it's wrong — revert and re-do.
- **No build step.** Self-hosting = a one-time file copy + relative paths. No bundler, no npm.
- **Track separation (D-018).** The shared engine must not embed Europe-only or Brazil-only content; per-page config + per-page DOM keep the tracks apart. `window.OOPUO.track` gates which integrations a page may load.
- **Keep current palette behaviour in Phase 1.** The warm family is bound to `body[data-room="5"]` in the shared CSS today (so pt-br room 5 "Como funciona" also goes warm). Leave that exactly as-is here; page-level palette config is a Phase 2 concern (when rooms become pages).
- **Preserve the inert placeholders from Phase 0** (Meta Pixel commented; NL/FR guarded form; mailto CTAs). Do not re-activate anything.

---

## File Structure

| File | Responsibility |
|---|---|
| `public_html/assets/css/canvas.css` | The entire shared `<style>` block (EN lines 39–887) verbatim + the room-6 `.hs-form-wrap` rules + new `@font-face` + a11y additions |
| `public_html/assets/js/engine.js` | The classic boot script (EN 1343–1941) minus `__dead_oldShapes`, reading locale strings/flags from `window.OOPUO` |
| `public_html/assets/js/sculpture.js` | The `<script type="module">` three.js/ASCII engine (EN 1951–2555) verbatim, importmap repointed to self-hosted three |
| `public_html/assets/fonts/` | Self-hosted woff2: Instrument Sans (400/500/600/700), Instrument Serif (regular+italic), JetBrains Mono (400/500) |
| `public_html/assets/vendor/three/` | Minified three@0.160.0 `three.module.min.js` + the 9 addon/dep files used by the importmap |
| each `public_html/**/index.html` | Keeps its content DOM; gains a `window.OOPUO` config block; `<link>`s canvas.css; `<script>`s engine.js + sculpture.js; loses ~1,900 inline lines |

**`window.OOPUO` schema (defined inline on each page, before engine.js):**
```js
window.OOPUO = {
  locale: 'en',                 // 'en' | 'nl' | 'fr' | 'pt-br'
  track: 'europe',              // 'europe' | 'brazil' — gates integrations
  labels: {
    rooms: ["Arrival","The Gap","Modules","Studio","Blog","Invitation"],   // was the divergent LABELS line
    modules: ["Websites","AI Support","Automation","Integrations"],
    subs: ["Overview","Examples","Process","Pricing"],
    end: "— END", prev: "PREV", next: "NEXT"
  },
  integrations: { hubspotFormId: null, whatsapp: null }   // metaPixelId stays the commented-out placeholder for now
};
```
Per locale: NL `end:"— EINDE"`, FR `end:"— FIN"`, pt-br `end:"— FIM"` (fixes the audit's untranslated `— END`). The engine reads `window.OOPUO.labels.*` with the current English arrays as fallback so nothing breaks if a page omits config.

---

### Task 1: Extract the shared stylesheet to `assets/css/canvas.css`

**Files:**
- Create: `public_html/assets/css/canvas.css`
- Modify: `public_html/index.html` (remove `<style>` 39–887 + room-6 `<style>` 1036–1043; add one `<link>`)
- Modify: `public_html/nl/index.html`, `public_html/fr/index.html`, `public_html/pt-br/index.html` (same)

The `<style>` block is byte-identical across all 4 files (audit: 847/847). The EN room-6 `.hs-form-wrap` rules (and the identical ones now on NL/FR after Phase 0) fold into the same sheet. pt-br has no room-6 form styles — harmless to inherit unused rules.

- [ ] **Step 1: Capture the baseline (visual equivalence reference)**

Run the server (`python3 -m http.server 4330 --directory public_html`). Screenshot `/`, `/nl/`, `/fr/`, `/pt-br/` at the hero (room 1). Save as the before-reference. These are the diff targets for every later task.

- [ ] **Step 2: Create `assets/css/canvas.css` from EN's `<style>` block**

Copy EN `index.html` lines **40–886** (the content between `<style>` and `</style>`) verbatim into `public_html/assets/css/canvas.css`. Append the room-6 form rules (from EN 1037–1042):
```css
/* contact room (room 6) form layout — extracted from inline room-6 <style> */
.room[data-room="6"]{align-items:start;align-content:start;overflow-y:auto;scrollbar-width:none}
.room[data-room="6"]::-webkit-scrollbar{display:none}
.room[data-room="6"] .room-inner{padding-top:92px;padding-bottom:72px}
.hs-form-wrap{width:100%;max-width:560px;margin-top:28px}
.hs-form-frame{display:block;width:100%}
.hs-form-frame iframe{width:100% !important;min-height:520px;border:0;background:transparent;display:block}
```
> ⚠️ The EN room-6 override (`align-items:start; overflow-y:auto`) currently only exists on EN. Putting it in the shared sheet applies it to NL/FR/pt-br room 6 too. NL/FR room 6 now has the mailto + inert form (Phase 0), so top-aligned scroll is fine and matches EN. pt-br room 6 ("Convite") has no form — verify in Step 6 that top-aligning it doesn't look wrong; if it does, scope this override with `body[data-track="europe"]` (set `data-track` on `<html>` per page) instead of removing it.

- [ ] **Step 3: Replace the inline `<style>` with a `<link>` (all 4 pages)**

In each page, delete the entire `<style> … </style>` head block and replace with:
```html
<link rel="stylesheet" href="/assets/css/canvas.css">
```
(EN/NL/FR also delete their room-6 inline `<style> … </style>` — its rules now live in canvas.css. pt-br has none.)

- [ ] **Step 4: Verify no inline style blocks remain**

Run: `grep -c '<style>' public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html`
Expected: `0` for all 4.
Run: `test -f public_html/assets/css/canvas.css && wc -l public_html/assets/css/canvas.css`
Expected: ~853 lines.

- [ ] **Step 5: Verify the stylesheet loads**

Reload `/`; `preview_network` shows `GET /assets/css/canvas.css → 200`. `preview_console_logs` error-free.

- [ ] **Step 6: Visual equivalence check (all 4 locales)**

Screenshot `/`, `/nl/`, `/fr/`, `/pt-br/` hero + (drive to) room 6. Compare against Step 1 baseline — must be pixel-identical (fonts, colours, sculpture, HUD, spacing). Specifically confirm pt-br room 6 is not visually broken by the inherited room-6 override (see Step 2 warning).

- [ ] **Step 7: Commit**

```bash
git add public_html/assets/css/canvas.css public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html
git commit -m "refactor(css): extract shared <style> to assets/css/canvas.css (Phase 1)

847-line style block was copy-pasted into all 4 locale files (byte-identical).
Now one shared sheet linked by every page; room-6 form rules folded in. No
visual change (verified pixel-identical on all 4 locales). Refs D-025 §C.6."
```

---

### Task 2: Extract the three.js module to `assets/js/sculpture.js`

**Files:**
- Create: `public_html/assets/js/sculpture.js`
- Modify: all 4 pages (replace the inline `<script type="module"> … </script>` with a `src=` module script)

The module (EN 1951–2555, the `import * as THREE` … `window.__sculpt3D` engine) is byte-identical across files (audit: 603/603). It must stay `type="module"` and load AFTER the importmap (which stays inline — importmaps can't be external).

- [ ] **Step 1: Create `assets/js/sculpture.js`**

Copy EN `index.html` lines **1952–2554** (between `<script type="module">` and `</script>`) verbatim into `public_html/assets/js/sculpture.js`.

- [ ] **Step 2: Replace inline module with external (all 4 pages)**

Replace the inline `<script type="module"> … </script>` block with:
```html
<script type="module" src="/assets/js/sculpture.js"></script>
```
Keep the `<script type="importmap"> … </script>` immediately before it, unchanged (still pointing at unpkg — Task 5 repoints it to self-hosted).

- [ ] **Step 3: Verify**

Run: `grep -c 'type="module"' public_html/index.html` → `1`; `grep -c 'window.__sculpt3D' public_html/index.html` → `0` (moved out).
Run: `test -f public_html/assets/js/sculpture.js && grep -c 'window.__sculpt3D' public_html/assets/js/sculpture.js` → ≥1.

- [ ] **Step 4: Behaviour check**

Reload `/`. `preview_eval`: `!!window.__sculpt3D` → true; the ASCII sculpture renders and rotates. Repeat on `/nl/`, `/pt-br/`. `preview_console_logs` error-free (watch for module/importmap resolution errors).

- [ ] **Step 5: Commit**

```bash
git add public_html/assets/js/sculpture.js public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html
git commit -m "refactor(js): extract three.js/ASCII module to assets/js/sculpture.js (Phase 1)

603-line module was identical in all 4 files. Now one shared module script.
importmap stays inline (repointed to self-hosted three in a later task). No
behaviour change (sculpture renders + rotates on all 4). Refs D-025 §C.6."
```

---

### Task 3: Extract the boot script to `assets/js/engine.js`, drop dead code, add `window.OOPUO`

**Files:**
- Create: `public_html/assets/js/engine.js`
- Modify: all 4 pages (add `window.OOPUO` config; replace the inline boot `<script>` with `src=`; delete the hardcoded `LABELS` line by sourcing it from config)

The boot script (EN 1343–1941) is identical except line 1346 (`LABELS`). It contains `__dead_oldShapes` (1402–1580, ~178 lines, never called) which must NOT be carried into the shared file.

- [ ] **Step 1: Create `assets/js/engine.js` from the boot script, minus dead code**

Copy EN `index.html` lines **1344–1940** (between the boot `<script>` and `</script>`) into `public_html/assets/js/engine.js`, **omitting lines 1402–1580** (`function __dead_oldShapes() { … } // end __dead_oldShapes`).

Also (separately, in EN `index.html` DOM, not the engine): delete the unreachable **"Coming soon" stub sub-room** markup (the `.sub-room` block whose content is the stub — `HAS_CONTENT` marks all 16 real sub-rooms true, so the stub is dead). Grep `grep -n "Coming soon\|stub" public_html/index.html` to locate it. Note: the enterprise/blog/sub-room JS handlers that the audit called "inert lean-page scaffolding shipped 4×" are **automatically de-duplicated** by this extraction — they now live once in the shared `engine.js` (still null-guarded on lean pages), so no separate removal is needed; that was a duplication problem, which sharing solves.

- [ ] **Step 2: Source locale strings from `window.OOPUO` (replace the hardcoded line)**

In `engine.js`, replace the hardcoded:
```js
const LABELS = ["Arrival", "The Gap", "Modules", "Studio", "Blog", "Invitation"];
```
with config-sourced values (English arrays as fallback so the engine is self-contained if a page omits config):
```js
var CFG = (window.OOPUO || {});
var CFGL = (CFG.labels || {});
const LABELS = CFGL.rooms || ["Arrival", "The Gap", "Modules", "Studio", "Blog", "Invitation"];
const MODULE_LABELS = CFGL.modules || ["Websites", "AI Support", "Automation", "Integrations"];
const SUB_LABELS = CFGL.subs || ["Overview", "Examples", "Process", "Pricing"];
const END_LABEL = CFGL.end || "— END";
```
Then find the existing `MODULE_LABELS` / `SUB_LABELS` declarations in the copied boot code and delete those now-duplicate `const` lines (config-sourced versions above replace them). Find the `'— END'` literal (in `paintTop`, the `nextEl.textContent = '— END'` assignment) and replace the literal with `END_LABEL`.

- [ ] **Step 3: Add `window.OOPUO` to each page, before the engine script**

Immediately before where the boot `<script>` was, insert per page (EN shown; localise `end` per locale, set `track`):
```html
<script>
window.OOPUO = {
  locale: 'en', track: 'europe',
  labels: {
    rooms: ["Arrival","The Gap","Modules","Studio","Blog","Invitation"],
    modules: ["Websites","AI Support","Automation","Integrations"],
    subs: ["Overview","Examples","Process","Pricing"],
    end: "— END", prev: "PREV", next: "NEXT"
  }
};
</script>
<script src="/assets/js/engine.js"></script>
```
- NL `rooms`: `["Aankomst","De Kloof","Modules","Studio","Aanpak","Uitnodiging"]`, `end:"— EINDE"`, `locale:'nl'`.
- FR `rooms`: `["Arrivée","Le Fossé","Modules","Studio","Approche","Invitation"]`, `end:"— FIN"`, `locale:'fr'`.
- pt-br `rooms`: `["Início","A Lacuna","Soluções","Estúdio","Como funciona","Convite"]`, `track:'brazil'`, `end:"— FIM"`, `locale:'pt-br'`.
  (Use each page's CURRENT `LABELS` array as the source of truth for `rooms` — copy from the file's existing line 1346-equivalent before deleting it.)

- [ ] **Step 4: Verify dead code gone + engine wired**

Run: `grep -c '__dead_oldShapes' public_html/index.html public_html/assets/js/engine.js` → `0` for both.
Run: `grep -c 'window.OOPUO' public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html` → ≥1 each.
Run: `grep -c "const LABELS" public_html/index.html` → `0` (moved to config/engine).

- [ ] **Step 5: Behaviour equivalence (all 4)**

Reload each locale. Verify via `preview_eval` + screenshots: snap-scroll wheel/keyboard works; HUD counter increments; room titles match the locale `rooms`; the next-label shows the localised `end` on the last room (NL "— EINDE", pt-br "— FIM" — the audit bug is now fixed); EN sub-rooms/blog/enterprise still open. `preview_console_logs` error-free on all 4.

- [ ] **Step 6: Commit**

```bash
git add public_html/assets/js/engine.js public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html
git commit -m "refactor(js): extract boot to assets/js/engine.js + window.OOPUO config (Phase 1)

597-line boot was identical bar one line (LABELS). Now one shared engine
driven by per-page window.OOPUO (locale strings + track). Dropped ~178 lines
of dead __dead_oldShapes (never called). Localised the HUD end-label
(— EINDE/FIN/FIM) — fixes the untranslated '— END' audit bug. Behaviour
verified identical on all 4 locales. Refs D-025 §C.6."
```

---

### Task 4: Self-host fonts; drop the Google Fonts CDN

**Files:**
- Create: `public_html/assets/fonts/*.woff2` + `@font-face` block in `canvas.css`
- Modify: all 4 pages (remove the 3 Google Fonts `<link>`s + preconnects)

Removes the LG München I GDPR exposure (visitor IPs to Google) — material for an EU-AI-Act-credibility brand — and the render-blocking cross-origin stylesheet. All three families are OFL.

- [ ] **Step 1: Download the woff2 files**

Fetch the woff2 subsets (latin) for: Instrument Sans 400/500/600/700, Instrument Serif 400 + 400-italic, JetBrains Mono 400/500 — via `google-webfonts-helper` (https://gwfh.mranftl.com/fonts) or directly from the URLs the current `fonts.gstatic.com` requests resolve to (capture them from `preview_network` on the live page). Save into `public_html/assets/fonts/` with clear names, e.g. `instrument-sans-600.woff2`.

- [ ] **Step 2: Add `@font-face` to the top of `canvas.css`**

```css
@font-face{font-family:'Instrument Sans';font-weight:400;font-style:normal;font-display:swap;src:url('/assets/fonts/instrument-sans-400.woff2') format('woff2')}
@font-face{font-family:'Instrument Sans';font-weight:500;font-style:normal;font-display:swap;src:url('/assets/fonts/instrument-sans-500.woff2') format('woff2')}
@font-face{font-family:'Instrument Sans';font-weight:600;font-style:normal;font-display:swap;src:url('/assets/fonts/instrument-sans-600.woff2') format('woff2')}
@font-face{font-family:'Instrument Sans';font-weight:700;font-style:normal;font-display:swap;src:url('/assets/fonts/instrument-sans-700.woff2') format('woff2')}
@font-face{font-family:'Instrument Serif';font-weight:400;font-style:normal;font-display:swap;src:url('/assets/fonts/instrument-serif-400.woff2') format('woff2')}
@font-face{font-family:'Instrument Serif';font-weight:400;font-style:italic;font-display:swap;src:url('/assets/fonts/instrument-serif-400-italic.woff2') format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:400;font-style:normal;font-display:swap;src:url('/assets/fonts/jetbrains-mono-400.woff2') format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:500;font-style:normal;font-display:swap;src:url('/assets/fonts/jetbrains-mono-500.woff2') format('woff2')}
```

- [ ] **Step 3: Remove the Google Fonts links + preconnects (all 4 pages)**

Delete from each head:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```
Optionally add a preload for the two above-the-fold faces in each head:
```html
<link rel="preload" href="/assets/fonts/instrument-sans-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jetbrains-mono-500.woff2" as="font" type="font/woff2" crossorigin>
```

- [ ] **Step 4: Verify no Google origins**

Run: `grep -rc 'fonts.googleapis.com\|fonts.gstatic.com' public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html` → `0` each.
Reload `/`; `preview_network` shows **no** `fonts.gstatic.com` / `fonts.googleapis.com` requests, and `GET /assets/fonts/*.woff2 → 200`.

- [ ] **Step 5: Visual check — fonts unchanged**

Screenshot hero + a blog reader (Instrument Serif italic) on EN; compare to Task 1 baseline. Headings (Instrument Sans), mono HUD (JetBrains Mono), blog titles (Instrument Serif) must look identical. No FOIT (font-display:swap).

- [ ] **Step 6: Commit**

```bash
git add public_html/assets/fonts public_html/assets/css/canvas.css public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html
git commit -m "perf/privacy: self-host fonts; drop Google Fonts CDN (Phase 1)

Google Fonts loaded from Google's CDN on every page (LG München I GDPR
exposure — visitor IPs to Google; bad for an EU-AI-Act brand) and was a
render-blocking cross-origin request. Now woff2 in assets/fonts/ via
@font-face (font-display:swap) + preload of the 2 above-the-fold faces.
Verified: no Google origins, fonts visually identical. Refs D-025 §C.5/§C.6."
```

---

### Task 5: Self-host minified three.js; repoint the importmap

**Files:**
- Create: `public_html/assets/vendor/three/` (the module build + addons)
- Modify: all 4 pages (importmap → relative paths; add modulepreload)

Removes the unpkg single-point-of-failure, the ~1.2 MB **unminified** payload, the 9-request waterfall, and the no-SRI third-party-script risk on a site that sells security credibility. Same-origin makes SRI moot.

- [ ] **Step 1: Vendor the files**

Download three@0.160.0 into `public_html/assets/vendor/three/`:
- `build/three.module.min.js`
- `examples/jsm/effects/AsciiEffect.js`
- `examples/jsm/postprocessing/{EffectComposer,RenderPass,UnrealBloomPass,ShaderPass,MaskPass,Pass,OutputPass}.js`
- `examples/jsm/shaders/{CopyShader,LuminosityHighPassShader}.js`
(The exact set is the dependency tree the audit observed in `preview_network`. Keep the `examples/jsm/...` sub-paths so internal relative imports resolve.)

- [ ] **Step 2: Repoint the importmap (all 4 pages)**

Replace the unpkg importmap with relative paths:
```html
<script type="importmap">
{ "imports": {
  "three": "/assets/vendor/three/build/three.module.min.js",
  "three/addons/": "/assets/vendor/three/examples/jsm/"
}}
</script>
```
Add modulepreload hints near the importmap to collapse the waterfall:
```html
<link rel="modulepreload" href="/assets/vendor/three/build/three.module.min.js">
<link rel="modulepreload" href="/assets/vendor/three/examples/jsm/effects/AsciiEffect.js">
```

- [ ] **Step 3: Verify no unpkg**

Run: `grep -rc 'unpkg.com' public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html` → `0` each.
Reload `/`; `preview_network` shows **no** `unpkg.com` requests and `GET /assets/vendor/three/...min.js → 200`.

- [ ] **Step 4: Sculpture behaviour check (all 4 + a morph)**

`preview_eval` `!!window.__sculpt3D` → true; sculpture renders, rotates, and **morphs** on room change (drive room 1→2 and watch). Bloom + ASCII look identical to baseline. Console error-free. Confirm on EN + pt-br.

- [ ] **Step 5: Commit**

```bash
git add public_html/assets/vendor/three public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html
git commit -m "perf: self-host minified three.js; repoint importmap off unpkg (Phase 1)

unpkg served the UNMINIFIED ~1.2MB three.module.js + a 9-request addon
waterfall with no SRI/fallback — a third-party SPOF on a site selling
security credibility. Now vendored minified under assets/vendor/three/ with
modulepreload. Verified: no unpkg origins, sculpture renders/rotates/morphs
identically. Refs D-025 §C.5/§C.6."
```

---

### Task 6: Fix reduced-motion + render-loop hardening

**Files:**
- Modify: `public_html/assets/js/sculpture.js` (render loop, morph, DPR, WebGL fallback)

Makes the CLAUDE.md §5 invariant true (`prefers-reduced-motion` currently stops rotation but NOT the 5.2 s morph) and stops the unconditional rAF + full-viewport ASCII DOM rewrite from burning CPU/battery when nothing is changing or the tab is hidden.

- [ ] **Step 1: Reduced-motion respects the morph**

In `sculpture.js`, find `window.__sculpt3D = function (n) { … }` (the morph entry). At its top, add:
```js
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```
and when `REDUCED`, swap shapes instantly (skip the 5.2 s tween — jump `origPos`→target, promote incoming→current) instead of animating. Also subscribe once to changes:
```js
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { REDUCED = e.matches; });
```

- [ ] **Step 2: Pause the loop when hidden / off-viewport**

In the `animate()` rAF loop, gate rendering:
```js
if (document.hidden) { requestAnimationFrame(animate); return; }
```
and add a `visibilitychange` listener that re-kicks `animate()` on return. (Keep it minimal — don't restructure the loop.)

- [ ] **Step 3: Dirty-check — skip render when nothing is changing**

The loop calls `effect.render()` every frame even when the scene is static (under reduced-motion, rotation is off and no morph runs, yet a full-viewport ASCII DOM rewrite still happens 60×/s). Add a `needsRender` flag: set it true while rotating (normal mode) or while a morph is active; under reduced-motion with no morph, render once after a shape swap, then skip until the next change. Guard `effect.render()` behind it. (Normal mode keeps rendering — rotation is continuous — so this is purely a reduced-motion / idle win; visuals unchanged.)

- [ ] **Step 4: Explicit DPR + WebGL failure fallback**

After renderer creation, add `renderer.setPixelRatio(1);` with a comment (it was implicitly 1). Wrap renderer/effect construction in `try { … } catch (e) { … }`; on failure, leave the page content readable (the ASCII container stays empty, content DOM is unaffected) and `console.warn` once — no throw that would break the page.

- [ ] **Step 5: Verify**

`preview_eval` with `matchMedia` mocked or via the browser's reduced-motion emulation: trigger a room change → sculpture swaps instantly, no 5.2 s scatter. Normal mode: morph still animates. Background the tab (or `document.hidden` eval) → confirm the loop early-returns. Console clean. Visual identical in normal mode.

- [ ] **Step 6: Commit**

```bash
git add public_html/assets/js/sculpture.js
git commit -m "fix(a11y/perf): honor prefers-reduced-motion in morph; pause loop when hidden (Phase 1)

Reduced-motion stopped rotation but not the 5.2s morph (CLAUDE.md §5 invariant
was false) — now swaps shapes instantly under reduced-motion and listens for
changes. rAF loop early-returns when document.hidden; explicit setPixelRatio(1);
renderer creation wrapped in try/catch so WebGL failure leaves content readable.
Refs D-025 §C.6, OQ-2."
```

---

### Task 7: Accessibility baseline (split-independent items only)

**Files:**
- Modify: `public_html/assets/css/canvas.css` (hidden-room handling, `:focus-visible`, `--ink-faint` contrast, skip-link)
- Modify: `public_html/assets/js/engine.js` (add `inert` to inactive rooms when toggling active)
- Modify: all 4 `index.html` (wrap rooms in `<main>`, add skip-link + `<noscript>` fallback)

The a11y fixes that DON'T need the page split. Here: stop hidden rooms polluting the a11y tree/tab order, add focus rings, fix HUD contrast, add a `<main>` landmark + skip-link, and a no-JS fallback. **Deferred to Phase 2** (they need the real URLs / one-page-per-room): converting blog cards & back-links to real `<a href>`, and reducing each page to a single `<h1>` (today one page carries ~11 h1s because all rooms are stacked).

- [ ] **Step 1: Hidden rooms leave the a11y tree + tab order**

The CSS hides inactive rooms with `opacity:0;pointer-events:none` (keyboard focus still enters them). Add `visibility:hidden` to the inactive state and `visibility:visible` to `.active` (with a transition-delay so the slide animation still reads). In `engine.js`, where a room gains/loses `.active`, also toggle the `inert` attribute on inactive rooms (`el.inert = !isActive`) so SRs + Tab skip them. Verify the slide animation still looks identical.

- [ ] **Step 2: Visible focus ring (canon teal)**

Add to `canvas.css`:
```css
:focus-visible{outline:2px solid var(--teal);outline-offset:3px;border-radius:2px}
```
(No `:focus` rule existed; UA default on the 8px nav nodes was invisible.)

- [ ] **Step 3: Lift `--ink-faint` to ≥4.5:1 where used for text**

`--ink-faint` is `#505469` (2.70:1 on the dark bg) and is used for real HUD text (scroll hint, `/ 06` counter). Raise it to `#7A8099` (≈4.6:1) — or introduce `--ink-faint-text` for the text usages and keep the dim value only for true decoration. Verify with `preview_inspect` / a contrast check.

- [ ] **Step 4: Add a `<main>` landmark + skip-link (all 4 pages)**

The rooms/stage currently sit directly in `<body>` with no landmark and no skip-link. Wrap the room container (the `.stage` / rooms wrapper — NOT the HUD or sculpture, which stay siblings) in `<main id="main">`, and add as the first focusable element in `<body>`:
```html
<a class="skip-link" href="#main">Skip to content</a>
```
with CSS in `canvas.css`:
```css
.skip-link{position:fixed;left:12px;top:-48px;z-index:200;background:var(--teal);color:#06121a;padding:8px 14px;border-radius:6px;font:600 13px/1 'Instrument Sans',sans-serif;transition:top .15s}
.skip-link:focus{top:12px}
```
Per-page one-`<h1>` reduction is **deferred to Phase 2** (needs the split).

- [ ] **Step 5: No-JS fallback (all 4 pages)**

Today a no-JS visitor sees only room 1 (rooms 2–6 are `opacity:0` and revealed by JS). Add to each `<head>`:
```html
<noscript><style>.room{opacity:1!important;visibility:visible!important;position:relative!important;transform:none!important;height:auto!important;min-height:100vh}.hud,.scroll-hint{display:none!important}</style></noscript>
```
so without JS the rooms stack and read top-to-bottom. (Content is already in the HTML — this just un-hides it.) Verify by disabling JS.

- [ ] **Step 6: Verify**

Keyboard-only: Tab through `/` — the skip-link appears first, focus never enters an inactive room, every focusable element shows the teal ring. `preview_eval`: inactive `.room` has `inert` + `visibility:hidden`; `<main id="main">` exists. Contrast of `--ink-faint` text ≥4.5:1. Disable JS → all rooms stacked + readable. Visual (JS on): slide animation + HUD unchanged.

- [ ] **Step 7: Commit**

```bash
git add public_html/assets/css/canvas.css public_html/assets/js/engine.js public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html
git commit -m "fix(a11y): inert hidden rooms, focus ring, contrast, <main>+skip-link, no-JS fallback (Phase 1)

Hidden rooms were opacity:0 only — SRs saw all rooms at once and Tab entered
invisible content; now visibility:hidden + inert on inactive rooms. Added a
teal :focus-visible ring (none existed), a <main> landmark + skip-link, and a
<noscript> fallback that stacks the rooms for no-JS visitors (saw only room 1
before). Lifted --ink-faint text 2.7:1 -> ~4.6:1 (WCAG AA). Real <a> for
blog/back + one-h1-per-page deferred to Phase 2. Refs D-025 §C.6."
```

---

### Task 8: Phase 1 close-out — verify, document, hand off

**Files:**
- Modify: `CLAUDE.md` (§8), `PROJECT.md` (§E, §C.6 Phase 1 marker)

- [ ] **Step 1: Full equivalence + third-party sweep**

```bash
cd public_html
echo "inline style/script blocks gone (want 0):"; grep -rc '<style>' index.html nl/index.html fr/index.html pt-br/index.html
echo "third-party origins gone (want 0):"; grep -rc 'fonts.googleapis\|gstatic\|unpkg.com' index.html nl/index.html fr/index.html pt-br/index.html
echo "shared assets present:"; ls assets/css/canvas.css assets/js/engine.js assets/js/sculpture.js assets/fonts/ assets/vendor/three/build/
echo "per-page line counts (should drop ~1900 each):"; wc -l index.html nl/index.html fr/index.html pt-br/index.html
echo "dead code gone (want 0):"; grep -rc '__dead_oldShapes' . 
```
On the live preview: all 4 locales render identical to the Task 1 baseline; `preview_network` shows ONLY same-origin requests (+ the inert HubSpot/Pixel still inert); console clean; sculpture renders/rotates/morphs; reduced-motion swaps instantly; keyboard focus rings + inert rooms work.

- [ ] **Step 2: Update docs**

CLAUDE.md §8: note Phase 1 done (shared assets, self-hosted fonts+three, dead code gone, reduced-motion fixed, a11y baseline), Phase 2 (the split) next. Update §5 invariants (three.js now self-hosted; reduced-motion now disables morph; fonts self-hosted — already noted as target, mark as done). PROJECT.md §E + §C.6 Phase 1 marker → DONE.

- [ ] **Step 3: Commit + deploy handoff**

```bash
git add CLAUDE.md PROJECT.md
git commit -m "docs: Phase 1 (shared foundation) complete; Phase 2 (the split) next (D-025)"
```
Tell the operator: upload `public_html/`; on oopuo.com confirm all 4 locales look/behave identical and the network panel shows no Google/unpkg origins. Then Phase 2 (rooms → real crawlable URLs + the fetch/swap router).

---

## Notes for the executor

- **Equivalence is the bar.** Every task ends by comparing against the Task 1 baseline screenshots. The only *intended* visible changes in all of Phase 1: localised HUD end-label (— EINDE/FIN/FIM), focus-visible rings, slightly lighter `--ink-faint` text, and reduced-motion users getting instant shape swaps. Anything else changing = a regression.
- **Extraction = verbatim move.** Tasks 1–3 relocate existing code; don't "improve" it in passing (except the explicitly listed dead-code drop + config sourcing). Refactors of the engine logic are out of scope.
- **HubSpot/Pixel stay inert** (Phase 0 state). Don't reactivate. The Pixel stays a commented placeholder; the NL/FR forms stay guarded.
- **Test on live for integrations.** Font/three self-hosting, sculpture, a11y, reduced-motion all verify on localhost. The HubSpot form + (future) Pixel only verify on https — not part of Phase 1's checks.
- **Order matters for risk:** CSS (1) → module (2) → boot+config (3) are the structural moves; fonts (4) + three (5) are the privacy/perf wins; reduced-motion (6) + a11y (7) are the defect fixes. Each is independently shippable — the operator can deploy after any task.
