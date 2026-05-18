# oopuo-splash — master doc

Chunked retrieval. Always reach a section via its `## §X` anchor — see `CLAUDE.md §10` for the index, `§G` below for snippets.

Cadence per section:
- `§A` stable · `§B` append-only · `§F` append-only · `§C §D §E §G` overwrite freely.

---

## §A — Design system & architecture

### §A.1 Overview

OOPUO Splash is the marketing website for OOPUO, an AI systems consultancy based in Amsterdam. Two codebases coexist in one repo:

1. **v1 Astro site** (`src/pages/`) — static, SSG, Tailwind 4, TypeScript strict, Astro built-in i18n (7 locale folders, only EN populated). Builds to `dist/`. Currently 12 pages: home, enterprise, about, contact, blog index, blog posts, privacy, terms, accessibility, sitemap.xml.
2. **v2 lobby prototype** (`public/lobby.html`) — single self-contained HTML file (~2000 lines, inline CSS + JS + Three.js CDN module). Six full-viewport "rooms" with procedural 3D sculpture rendered through an ASCII effect pipeline. Served as a static asset by the Astro dev server at `/lobby.html`.

The two are not merged. v1 is production-shaped (pages, SEO, i18n scaffolding). v2 is the creative direction (immersive lobby UX). Production launch requires either porting v2 into Astro pages or committing to v2 as the primary experience with v1 content as secondary routes. See §C OQ-1.

### §A.2 Stack

| Layer | v1 Astro site | v2 Lobby prototype |
|---|---|---|
| Framework | Astro 6.3.3 | None (vanilla HTML) |
| CSS | Tailwind 4 | Inline `<style>` with CSS custom properties |
| JS | TypeScript strict, zero client-side JS by default | Inline `<script>` IIFE + `<script type="module">` for Three.js |
| 3D | N/A | Three.js (CDN) + AsciiEffect + EffectComposer + UnrealBloomPass |
| i18n | Astro built-in routing (en, pt-br, en-us, nl, fr, rs, zh) | N/A (English only) |
| Content | MDX content collections for blog | Inline HTML |
| Fonts | Google Fonts (Instrument Sans, JetBrains Mono) + Fontshare (Satoshi) | Same |
| Build | `astro build` → `dist/` | No build step |

### §A.3 Dual-context pattern (v1)

The v1 site is **light-primary with dark accent sections**. Components work in both contexts via `data-theme="dark"`:

- **Light context:** `bg-primary` (#F0F2F6) base, white cards, dark text, card shadows, teal accent `#1E7A6E`.
- **Dark context:** `bg-dark` base, glow borders (not shadows), teal accent `#2D8A7E`, white text.
- **Dark sections on homepage:** hero, enterprise teaser, final CTA, footer.
- **Always light:** nav bar. **Always dark:** footer.
- **Warm highlight** (#C4814A): max 1× per page, final CTA only.

### §A.4 v2 lobby rendering pipeline

1. **Three.js scene** — 6 procedural shape groups (one per room), three lights (key + fill + rim), `MeshLambertMaterial` + emissive baseline `0x2a2a2a`.
2. **EffectComposer** chain — `RenderPass → UnrealBloomPass` (strength 1.4, radius 0.85, threshold 0.18). Bloom merges distinct objects into a unified lit field.
3. **AsciiEffect** — reads the bloomed canvas, outputs a `<div>` of characters. Block-shade ramp: `' .·:;-+*░▒▓█'`, invert=true.
4. **CSS colour layer** — radial gradient via `background-clip: text` colours characters by position. Drop-shadow adds glow. `filter: blur(0.9px)` softens the grid.

### §A.5 v2 morph system

- **Duration:** 5.2s, easeInOutSine.
- **Three layered behaviours per piece:** (1) position lerp with shared curve direction × per-piece `windFactor`; (2) initial detachment kick at t=0; (3) sub-cycle flutter perpendicular to wind.
- **Group-level breathing:** entire cluster drifts as one body during the middle window.
- **Per-piece stagger:** time delay 0–0.18 s.
- **Abort:** `abortMorph()` cancels rAF, snapshots live positions into `origPos`, promotes incoming → current. `homePos`/`homeScale` are permanent design-position anchors; `resetShape` always restores from `homePos`.

### §A.6 v2 color system

Two palette families (cyan default, warm for blog). All registered as `@property <color>` for 4s CSS transitions.

| Variable | Cyan (rooms 1–4, 6) | Warm (room 5 blog) |
|---|---|---|
| `--grad-0` | `#DFF7F9` | `#F7E8D6` |
| `--grad-1` | `#67E8F9` | `#E0B080` |
| `--grad-2` | `#22D3EE` | `#C4814A` |
| `--grad-3` | `#0E9FBE` | `#8B5A2E` |
| `--teal` | `#0E9FBE` | `#C4814A` |

Three layered hue animations: `hueGlow` (36s, ±10°), `hueBreath` (3.5s, ±2°), `colorDance` (42s, gradient center drift).

### §A.7 v2 navigation

- 6 main rooms + 4 Modules sub-rooms (M.01–M.04 × 4 sub-pages each, only M.01 Websites has real content).
- Snap-to-room via wheel/touch/keyboard. Blog room decouples wheel for internal scroll.
- Direction-aware slide: `translateY(±60px)` + random `--room-tilt` (±0.45°) + `--room-origin-x` (20%–80%).
- Dual-rail: main COL 0 + sub-rail COL 1 for module sub-pages.
- URL hash routing: `#NN` for rooms, `#03/M.01/N` for sub-pages. `pushState` + `popstate` + `restoreFromHash()`.

### §A.8 Six sculptures (one per room)

| Room | Shape | Key geometry |
|---|---|---|
| 01 Arrival | Crystal spire | 6-element polyhedral stack + orbital rings + fragments + satellites + wires |
| 02 The Gap | Broken cube | Central cube + 14 shards + 6 splinters + cells + radiating wires |
| 03 Modules | Quartered lattice | 2×2 cubes + cross spar + connecting wires + edge cells |
| 04 Studio | Torii gate | Pillars + capstones + beams + sign tablet + base stones |
| 05 Blog | Stratified stack | 9 layers + binding rod + edge accents |
| 06 Invitation | Trapezoidal portal | Frame + threshold + keystone + inner orb + pilasters + wires |

### §A.9 Font system (shared)

| Token | Family | Usage |
|---|---|---|
| `font-display` | Instrument Sans 400–700 | Headings, nav, brand |
| `font-body` | Satoshi 400/500/700 | Body text |
| `font-mono` | JetBrains Mono 400 | Code, labels, counters |

Never ship Inter, Roboto, or Arial.

### §A.10 File map

```
public/
  lobby.html              <- v2 prototype (THE file)
  favicon.svg             <- square-cropped OOPUO mark (white, 460x460 viewBox)
  oopuo-logo.svg          <- black mark (1024x544)
  oopuo-logo-white.svg    <- white mark (1024x544)
  robots.txt

src/
  pages/                  <- v1 Astro site
    index.astro           <- homepage
    enterprise.astro      <- enterprise/regulated companies
    about.astro           <- about page
    contact.astro         <- contact page
    blog/                 <- blog index + posts
    privacy.astro         <- privacy policy
    terms.astro           <- terms of service
    accessibility.astro   <- accessibility statement
    sitemap.xml.ts        <- sitemap generator
  i18n/                   <- locale JSON files (EN only populated)

design/                   <- design source of truth
  00-milestone/           <- HANDOFF.md (v1 build spec)
  01-theme/               <- theme tokens
  02-design-philosophy/   <- philosophy doc
  03-copy/                <- page copy (home, enterprise, about, contact)
  04-wireframes/          <- page wireframes
  05-component-specs/     <- component specs + animations
  06-visual-assets/       <- logo assets
  07-blog/                <- blog strategy + post templates + 3 launch posts
  08-v2-lobby/            <- STATE.md (canonical v2 state), GRAPH.md, MOODBOARD.md

CLAUDE.md                 <- hot snapshot (always loaded)
PROJECT.md                <- THIS FILE (chunked master)
DECISIONS.md              <- decision log (mirrored in §B)
```

---

## §B — Decisions (append-only)

Each entry: date · id · title, then decision / rationale.

---

### 2026-05-14 · D-001 · Astro + Tailwind + Astro built-in i18n

**Decision:** Use Astro 5 (now 6) + Tailwind 4 + TypeScript strict + Astro built-in i18n (7 locales) + MDX content collections for blog.

**Rationale:** Zero JS by default fits a static marketing site. Astro islands for future interactive widgets (WhatsApp wizard). Built-in i18n routing handles 7 locales without middleware.

---

### 2026-05-15 · D-002 · v2 lobby prototype lives in `public/lobby.html` (single file)

**Decision:** The v2 lobby is a single self-contained HTML file in `public/`, served as a static asset. No build step, no component boundaries.

**Rationale:** Fastest iteration. Production port to Astro pages deferred until design locks.

---

### 2026-05-15 · D-003 · Three.js + AsciiEffect for the sculpture

**Decision:** Use Three.js with AsciiEffect for the lobby's central animation.

**Rationale:** Real 3D rotating scene rendered as ASCII gives natural depth shading and continuous rotation across morphs. Lighter than custom shaders, more flexible than pre-rendered animations.

---

### 2026-05-15 · D-004 · EffectComposer + UnrealBloomPass between scene and AsciiEffect

**Decision:** Insert a bloom pass before ASCII conversion.

**Rationale:** Bloom merges distinct 3D objects into a unified lit field — ASCII chars read as one continuous TUI instead of separate rectangular panels. Patched `renderer.render` delegates to composer with recursion guard.

---

### 2026-05-16 · D-005 · MeshLambertMaterial (not Phong) + emissive baseline 0x2a2a2a

**Decision:** Use Lambert material with emissive fill instead of Phong.

**Rationale:** Removes specular hotspots that read as "panel" focal points. Emissive ensures shadow sides still contribute char density (no hard silhouettes).

---

### 2026-05-16 · D-006 · Block-character ramp, invert=true

**Decision:** Ramp `' .·:;-+*░▒▓█'` with invert=true.

**Rationale:** Cellular block chars at the bright end read as "agent units / divs of a system"; dim dots wrap as membrane. Conway's Game of Life aesthetic for the agentic-AI metaphor.

---

### 2026-05-16 · D-007 · Three-layer morph: shared curve + detachment kick + sub-cycle flutter

**Decision:** Three layered morph behaviours instead of simple lerp.

**Rationale:** Coherent direction (shared curve) prevents orbital chaos; initial kick gives "bonds breaking" moment; sub-cycle flutter (period > morph duration) prevents pieces from completing loops — reads as sand-in-wind drift, not constellation.

---

### 2026-05-16 · D-008 · Group-level breathing for cluster phase

**Decision:** Whole cluster drifts as one body during the cluster window, replacing per-piece wobble.

**Rationale:** Per-piece wobble created orbital chaos. Group-level keeps the "one substance" feel.

---

### 2026-05-17 · D-009 · Color palette families (cyan/warm), no rainbow rotation

**Decision:** Two palette families with `@property <color>` registration for smooth 4s CSS transitions. Narrow `hueGlow` (±10° at 36s) instead of rainbow cycling.

**Rationale:** "Alive but stays in-family" without rainbow cycling. Warm palette on blog room only.

---

### 2026-05-17 · D-010 · URL hash routing instead of Astro port

**Decision:** Hash-based routing (`#NN` / `#NN/M.NN/N`) with `pushState` + `popstate`.

**Rationale:** Preserves single-file architecture, adds shareable URLs + browser back/forward + Cmd+R state restoration. ~50 lines of routing code. Astro port deferred until design locks.

---

### 2026-05-17 · D-011 · Blog ambience switch is sculpture-color-only, not page-bg

**Decision:** Only the sculpture's `--grad-*` + `--teal` shift to warm family; page bg stays `#F0F2F6`.

**Rationale:** Earlier cream-tint background felt jarring on transition. Sculpture-only switch is seamless.

---

### 2026-05-17 · D-012 · Asymmetric organic slide via random tilt + transform-origin

**Decision:** Random `--room-tilt` (±0.45°) + `--room-origin-x` (20%–80%) per scroll event.

**Rationale:** Cheap approximation of "left/right different speed" — off-center origin makes one side lift faster. True per-side wave deferred.

---

### 2026-05-18 · D-013 · Morph abort via immediate cancel + homePos/homeScale anchors

**Decision:** Replace queue-based morph handling with `abortMorph()` that cancels the rAF, snapshots live positions into `origPos`, and promotes incoming → current immediately. Permanent `homePos`/`homeScale` anchors ensure `resetShape` always restores true design positions regardless of abort history.

**Rationale:** Queue-based approach showed wrong shape during fast scrolling (stale queue, no mid-flight interrupt). Immediate abort + position snapshot preserves visual continuity; permanent home anchors prevent position corruption from accumulating across multiple aborts.

---

### 2026-05-18 · D-014 · Favicon square-cropped from logo mark

**Decision:** Create `public/favicon.svg` with `viewBox="280 60 460 460"` — a square crop of the OOPUO white mark paths, replacing the wide (1024×544) SVG that was letterboxed in browser tab icons.

**Rationale:** Wide aspect ratio logo gets too small when letterboxed into the square tab-icon space. Square crop centres on the mark with minimal padding.

---

### 2026-05-18 · D-015 · Gospot-format project documentation (CLAUDE.md + PROJECT.md)

**Decision:** Consolidate all project documentation into two files following the gospot two-file format: `CLAUDE.md` (hot snapshot, always loaded) + `PROJECT.md` (chunked master with §A–§G sections).

**Rationale:** 7+ scattered state docs (STATE.md, HANDOFF.md, TRACKER.md, DECISIONS.md, GRAPH.md, design/README.md) caused re-discovery overhead. Two-file format with CLI retrieval anchors lets a fresh session resume in under 5 minutes.

---

### 2026-05-18 · D-016 · Blog reading view as in-DOM slide overlay, not separate pages

**Decision:** Blog posts in the lobby render as `<article class="blog-reader">` panels inside `.stage`, opened via `openPost(n)` with `body.reader-open`. Hash format `#05/POST.NN`. Closes on Esc, back button, browser back, or any room/module nav.

**Rationale:** Keeps the lobby's single-file architecture and unified hash routing, avoids per-post HTML files for the prototype phase. Real per-post URLs are deferred until the v1/v2 merge decision (OQ-1) resolves — at which point posts move to Astro pages with proper SEO. For now, shareable hash URLs are sufficient.

---

## §C — Roadmap & open questions

### §C.1 Remaining work — v2 lobby

| Item | Status | Priority | Notes |
|---|---|---|---|
| Blog post reading view | Stub | High | Cards are visual placeholders. Need: click → expanded post view with editorial typography, back-to-grid. |
| Module sub-pages M.02–M.04 | Stub | Medium | AI Support, Automation, Integrations — only show generic placeholder. Only M.01 Websites has all 4 sub-pages with real content. Need copy for 12 sub-pages (~440 words each). |
| Pill category filters (blog) | Visual only | Low | Pill row renders but no filtering logic wired. |
| Contact CTAs | Stub | Medium | "Book a free call" and "Send a message" have no handlers. Need: Calendly embed or scheduling link, contact form or mailto. |
| Enterprise link | Stub | Low | `href="#enterprise"`, no destination. Depends on v1/v2 merge decision (§C.3 OQ-1). |
| Room 04 Studio content | Minimal | Low | Currently has Torii gate sculpture + placeholder. Needs "about" content about OOPUO team/approach. |

### §C.2 Remaining work — v1 Astro site

| Item | Status | Notes |
|---|---|---|
| Enterprise page content | Copy exists (`design/03-copy/enterprise.md`) | 6 sections: hero, stakes, services, approach, timeline, CTA. Needs implementation. |
| Blog posts | 3 launch posts written (`design/07-blog/`) | Need MDX content collection wiring + post layout. |
| i18n content | EN only | 6 other locales (pt-br, en-us, nl, fr, rs, zh) need translation. Architecture ready. |
| Contact form | Placeholder | HubSpot form (TBD) + Calendly embed (TBD) + WhatsApp wizard (client-side island). |
| Blog reading layout | Scaffolded | Needs editorial typography pass matching v2 blog design. |

### §C.3 Open questions

- **OQ-1 — v1/v2 merge strategy.** Port v2 lobby into Astro pages (proper URLs, SEO, View Transitions API)? Or commit to v2 as primary + add per-route static HTML files for SEO? Drives enterprise link, blog SEO, sitemap, and i18n decisions.
- **OQ-2 — Low-end performance.** Three.js + bloom + ASCII is heavy. No mobile/low-end benchmarking done. May need: reduced particle count, bloom bypass on mobile, or ASCII-only fallback.
- **OQ-3 — i18n content pipeline.** Architecture ready (7 locale folders). No translation vendor or process chosen. Blocks non-EN launch.
- **OQ-4 — Contact infrastructure.** HubSpot vs Formspree vs simple mailto? Calendly vs Cal.com? WhatsApp Business API vs deep link? None chosen.
- **OQ-5 — Blog CMS.** Currently MDX files in repo. For 2/month cadence, is a headless CMS (Sanity, Contentful, Keystatic) worth the complexity?
- **OQ-6 — Domain & hosting.** No domain purchased. No hosting provider chosen (Vercel, Netlify, Cloudflare Pages, self-hosted on gospot cluster).

### §C.4 Production gaps

- No real URLs for blog posts (v2 is hash-routing only). SEO-blocking.
- Logo favicon wide aspect (1.88:1) — FIXED 2026-05-18 with square-cropped `favicon.svg`.
- No `<meta>` tags, OpenGraph, Twitter cards, or JSON-LD structured data on v2 lobby.
- No analytics or tracking.
- No cookie consent / GDPR compliance UI.
- No 404 page.

---

## §D — Workstreams (stream memory)

Pick one stream per task. Read only the stream you are working in.

### §D.1 Lobby stream

**Scope:**
- Primary root: `public/lobby.html` (the single file)
- Supporting: `design/08-v2-lobby/STATE.md` (canonical state), `design/08-v2-lobby/GRAPH.md` (site graph)
- All v2 sculpture, navigation, morph, color, room content work

**Delivery contract:**
- All edits go in `public/lobby.html`. No external JS/CSS files.
- Update `design/08-v2-lobby/STATE.md` when architectural changes land.
- Respect `prefers-reduced-motion`.
- Test at `http://localhost:4321/lobby.html` via `npm run dev`.

**Recent work:**
- 2026-05-17: Color system (cyan/warm families, 4s palette transitions, narrow hue band, dancing gradient center). URL hash routing. Asymmetric room slide. Bigger logo lockup.
- 2026-05-18: Morph abort bug fixed (`abortMorph()` + `homePos`/`homeScale` architecture). Favicon square-cropped.

### §D.2 Astro stream

**Scope:**
- Primary roots: `src/pages/`, `src/components/`, `src/layouts/`, `src/i18n/`, `src/content/`
- Supporting: `design/00-milestone/HANDOFF.md`, `design/03-copy/`, `design/04-wireframes/`, `design/05-component-specs/`
- All v1 page implementation, component work, Tailwind styling, i18n

**Delivery contract:**
- Follow dual-context pattern (§A.3). Components must work in both light and dark via `data-theme="dark"`.
- Strings in locale JSON files, never hardcoded.
- `npm run build` must pass clean.
- Design docs in `design/` are source of truth — if code disagrees, fix the code.

**Recent work:**
- 2026-05-14: Initial scaffold — all pages, components, layouts, i18n routing.
- 2026-05-14: SEO, compliance, and polish passes.

### §D.3 Content stream

**Scope:**
- Primary roots: `design/03-copy/`, `design/07-blog/`, `src/i18n/locales/`
- Blog strategy, post drafts, page copy, translations
- Content quality, tone ("calm authority, senior engineer explaining to smart non-specialist")

**Delivery contract:**
- Blog: 800–1500 words. Clear H2/H3. Short paragraphs (3 sentences max). Lead with problem. End with topic-specific CTA.
- 4 categories: EU AI Act, AI Automation, Technical Deep Dives, Industry Perspectives.
- Launch with 3 posts. Then 2/month cadence.
- SEO: one primary keyword + 2–3 long-tail per post. Meta < 155 chars.

**Recent work:**
- 3 launch posts written: EU AI Act guide, 5 AI automations for SMBs, agent observability as compliance weapon.
- Enterprise page copy complete (6 sections).
- Blog strategy defined (categories, tone, format, cadence).

### §D.4 Production stream

**Scope:**
- Domain, hosting, deployment pipeline
- SEO (meta tags, OpenGraph, JSON-LD, sitemap, robots.txt)
- Analytics, cookie consent, GDPR
- v1/v2 merge decision and execution
- Performance benchmarking

**Delivery contract:**
- No deployment without OQ-1 (v1/v2 merge) resolved.
- All production decisions logged in §B.
- Performance budget defined before launch.

**Recent work:**
- None yet. Blocked on OQ-1.

---

## §E — Handoff (current next-step)

> Overwrite per session. As of 2026-05-18.

**Current mode:**
- Solo operator (user + Claude agents).
- v2 lobby prototype LIVE at `http://localhost:4321/lobby.html` via `npm run dev`.
- v1 Astro site builds clean (`npm run build`).
- Project docs consolidated into gospot format (CLAUDE.md + PROJECT.md).

**What just landed (2026-05-18):**
1. Morph abort bug fixed — `abortMorph()` with immediate cancel + position snapshot + `homePos`/`homeScale` permanent anchors.
2. Favicon square-cropped — new `public/favicon.svg` with `viewBox="280 60 460 460"`.
3. Project documentation consolidated from 7+ scattered files into `CLAUDE.md` + `PROJECT.md`.
4. **Blog post reading view** — 4 posts (1 featured ~580w + 3 grid ~420w each), slide overlay, internal scroll, prev/next nav, Esc/back/nav-ball close, hash `#05/POST.NN`. Real OOPUO-voice copy.

**Recommended next actions (priority order):**

1. **Module sub-pages M.02–M.04** (content + lobby streams) — write copy for AI Support, Automation, Integrations (~440 words each × 4 sub-pages = ~5,280 words total). Then wire into lobby.
2. **Contact CTAs** (lobby stream) — decide on scheduling tool (OQ-4) and wire "Book a free call" + "Send a message".
3. **v1/v2 merge decision** (production stream) — resolve OQ-1. This gates SEO, i18n, and deployment.
4. **Enterprise page implementation** (astro stream) — copy exists in `design/03-copy/enterprise.md`, needs Astro page build.
5. **Blog filter pills** (lobby stream) — wire category filter logic (currently visual-only).

**Do not:**
- Enforce v1 invariants on v2 lobby work without checking `design/08-v2-lobby/STATE.md`.
- Create new top-level planning files — use `CLAUDE.md` or `PROJECT.md`.
- Edit design docs without operator approval.

---

## §F — History (durable, append-only)

### §F.1 Framework conventions (2026-05-14)

- Astro + Tailwind + TypeScript strict chosen as stack (D-001).
- Design-first workflow: all intent lives in `design/`, code follows.
- Solo operator model: user + Claude agents.
- GitHub repo: `ottogen/oopuo-splash`.

### §F.2 Truths locked at v1 launch prep

- Dual-context pattern: light primary + dark accent sections via `data-theme="dark"`.
- Font trinity: Instrument Sans + Satoshi + JetBrains Mono. No substitutes.
- Teal accent: `#1E7A6E` (light), `#2D8A7E` (dark). Warm highlight `#C4814A` max 1×/page.
- i18n architecture for 7 locales, EN only populated.
- Blog: 4 categories, 3 launch posts written, 2/month target cadence.

### §F.3 Milestone log

- **2026-05-14 — D-001** — Stack chosen: Astro + Tailwind + i18n. Design docs created for all pages.
- **2026-05-14 — v1 scaffold** — Complete Astro site scaffolded: 12 pages, all components, layouts, i18n routing.
- **2026-05-14 — v1 polish** — SEO, compliance, and polish passes applied.
- **2026-05-15 — D-002/003/004** — v2 lobby prototype created. Three.js + AsciiEffect + bloom pipeline. Single file in `public/lobby.html`.
- **2026-05-16 — D-005/006/007/008** — Sculpture rendering refined: Lambert material, block-char ramp, three-layer morph, group-level breathing.
- **2026-05-17 — D-009/010/011/012** — Color palette families (cyan/warm) with 4s transitions. URL hash routing. Blog ambience switch. Asymmetric organic slide.
- **2026-05-17 — v2 state doc** — `design/08-v2-lobby/STATE.md` written as canonical v2 state.
- **2026-05-18 — D-013** — Morph abort bug fixed: `abortMorph()` + `homePos`/`homeScale` architecture.
- **2026-05-18 — D-014** — Favicon square-cropped to `viewBox="280 60 460 460"`.
- **2026-05-18 — D-015** — Project docs consolidated into gospot-format `CLAUDE.md` + `PROJECT.md`.
- **2026-05-18 — D-016** — Blog reading view: 4 posts as in-DOM slide overlay panels, hash `#05/POST.NN`. Esc/back/nav-ball close. Real OOPUO-voice copy.

### §F.4 Durable lessons

- **Single-file prototype is fast but has a ceiling.** `public/lobby.html` at ~2000 lines is approaching the limit of comfortable single-file editing. D-010 (hash routing) defers the Astro port but doesn't eliminate it. The port conversation (OQ-1) must happen before production.
- **Morph state needs immutable anchors.** Mutable `origPos` corrupts across multiple aborts. Permanent `homePos`/`homeScale` ensure `resetShape` always returns to ground truth. Pattern: keep one immutable copy + one mutable working copy for any position-based animation system.
- **Palette transitions need `@property` registration.** CSS custom properties don't animate by default. Registering each `--grad-*` as `@property <color>` enables smooth 4s transitions. Without registration, colors snap.
- **Design docs are source of truth, code follows.** Enforced from day one. If code and design doc disagree, fix the code. This prevents design drift and keeps the `design/` tree reliable.

---

## §G — Retrieval

Use CLI retrieval instead of repo-wide re-scanning.

### §G.1 Core read

```bash
sed -n '1,145p' CLAUDE.md
sed -n '/^## §E/,/^## §F/p' PROJECT.md   # current handoff
```

### §G.2 Section extract from `PROJECT.md`

```bash
sed -n '/^## §A/,/^## §B/p' PROJECT.md    # design system & architecture
sed -n '/^## §B/,/^## §C/p' PROJECT.md    # decisions log
sed -n '/^## §C/,/^## §D/p' PROJECT.md    # roadmap & OQs
sed -n '/^## §D/,/^## §E/p' PROJECT.md    # workstreams
sed -n '/^## §E/,/^## §F/p' PROJECT.md    # handoff
sed -n '/^## §F/,/^## §G/p' PROJECT.md    # history
sed -n '/^## §G/,$p'        PROJECT.md    # retrieval (this section)

# single-stream extract
sed -n '/^### §D.1 Lobby/,/^### §D.2 /p'     PROJECT.md
sed -n '/^### §D.2 Astro/,/^### §D.3 /p'     PROJECT.md
sed -n '/^### §D.3 Content/,/^### §D.4 /p'   PROJECT.md
sed -n '/^### §D.4 Production/,/^---/p'       PROJECT.md
```

### §G.3 Decision lookup

```bash
rg -n "D-[0-9]{3,}" PROJECT.md
sed -n '/^### 2026-.* · D-013 /,/^---$/p' PROJECT.md   # one decision
```

### §G.4 v2 lobby state

```bash
cat design/08-v2-lobby/STATE.md     # canonical v2 state
cat design/08-v2-lobby/GRAPH.md     # site graph + nav schema
```

### §G.5 Design doc reads

```bash
# page copy
cat design/03-copy/home.md
cat design/03-copy/enterprise.md
cat design/03-copy/about.md
cat design/03-copy/contact.md

# wireframes
cat design/04-wireframes/home-wireframe.md
cat design/04-wireframes/enterprise-wireframe.md

# blog
cat design/07-blog/blog-strategy.md
cat design/07-blog/posts/01-eu-ai-act-guide.md
```

### §G.6 Build & dev

```bash
npm run dev           # start Astro dev server → localhost:4321
npm run build         # production build → dist/
# v2 lobby: http://localhost:4321/lobby.html
```

### §G.7 Artifact map

```
CLAUDE.md              <- hot snapshot (always loaded)
PROJECT.md             <- THIS FILE (chunked master)
DECISIONS.md           <- decision log (mirrored in §B)
design/                <- design source of truth (never edit without approval)
  08-v2-lobby/STATE.md <- canonical v2 lobby state
  08-v2-lobby/GRAPH.md <- site graph + multi-column nav schema
  00-milestone/HANDOFF.md <- v1 build spec
  03-copy/             <- page copy
  04-wireframes/       <- page wireframes
  07-blog/             <- blog strategy + posts
public/lobby.html      <- v2 prototype (THE file)
src/pages/             <- v1 Astro pages
src/i18n/              <- i18n locale files
```
