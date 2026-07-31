# oopuo-splash — master doc

Chunked retrieval. Always reach a section via its `## §X` anchor — see `CLAUDE.md §10` for the index, `§G` below for snippets.

Cadence per section:
- `§A` stable · `§B` append-only · `§F` append-only · `§C §D §E §G` overwrite freely.

---

## §A — Design system & architecture

> ⚠️ **§A.2–§A.3 + §A.10 describe the removed Astro/v1 stack (D-021) — IGNORE them.**
> Current architecture: hand-authored static HTML in `public_html/`, no build, Three.js
> via CDN importmap. The **visual canon** (§A.4–§A.9: sculpture pipeline, morph, colour,
> nav, sculptures, fonts) is STILL accurate and is what the live pages embed. Authoritative
> current state = `CLAUDE.md`. Target structure = multi-page static (D-024, `HANDOFF.md`).

### §A.1 Overview

OOPUO Splash is the marketing website for OOPUO, an AI systems consultancy that runs **two market strategies** (D-018): **Europe** (English — enterprise, EU AI Act, Amsterdam credibility) and **Brazil** (pt-BR — SMB: WhatsApp-first automated service, partnership model, R$ pricing, LGPD, Goiás PMEs). The two audiences never see each other's framing. Technically it is **one product** expressed as two artifacts in one repo (direction locked in D-017):

1. **Design canvas** (`public/lobby.html`) — a single self-contained HTML file (~2000 lines, inline CSS + JS + Three.js CDN module). Six full-viewport "rooms" with procedural 3D sculpture through an ASCII pipeline. This is a **non-shipping design sketch** — the source of truth for the visual design. It is served by the Astro dev server at `/lobby.html` for reference; it never deploys.
2. **Production site** (`src/pages/`) — static, SSG, Tailwind 4, TypeScript strict, Astro built-in i18n (7 locale folders, only EN populated). Builds to `dist/`. This is **what ships**, rebuilt to look **pixel-accurate to the canvas**.

The canvas aesthetic is canonical. The Astro site's *current* 12 pages carry a now-**superseded** conventional design (light-first marketing layout); they will be rebuilt to the canon — content survives, the visual shell is replaced. The hard engineering is making the canvas's signature moves survive real routing: the sculpture becomes a persistent island (Astro View Transitions) instead of one hash-routed page, so every section/post is a crawlable URL with real HTML (SEO). English-first launch; the other 6 locales are a post-launch phase. See §C roadmap, D-017, OQ-3.

**Two-track content model (D-018).** Locales are NOT 1:1 translations. The **Europe track** (default English; later en-us/nl/fr/rs/zh) carries the enterprise + EU AI Act positioning. The **Brazil track** (pt-BR) is a distinct strategy with its own copy, offers, pricing, and trust signals — drawn from the internal strategy guide (Google Doc "OOPUO — Guia estratégico interno"): entry offer = automated WhatsApp customer service, expanding into process automation and system integrations; differentiator "parceria, não produto" (partnership + monthly accompaniment); pricing R$3–5k setup + R$350/500/750/mo; trust via LGPD; target Goiás PMEs. Enterprise/EU content must never surface to the Brazil audience, and the Brazil SMB content must never surface to Europe.

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

> **Superseded (D-017):** this conventional dual-context v1 layout is replaced by the canvas aesthetic (dark-first, full-viewport sculpture, no card shadows). Kept as a record of the original v1 design; the rebuild does not follow it — it matches the canvas (§A.4–§A.9).

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

### 2026-05-18 · D-017 · Canvas is the design; Astro is the product (resolves OQ-1)

**Decision:** `public/lobby.html` is a **non-shipping design canvas** — a sketch that defines the visual look. The **production site is Astro** (`src/pages/`), rebuilt to be **pixel-accurate to the canvas**. The canvas aesthetic is canonical; the existing conventional v1 page design is **superseded** and will be rebuilt to match the canvas (content survives, visual shell replaced). Launch is **English-first** (resolves OQ-3); the other 6 locales are a post-launch phase.

**Rationale:** The operator's model is "design as a single-HTML sketch, then build the real site in Astro." Astro itself is SEO-strong, but the canvas's *architecture* (one page, hash routing, JS-revealed content) is not crawlable. So the port is not a 1:1 copy — each room/post/module becomes a real route with server-rendered HTML, and the Three.js/ASCII sculpture becomes a persistent island preserved across navigations via the View Transitions API (keeps the seamless room-to-room feel while giving real URLs + SEO + i18n). Nothing built is wasted — the sculpture engine, palette system, and content all port over.

**Consequences:** OQ-1 resolved. OQ-3 resolved (EN-first). Unblocks the deployment roadmap (§C.2). Reframes the `astro` and `production` workstreams from "paused/blocked" to active.

---

### 2026-05-18 · D-018 · Two markets, two strategies (locale = strategy, not translation)

**Decision:** OOPUO runs two separate go-to-market strategies, and the website serves both as distinct audience tracks that never mix:
- **Europe track (English; later en-us/nl/fr/rs/zh):** enterprise / regulated companies / EU AI Act / Amsterdam credibility. This is the *current* site framing — keep it.
- **Brazil track (pt-BR):** SMB strategy from the internal guide (Google Doc "OOPUO — Guia estratégico interno"). Target: Goiás PMEs (shops, clinics, accounting/law offices, service providers, small e-commerce). Entry offer = **automated WhatsApp customer service** (the "basic starting point"), sold progressively into (2) process automation and (3) system integrations. Differentiator = "parceria, não produto" — a dedicated tech partner with monthly accompaniment. Pricing R$3,000–5,000 setup + R$350/500/750/mo. Trust via **LGPD** (not EU AI Act). Plain owner-to-owner Portuguese.

**Rationale:** The strategy doc the operator shared is unambiguously Brazil SMB; the live site is Europe enterprise. Both are intended — different markets, different motions. The operator's worry ("does the site communicate the basic starting point, not only enterprise?") resolves here: the basic starting point lives in the Brazil/pt-BR track, which does not exist yet; the English site correctly stays enterprise.

**Consequences:** i18n is **not** translation — pt-BR is its own positioning, content, offers, and pricing (refines D-017's "6 locales = translation" note). Enterprise + EU AI Act = Europe only; WhatsApp/LGPD/partnership = Brazil only. Adds a **Brazil SMB content + page track** to the roadmap (§C). Open: launch sequencing — does pt-BR ship at launch or fast-follow English (OQ-7)? The active sales motion in the guide is Brazil.

---

### 2026-06-01 · D-019 · Launch scope: EN/pt-BR/NL/FR at launch; static set-and-forget; Hostinger + HubSpot + Keystatic

**Decision:** All chosen locales ship **at launch** — **EN, pt-BR, NL, FR** (resolves OQ-3; en-us/rs/zh deferred). The Brazil/pt-BR SMB track ships at launch alongside the Europe track (resolves OQ-7). After upload the site is **frozen**; the only ongoing change is **posting new blog pages**. Host = **Hostinger** (static `dist/` deploy; resolves OQ-6). Contact + scheduling = **HubSpot** embeds (forms + meetings), replacing Cal.com — exact setup still to discuss (tentatively resolves OQ-4); Brazil leads with a WhatsApp deep link. Blog editing = **Keystatic** admin UI (resolves OQ-5).

**Rationale:** Operator wants a professional, fast, set-and-forget static site. HubSpot is already their CRM and its forms/meetings embed on a static host with no backend. Keystatic gives a no-code posting UI that commits to the repo.

**Consequences / watch-outs:** Hostinger shared hosting serves **static files only** (no serverless). So: (a) Astro must build to fully static output; (b) HubSpot forms/meetings work (client-side embeds); (c) **Keystatic runs in local mode** — operator edits posts locally, rebuilds `dist/`, and uploads manually (no CI, no OAuth proxy). Deploy is a manual `dist/` upload. Tracks stay separated (D-018): EU/enterprise EN/NL/FR; SMB pt-BR.

---

### 2026-06-11 · D-025 · D-024 execution architecture: hybrid app-shell with real URLs (+ policy calls)

**Decision:** Execute the D-024 restructure as a **hybrid app-shell**: every room / service / blog post / legal page becomes a complete static HTML file (full content, meta, OG, JSON-LD in the initial HTML), and the canvas experience is preserved by a hand-rolled **fetch + DOM-swap + `history.pushState` router** (~150–180 lines vanilla JS) with the Three.js/ASCII sculpture and HUD mounted **outside the swapped container**, so the 5.2s morph runs as the page transition. The router never soft-navigates across the Europe↔Brazil boundary — D-018 separation becomes architectural. CSS `@view-transition` (cross-document) is a fallback crossfade only. Policy calls approved with the architecture: (1) **blog** = markdown sources (`blog/content/<slug>.md`) rendered by a stdlib-only python3 authoring script in `tools/` — a sanctioned exception to "no build" (zero toolchain, zero deps, output committed as static HTML; supersedes Keystatic/D-019); (2) **per-locale HubSpot forms** for NL/FR (operator creates them in the new builder); (3) EN's "WhatsApp as a support channel" copy (M.02) is **whitelisted** in the D-018 rule; (4) **Satoshi dropped from the font canon** — it was never actually loaded by any page (body renders Instrument Sans); (5) the **compliance layer** (self-built consent gate, legal pages, self-hosted fonts + three.js) is mandatory **before** any real tracking ID ships.

**Rationale:** Grounded in the 2026-06-11 six-agent audit (SEO, code drift, content inventory, GDPR/LGPD compliance, engineering quality, platform research). Key verified facts: the inline engine is 99.95% identical across the 4 locale files (one divergent line), so extraction is near-zero-risk; no major AI crawler executes JavaScript (June 2026), making initial-HTML content a harder requirement than ever; cross-document View Transitions cannot keep a WebGL canvas alive (snapshot-based, Firefox unsupported); Hostinger honors `.htaccess`. The audit also found live defects (NL/FR contact dead-ends, 404ing primary CTA, missing og:image, pre-consent Meta Pixel loads, zero legal pages while pages affirmatively claim GDPR/LGPD compliance) that Phase 0 of the roadmap fixes first.

**Consequences:** Full design spec + phased roadmap (Phases 0–4) overwrite §C. OQ-5's Keystatic answer is superseded. CLAUDE.md §5 font canon and WhatsApp rule updated. Operator inputs required for Phase 3: real Meta Pixel ID, real Meeting slug, NL+FR form IDs, legal entity details.

---

### 2026-06-18 · D-026 · Phase 2 EN split shipped; locale chrome injected by the shared engine

**Decision:** The EN (Europe) track is fully split into real crawlable router pages (executes D-024/D-025 for EN). `index.html` is converted to a **router-mode home** carrying only rooms 1+2 (Arrival + The Gap) with **in-page snap**, where a boundary scroll soft-navigates to the next journey stop. The engine gains two router-mode capabilities beyond the original journey model: **side pages** (declare their own `label`/`counter`, are not nav-rail stops — enterprise, the 4 service-detail pages, blog posts, future legal pages) and **multi-room in-page snap** (`pageRooms`/`localIdx`/`goLocal`). The **locale switcher** (EN·NL·FR·PT → each locale home, cross-track `data-no-router` hard-load) and the **root geo-suggest** banner (dismissible, `navigator.languages`, persisted in `localStorage`) are injected by the shared `engine.js` into the HUD on *every* page — chosen over editing all 16 HTML files so legacy NL/FR/pt-br get the switcher for free. An old-hash **redirect shim** lives in the EN home `<head>` (runs before render).

**Rationale:** The home conversion was the keystone — it had to be last because gutting its rooms 3–6 / sub-rooms / blog readers / enterprise overlay (all now their own pages) would orphan the in-page links until the destination pages existed. Injecting locale chrome from the one shared engine keeps the no-build site DRY and avoids 16 near-identical edits. The shim resolves all pre-split bookmarked/shared `#NN…` links against `/`, which is now the router home.

**Consequences:** §C.6 Phase 2 marked EN-DONE; §E next-step is now the per-track NL/FR/pt-br splits + blog pipeline + JSON-LD breadth, then Phase 3. NL/FR/pt-br still single-page (they fall through to the legacy engine — unchanged except they now also get the injected switcher). Verified end-to-end on fresh Playwright; 0 console errors. Next decision id: **D-027**.

---

### 2026-06-19 · D-027 · NL + FR full content parity (resolves OQ-8 for NL/FR)

**Decision:** NL and FR are split into the same 13-page router tree as EN (router-mode home with rooms 1+2 + locale-aware hash shim, `/services/` + 4 detail pages, `/studio/`, `/enterprise/`, `/blog/` + 3 posts, `/contact/`), with all content translated (NL informal "je/jij"; FR formal "vous"). € pricing and EU-AI-Act/Amsterdam/enterprise framing are kept — NL and FR are the Europe track (D-018), so EU content is correct for them. Contact pages use the inert `YOUR_NL/FR_HUBSPOT_FORM_ID` placeholders + `hello@oopuo.com` mailto fallback. EN deep pages gained the full en/nl/fr/x-default hreflang matrix; `sitemap.xml` was regenerated to 40 URLs (13 EN + 13 NL + 13 FR + the pt-br home) with each shared path cross-linking its language versions; the shared engine's locale switcher now targets the **equivalent page** per locale (`/services/websites/` → `/nl/services/websites/`), with pt-br always → its home; mobile-responsive CSS was added for the switcher + geo-suggest.

**Rationale:** Operator directive — "all languages should have all content." The router/engine already supported any locale (the EN split proved it); the work was translation + locale-prefixed scaffolding, delegated to two parallel agents (one per locale) against the EN page set as the template.

**Consequences:** OQ-8 resolved for NL/FR. **pt-br is intentionally excluded** from translation: D-018 forbids showing enterprise/EU-AI-Act/€ material to Brazil, so its deep pages (blog/services/enterprise-equivalent) must be **authored Brazil-native** (Brazil offers, R$ pricing, WhatsApp, "parceria não produto") — a content task, not a translation. That is the remaining locale gap. Verified on fresh Playwright (NL/FR journeys, cross-locale hard-load, inert form placeholders, 0 console errors). Next decision id: **D-028**.

### 2026-08-01 · D-028 · Reposition EN as OOPUO Intelligence (a personal lab)

**Decision:** The EN site stops being a services brochure and becomes **OOPUO Intelligence — a
personal lab focused on high gain**. Its job is credibility that converts into **contracts and
projects, not investment**; the operator explicitly rejected the investor framing. NL, FR and
pt-br are untouched until EN is approved on the live domain.

The **signature trait** is what every section must reinforce and no section may assert as an
adjective: *give him a problem that is blocked — legally, structurally, or by privacy — and he
finds the configuration that unblocks it.* Zenithcred is its proof, and the load-bearing part is
not the biofeedback: it is that an employer paying wages holds power over the employee, so
consent to biometric measurement is not freely given, while unpaid volunteers dissolve that
imbalance. The legal structure follows from the insight — the foundation runs the work, a
university holds the data, a BV holds the platform IP.

New spine: `Arrival → Systems (client proof) → The Lab (own ventures + research) → How I work →
Services → Contact`. "The Gap" is retired as a section and its argument relocated to the Systems
intro. Every claim carries a status tag (shipped / running / designed) and nothing marked
designed is presented as running. Private and sovereign work is described **by capability, never
by client type** — the audience is named only as "people who run things".

**Rationale:** The site said nothing about who the operator is or what he works on — his own
summary was "there's literally nothing there". Meanwhile the real inventory (Cutting Edge,
Zenithcred, Interwall, a private voice assistant, eight shipped sites) was almost entirely absent.
Evidence-first ordering was chosen over thesis-first because a stranger grants attention for
evidence and spends it on a claim, not the reverse.

**Consequences:** One accordion component, used at the **top level only** — nesting it inside a
case page was built, rejected, and removed; four workflows are something to scan, not to operate.
Side-page spacing was tightened globally (`120/120/84px` → `88/72/48px`). The site is explicitly
**not positioned toward** advertising defense or weapons capability, for commercial reasons
recorded in spec §10 so a later session does not reopen it as an oversight. Nine operator content
inputs (spec §9) gate publication but not construction; §9.3 (Cutting Edge naming, the floor plan
and the €66.900,90 figure) is a **live exposure already on oopuo.com**. Full spec:
`docs/superpowers/specs/2026-07-31-oopuo-intelligence-repositioning-design.md`. Build plan:
`docs/superpowers/plans/2026-08-01-repositioning-build.md`. Next decision id: **D-029**.

---

## §C — Design spec & roadmap (D-024 restructure · architecture D-025)

> Overwritten 2026-06-11. The previous §C (abandoned Astro Phases 0–7 + old OQ table) lives in
> git history (`git log -p -- PROJECT.md`). This section is the **approved design spec** for
> the D-024 multi-page restructure — architecture decision **D-025**, grounded in the
> 2026-06-11 six-agent audit (SEO · code drift · content inventory · GDPR/LGPD · engineering
> quality · platform research). Operator approved Approach B + all four forks on 2026-06-11.

### §C.1 Audit-verified status (2026-06-11)

**Live defects (Phase 0 fixes):**
- **NL/FR have zero working contact channels.** Their form block is the legacy `hbspt.forms.create` embed (cannot render new-builder forms) with placeholder `YOUR_HUBSPOT_FORM_ID` — renders nothing, throws console errors, loads HubSpot's script eagerly (pure IP disclosure). No mailto exists anywhere on `/nl/` or `/fr/`.
- **"Book a free call" 404s** on EN/NL/FR (placeholder Meetings slug `…/oopuo`).
- **`og:image` 404s on all 4 pages** (`https://oopuo.com/og-default.png` does not exist) — every social/WhatsApp share renders imageless. Brazil's whole motion is WhatsApp sharing.
- **Meta Pixel loads `fbevents.js` pre-consent on every page view** (even with the placeholder ID = visitor IP disclosure to Meta) plus an ungatable `<noscript>` beacon. No consent banner, no privacy policy, no legal pages anywhere; `/fr/` lacks statutory mentions légales (LCEN Art. 6-III); NL/FR/pt-br **affirmatively claim** AVG/RGPD/LGPD compliance with nothing behind it — falsifiable by any DPO in a 30-second tag scan.
- Google Fonts from Google's CDN on all 4 (LG München I pattern). Three.js from unpkg: **unminified** ~1.2MB + 9-request module waterfall, no preconnect/SRI/fallback.

**Engine facts:** the inline engine is 99.95% identical across the 4 files (ONE divergent line: localized `LABELS`); all real drift is body-level, from commit 119414a (EN-only HubSpot fix). ~180 lines dead particle code (`__dead_oldShapes`) ×4. `prefers-reduced-motion` stops rotation but NOT the 5.2s morph (the CLAUDE.md §5 invariant is currently false — Phase 1 makes it true). Hidden rooms are `opacity:0` only → a11y-tree/tab-order pollution; blog cards + back-links not keyboard-operable; zero `:focus-visible` styles; `--ink-faint` is 2.7:1 contrast. No `.htaccess`, no 404 page, `.DS_Store` shipped, 38KB favicon.svg, no favicon.ico / apple-touch-icon.

**Verified good:** per-locale title/description/canonical/hreflang/sitemap all consistent; full content in initial HTML (no JS-rendering dependence); track separation intact (zero leakage; EN's 4 "WhatsApp as support channel" mentions whitelisted by D-025); Satoshi/Fontshare never loaded by any page (font canon corrected, D-025); Hostinger honors `.htaccess` (LiteSpeed, hot-reload).

### §C.2 Architecture (D-025) — hybrid app-shell, real URLs, still no build

Every room / service / blog post / legal page becomes a **complete static HTML file** with full
content, title, meta, canonical, hreflang, OG and JSON-LD in the **initial HTML** — the 2026
professional bar (Google renders JS, but **no major AI crawler executes JavaScript**:
GPTBot/ClaudeBot/PerplexityBot read raw HTML only). Real `<a href>` links everywhere — no hash
routing, no buttons-as-links.

On top, a **hand-rolled fetch + DOM-swap + `history.pushState` router** (~150–180 lines vanilla
JS in `assets/js/router.js`) preserves the canvas experience: the Three.js/ASCII sculpture + HUD
are mounted **outside the swapped container** and live for the whole session; on navigation the
router fetches the next page, swaps `<main>`, runs the existing 5.2s morph + palette switch, and
updates URL/title/meta. Wheel/touch/keyboard snap-scroll works exactly as today — the URL bar
follows the rooms. (Verified: this is the standard 2026 pattern for persistent-WebGL sites —
the swup/taxi.js pattern, hand-rolled to honor no-build. Cross-document View Transitions
**cannot** keep a WebGL canvas alive — they animate page snapshots; Firefox lacks them.)

**Router contract:**
- Intercept only same-origin, **same-locale-prefix** links. Crossing the Europe↔Brazil boundary
  (or any locale switch) is ALWAYS a full page load → D-018 separation becomes architectural.
- `popstate` handling; `history.scrollRestoration='manual'` with positions in `history.state`;
  `AbortController` on rapid navigation; hard fallback `location.href` on any error.
- Per swap: sync `document.title`, `<link rel=canonical>`, meta description; move focus to the
  new content; fire consent-gated virtual pageviews (Pixel/HubSpot); re-init the HubSpot form
  when a contact container enters the DOM (iframe `min-height` quirk, CLAUDE.md §6).
- Prefetch adjacent rooms via `fetch()` on hover/intersection (works in ALL JS browsers incl.
  iOS Safari — Speculation Rules is Chromium-only; `rel=prefetch` has no Safari support).
- Progressive enhancement: `@view-transition { navigation: auto }` (CSS at-rule only — the
  `<meta>` variant is deprecated and silently dead) wrapped in
  `@media (prefers-reduced-motion: no-preference)` → native crossfade in Chromium 126+ /
  Safari 18.2+ (~81% global) when JS is off or the router bails. Firefox: normal loads.
- Legacy deep links: a tiny **hash-redirect shim** on each locale's home page maps the live hash
  routes (`#02`, `#03/M.01/2`, `#05/POST.01`, `#enterprise`) to the new real URLs. Hash
  fragments never reach the server — this must be client-side JS, not `.htaccess`.

**Per-page config instead of copy-paste** — each page defines `window.OOPUO` before the shared
engine loads:

```html
<script>
window.OOPUO = {
  locale: 'nl', track: 'europe',            // 'europe' | 'brazil' — gates integrations
  rooms: [1, 2], totalRooms: 6,              // rooms on THIS page + global counter
  palette: 'cyan',                           // 'cyan' | 'warm' — page-level (no longer bound to data-room 5)
  labels: { rooms: [...], end: 'EINDE', prev: 'VORIGE', next: 'VOLGENDE' },
  integrations: { metaPixelId: null, hubspotFormId: null, whatsapp: null }
}
</script>
```

Feature presence (sub-rooms, blog reader, enterprise) is **derived from the DOM**, never
hardcoded maps (`HAS_CONTENT` deleted). The hash-router block (~85 lines) is replaced by the
fetch router; everything else (room slide, sculpture bridge, HUD painters, wheel/key/touch nav,
morph engine) ports unchanged.

### §C.3 Target tree & URL map

```
public_html/
  index.html                       EN home — rooms 1+2 (Arrival + The Gap)
  services/index.html              room 3 (modules index)
  services/websites/index.html     M.01 — Overview+Examples+Process+Pricing merged (one strong page)
  services/ai-support/  services/automation/  services/integrations/    (M.02–M.04, same shape)
  studio/index.html                room 4
  blog/index.html                  room 5 (warm palette via page config)
  blog/eu-ai-act-smb-guide/        blog/ai-automations-20-hours-week/
  blog/agent-observability-compliance/   blog/why-we-cap-at-five-clients/
  blog/content/<slug>.md           post sources (front-matter + body) — source of truth
  contact/index.html               room 6 (form + meetings + mailto)
  enterprise/index.html            the overlay as a REAL page (biggest single SEO win)
  privacy/  terms/
  nl/{index, diensten, studio, aanpak, contact, privacy}/        lean — no blog/enterprise until translated
  fr/{index, services, studio, approche, contact, confidentialite, mentions-legales}/
  pt-br/{index, solucoes, como-funciona, contato, privacidade}/  Brazil track, own IA:
        / = rooms 1+2 · /solucoes/ = rooms 3+4 (Soluções + Parceria) · NO enterprise/blog/HubSpot
  assets/css/canvas.css            shared style block (extracted verbatim) + page styles
  assets/js/engine.js  assets/js/router.js  assets/js/consent.js
  assets/fonts/                    self-hosted woff2: Instrument Sans, Instrument Serif, JetBrains Mono
  assets/vendor/three/             self-hosted MINIFIED three@0.160.0 + 5 addons + transitive deps
  media/og/                        per-track OG images (1200×630)      media/blog/  post banners
  404.html  .htaccess  robots.txt  sitemap.xml  favicon.svg  favicon.ico  apple-touch-icon.png
```

Slugs diacritic-free (`solucoes`, `contato`). hreflang per page-equivalent across locales; pages
without a counterpart (e.g. `/enterprise/`) carry self-referencing EN-only hreflang. sitemap.xml
lists every page with `lastmod`. The room *journey* is unchanged: a page may hold 1–2 rooms and
the router carries snap-scroll seamlessly across page boundaries.

### §C.4 Blog pipeline (D-025)

Source of truth: `blog/content/<slug>.md` — front-matter (`title, date, locale, category,
description, banner, slug`) + markdown body. Rendered by **`tools/render_posts.py`**: a
~100–150-line **python3 stdlib-only** script (no pip, no npm, nothing to install on macOS), run
manually per post. It renders a markdown subset (h2/h3, paragraphs, bold/em, links, lists,
blockquote, code) into `public_html/blog/<slug>/index.html` via `tools/templates/post.html`, and
regenerates the blog-index cards + sitemap entries between HTML marker comments.
**Sanctioned exception to "no build" (D-025):** it is an *authoring tool* — zero toolchain, zero
deps, no watch/bundle; output is committed static HTML; `tools/` never deploys. Canonical post
metadata fixed during migration (post 1 = Guides · May 2026; reader text is canonical). Each
post: Article JSON-LD, per-post OG banner in `media/blog/`, warm palette.

### §C.5 Compliance layer (Phase 3 — mandatory before any real tracking ID)

- **Legal pages** (controller identity needed from operator — §C.8): `/privacy/`, `/terms/`,
  `/nl/privacy/`, `/fr/confidentialite/`, **`/fr/mentions-legales/`** (statutory: éditeur,
  directeur de la publication, hébergeur), `/pt-br/privacidade/` (LGPD wording, ANPD,
  encarregado). Each names processors (HubSpot eu1, Meta, Hostinger), transfers (DPF/SCCs),
  retention, rights, supervisory authority; cookie table (`_fbp`, `hubspotutk`, `__hstc`…)
  folded in. Linked from a new shared footer on every page + added to sitemap.
- **Consent module** (`assets/js/consent.js`, ~2–3KB, self-built, no third-party CMP):
  localStorage `oopuo_consent = {marketing, v, ts}`; first-visit banner with equal-prominence
  Accept/Decline; site fully functional on Decline; versioned re-prompt. **Per-track wording**
  (GDPR/cookies on Europe pages; LGPD in Portuguese on pt-br — never mixed, D-018).
- **Meta Pixel** loads ONLY after consent via `loadMetaPixel()`; `<noscript>` beacons deleted
  permanently. The real ID ships only behind the gate.
- **HubSpot form** consent-gated (or click-to-load); in the portal: disable non-essential form
  cookie tracking, enable the GDPR lawful-basis checkbox, execute the DPA. Meetings link stays a
  plain link. **Per-locale forms** (operator creates NL + FR forms in the new builder; the form
  ID is per-page config).
- The on-page AVG/RGPD/LGPD claims stay only because this layer makes them true.

### §C.6 Phased roadmap (each phase ends deployable; operator uploads `public_html/`)

**Phase 0 — Triage (live-defect fixes; no restructuring). ✅ DONE 2026-06-11** (`caaa43d`→`a9ad774`; one deviation: Pixel kept as an *inert* placeholder rather than removed, per operator).
`og-default.png` created (per-track variants: Europe + Brazil) and referenced correctly; dead
legacy HubSpot block deleted from NL/FR; `<noscript>` Pixel beacons deleted everywhere;
placeholder Pixel snippet fully removed (returns consent-gated in Phase 3); mailto fallback
added to NL/FR room 6; "Book a free call" repointed at the contact room until the real Meeting
slug exists.
*Exit: zero broken conversion paths, zero console errors, zero pre-consent Meta loads, shares show an image.*

**Phase 1 — Shared foundation (UX unchanged). ✅ DONE 2026-06-12** (`c594e41`→`a7f9c96`; 0 cross-origin requests, pages 2557/2263→508/216, verified on fresh preview).
Extract `assets/css/canvas.css` + `assets/js/engine.js` driven by per-page `window.OOPUO`;
reconcile NL/FR markup to EN's embed pattern (gated until Phase 3); self-host fonts + minified
three.js (+ `modulepreload` chain); delete dead code (`__dead_oldShapes`, EN stub, inert
scaffolding on lean pages); fix reduced-motion (instant sculpture swap + media-query `change`
listener); render-loop hardening (visibilitychange pause, dirty-check, explicit
`setPixelRatio(1)`, try/catch WebGL-failure poster fallback); a11y baseline (`inert`/
`visibility:hidden` on hidden rooms, `:focus-visible` teal outline, real links for blog/back,
`<main>` + skip link, `--ink-faint` lifted to ≥4.5:1); `<noscript>` stacked-content fallback.
*Exit: 4 single-page locales visually identical to today on shared assets; pre-consent
third-party surface = zero.*

**Phase 2 — The split. ✅ EN DONE 2026-06-18** (D-026). The EN (Europe) track is fully split into
real crawlable pages on the persistent-sculpture router; NL/FR/pt-br remain single-page (split
per-track later — OQ-8/§D structure stream).
- Router (`assets/js/router.js`): fetch + DOMParser + swap `<main#main>` only (sculpture/HUD persist) + pushState/popstate + manual scrollRestoration + hover/focus prefetch; **hard-loads across the Europe↔Brazil boundary** (D-018) and on any failure.
- Engine (`assets/js/engine.js`) dual-mode: legacy single-page (no `journey`) vs **router-mode** (`initRouterMode`) supporting journey stops, **side pages** (own `label`/`counter`, not nav stops — enterprise / service-detail / blog-post / legal), and **multi-room in-page snap** (home = Arrival↔The Gap on one URL, boundary scroll soft-navs).
- EN pages live: `/` (rooms 1+2), `/services/` + 4 details (`websites|ai-support|automation|integrations`), `/studio/`, `/enterprise/`, `/blog/` + 3 posts, `/contact/`. Each = full content + meta/OG (+ Article JSON-LD on posts) in initial HTML.
- Hash-redirect shim (EN home `<head>`): `#03/M.01/2`→`/services/websites/`, `#05/POST.NN`→post, `#enterprise`→`/enterprise/`, `#01/#02` stay on `/`. Verified.
- **Locale switcher** (EN·NL·FR·PT → each locale home) + **root geo-suggest** (dismissible, `navigator.languages`, persisted in localStorage) injected by the shared engine into the HUD — so every page (incl. legacy locales) gets it with zero per-file edits.
- `sitemap.xml` regenerated with all EN URLs; hreflang matrix on home + locale homes.
- Verified end-to-end on fresh Playwright (in-page snap, boundary soft-nav, nav-rail jumps, side pages, warm-palette blog, direct deep-load, 0 console errors).
JSON-LD: Organization (home) + Service & BreadcrumbList (4 service pages) + Article & BreadcrumbList (3 posts) — 11 blocks, all valid.
**NL + FR now have FULL parity (D-027, 2026-06-19)** — both split into the same 13-page router tree as EN, all content translated, hreflang matrix + sitemap (40 URLs) regenerated, switcher maps to the equivalent page per locale.
*Remaining: blog markdown authoring pipeline (§C.4 — pages exist, hand-authored; the python3 renderer is operator-convenience, deferred); **pt-br deep content** — it stays Brazil-native (D-018), so its blog/service/enterprise-equivalent pages must be authored in the Brazil strategy (offers, R$ pricing, WhatsApp, parceria), not translated from EU material.*
*Exit (EN): every section/post is a real URL with full raw-HTML content; morph + snap-scroll feel identical; old hash links redirect. ✅*

**Phase 3 — Compliance + conversion (§C.5).**
Legal pages, shared footer, consent module; THEN the operator inputs land: real Meta Pixel ID,
per-locale HubSpot forms on NL/FR, real Meeting slug.
*Exit: pre-consent tag scan clean; NL/FR can convert; compliance claims true; form + pixel +
meeting tested live on oopuo.com.*

**Phase 4 — Ops polish + launch QA.**
`.htaccess` (https + single-host 301, HSTS, nosniff, Referrer-Policy, Permissions-Policy,
`frame-ancestors`/`object-src`/`base-uri` CSP, long-cache `/assets/`+`/media/` with versioned
filenames, no-cache HTML, `ErrorDocument 404`); branded `404.html` (static aesthetic, no
Three.js); favicon set (ico + apple-touch + `theme-color`, shrunk SVG, mask-icon color fixed);
`.DS_Store` excluded from deploys; Lighthouse + keyboard pass + cross-locale proofread; Search
Console sitemap submit.
*Exit: §C.7 checklist green on the live domain.*

### §C.7 Verification (on live oopuo.com — HubSpot/Pixel do not render on localhost)

1. `curl` every URL → full room content present in raw HTML (validates Google + AI crawlers + no-JS in one check).
2. Every CTA on every locale: meeting books, forms submit (EN/NL/FR), WhatsApp opens with prefill (pt-br), mailto works.
3. Console error-free on all pages; pre-consent network tab shows no Meta/HubSpot/Google origins.
4. Back/forward + scroll restoration through a full room journey; hash-era URLs redirect.
5. Keyboard-only journey: every interactive element reachable + operable; focus always visible.
6. Share-preview debuggers (LinkedIn/WhatsApp) show the correct per-track OG image.
7. Lighthouse mobile on `/` and one post (expect a large perf jump from self-hosted minified three.js).

### §C.8 Operator inputs needed

| Input | Needed for | Status |
|---|---|---|
| Real Meta Pixel ID | Phase 3 | missing |
| Real HubSpot Meeting slug | Phase 3 (Phase 0 works around) | missing |
| NL + FR HubSpot forms (new builder) → 2 form IDs | Phase 3 | missing |
| Legal entity details (name, address, KvK/CNPJ, contact email; FR: directeur de la publication) | Phase 3 legal pages | missing |
| Spec sign-off | Phase 0 start | requested 2026-06-11 |

### §C.9 Open questions

| ID | Question | Status | Notes |
|---|---|---|---|
| OQ-2 | Low-end mobile perf of Three.js+bloom+ASCII | OPEN — mitigated | Phase 1 hardening (pause, DPR cap, degradation hooks); benchmark on a cheap Android in Phase 4 QA. |
| OQ-8 | Translate blog + enterprise to NL/FR? | RESOLVED (D-027, 2026-06-19) | NL + FR now carry the full EN tree (services details, blog + posts, enterprise) translated. pt-br stays Brazil-native (separate deep content to author, not translate). |
| OQ-9 | pt-br per-segment outbound landers? | OPEN | Future; the architecture supports it (one page = one file). |

OQ-1/3/4/5/6/7 resolved historically (D-017/D-019/D-020) — see DECISIONS.md. Keystatic (D-019)
is formally superseded by §C.4 (D-025).

---

## §D — Workstreams (stream memory)

> ⚠️ The "Lobby" / "Astro" streams below are obsolete (Astro removed, D-021). Current
> streams: **content** (per-locale copy), **structure** (the D-024 multi-page static build),
> **integrations** (HubSpot/Pixel/WhatsApp), **deploy** (Hostinger upload). See `HANDOFF.md`.

Pick one stream per task. Read only the stream you are working in.

### §D.1 Lobby stream

**Scope:**
- Primary root: `public/lobby.html` (the single file)
- Supporting: `design/08-v2-lobby/STATE.md` (canonical state), `design/08-v2-lobby/GRAPH.md` (site graph)
- All canvas sculpture, navigation, morph, color, room content work. **Canvas is non-shipping (D-017)** — it is the visual spec the Astro rebuild matches.

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
- Build **pixel-accurate to the canvas** (D-017); the conventional dual-context v1 design is superseded. Sculpture is a persistent View-Transitions island; every section is a real crawlable route.
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
- **Two tracks, never mixed (D-018):** Europe = English, enterprise / EU AI Act tone. Brazil = pt-BR, plain owner-to-owner Portuguese, SMB / WhatsApp / partnership / LGPD. Source for Brazil copy: the internal strategy guide ("OOPUO — Guia estratégico interno").
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
- Domain, hosting, deployment pipeline (OQ-6)
- SEO (meta tags, OpenGraph, JSON-LD, sitemap, robots.txt)
- Analytics, cookie consent, GDPR
- Astro rebuild deployment (§C.2 Phases 5–6) + perf/a11y hardening
- Performance benchmarking (OQ-2)

**Delivery contract:**
- OQ-1 resolved (D-017). Deploy after §C.2 Phases 1–5 complete; English-first.
- All production decisions logged in §B.
- Performance budget defined before launch (Lighthouse ≥ 90).

**Recent work:**
- None yet. Unblocked by D-017; work starts at §C.2 Phase 0 decisions (OQ-2/4/5/6).

---

## §E — Handoff (current next-step)

> Overwrite per session. As of **2026-08-01**. Read `AGENTS.md §8` for the hot snapshot, then the
> spec and the plan named below. Trust those three over anything older in this file.

**Mode:** solo operator + Claude. **NO build step** — plain static HTML/CSS/JS in `public_html/`,
uploaded to Hostinger. Preview: `python3 -m http.server 4330 --directory public_html`.
Live integrations (HubSpot form, Meta Pixel) only verify on the real https domain.

**A repositioning is in flight (D-028).** EN is becoming **OOPUO Intelligence — a personal lab**.
- Spec: `docs/superpowers/specs/2026-07-31-oopuo-intelligence-repositioning-design.md`
- Plan: `docs/superpowers/plans/2026-08-01-repositioning-build.md`
- Read both before touching EN content or the room structure. NL/FR/pt-br are frozen until EN is
  approved live — do not propagate anything early.

**Shipped in the 2026-08-01 session:**
- Repo coherence: `AGENTS.md` and `public_html/media/` were **untracked** while being depended on;
  both now tracked. `.screenshots/` and `/material/` ignored.
- Engine: the edge-scroll rework was reviewed and committed **with a real bug fixed** — a passive
  wheel listener runs after the compositor applies the scroll, so one hard flick both scrolled a
  section to its end and crossed into the next. The gate now reads a settled position.
- Perf: sculpture visible at **~986ms, was 2372ms** (UnrealBloomPass is built lazily after the
  first frame); work images **4.4MB → 272KB** as WebP; console is silent (`willReadFrequently`).
- Home: split hero (text and sculpture never overlap) + the **Systems deck** in room 2.
- `/systems/cutting-edge/` — the card activates into a real page. 41 URLs in the sitemap, exact
  parity with the page tree.

**Next, in order (plan §2):**
1. `/lab/` + `/lab/zenithcred/` — the most important new page on the site; it carries the
   consent argument that is the whole positioning.
2. `/systems/websites/` — clears the last 404 from the Systems deck.
3. Mobile overlay menu — the homepage still exposes ~7 links and no menu under 900px.
4. `/services/private/` — gated on operator input §9.9 (the demonstrable capability list).
5. Demote Services to position 5, retitle Studio to "How I work", add the capability bench.

**Blocked on operator (spec §9):** the Cutting Edge workflow list · whether the Power BI /
inventory / assistant work is client work or Interwall · **Cutting Edge's agreement to be named,
which is already live on oopuo.com** · the foundation's name and its founder's consent · what
Zenithcred is (programme or platform) and whether the name is registered · what a Lab reader
should do · a name for the voice agent · what "power business integrations" means · **the
demonstrable private/sovereign capability list**. Plus the older four: real Meta Pixel ID, real
Meeting slug, NL+FR HubSpot form IDs, legal entity details.

**Unverified:** touch/swipe. Synthetic touch events do not drive native scrolling, so the
edge-scroll and deck tap behaviour need a real device on the deployed site.

**Do not:** reintroduce a build step / Astro / npm. Mix Europe and Brazil framing (D-018). Use
WhatsApp green. Nest the accordion inside a case page (built, rejected, removed). Publish a
capability on `/services/private/` without a matching entry on the §9.9 list.

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
- **2026-05-18 — D-017** — Direction locked: canvas = design sketch (never ships), Astro = product rebuilt pixel-accurate to it. OQ-1 + OQ-3 resolved. Full deployment roadmap (Phases 0–7) written into §C.2.
- **2026-05-18 — D-018** — Two markets, two strategies locked from the operator's strategy guide: Europe/English (enterprise, EU AI Act) + Brazil/pt-BR (SMB: WhatsApp-first, partnership, R$, LGPD, Goiás). Locale = strategy, not translation. Added OQ-7 (Brazil launch sequencing).
- **2026-06-01 — D-019** — Launch scope locked: EN/pt-BR/NL/FR at launch on Hostinger; HubSpot (contact/scheduling, TBD); Keystatic (blog); static set-and-forget. OQ-3/5/6/7 resolved, OQ-4 tentative.
- **2026-06-02 — D-020/D-021** — Pivot to **static, no build**; Astro removed entirely (src/public/config/node_modules deleted). Built the canvas single-page per locale.
- **2026-06-02 — D-022** — NL + FR Europe pages shipped; HubSpot Meetings wired (placeholder slug).
- **2026-06-03 — D-023** — Meta Pixel installed (all 4); `site/`→`public_html/`; HubSpot **form** embedded on EN via the new form-builder embed (real form `2fef7ceb…`); learned new-form/localhost constraints.
- **2026-06-03 — D-024** — Target architecture set: multi-page separated static (no build) + media/blog content folders. Wrote `HANDOFF.md` for the next agent (state snapshot → deployment plan).

### §F.4 Durable lessons

- **Single-file prototype is fast but has a ceiling.** `public/lobby.html` at ~2000 lines is approaching the limit of comfortable single-file editing. D-010 (hash routing) defers the Astro port but doesn't eliminate it. The port conversation (OQ-1) must happen before production.
- **Morph state needs immutable anchors.** Mutable `origPos` corrupts across multiple aborts. Permanent `homePos`/`homeScale` ensure `resetShape` always returns to ground truth. Pattern: keep one immutable copy + one mutable working copy for any position-based animation system.
- **SEO is about architecture, not file format.** Astro is SEO-strong, but a 1:1 port of the canvas would inherit its un-crawlable shape: one page, hash routing (`#NN`), JS-revealed content. Search engines index URLs + initial HTML, not `#hash` fragments. The fix is structural — each section/post becomes a real route with server-rendered HTML; the sculpture stays as decoration via a persistent View-Transitions island. Decoration can be JS-only; content cannot.
- **Palette transitions need `@property` registration.** CSS custom properties don't animate by default. Registering each `--grad-*` as `@property <color>` enables smooth 4s transitions. Without registration, colors snap.
- **Design docs are source of truth, code follows.** Enforced from day one. If code and design doc disagree, fix the code. This prevents design drift and keeps the `design/` tree reliable.
- **A locale can be a different strategy, not a translation (D-018).** OOPUO's pt-BR is a separate market (Brazil SMB) with its own offers, pricing (R$), trust signals (LGPD), and tone — distinct from the English enterprise track. Don't assume i18n = same copy translated. Check which *market* a locale serves before writing or porting its content; never leak one track's framing into the other.
- **Astro/SSG was the wrong tool here (D-020/D-021).** A heavy framework rebuild lost the loved snap-scroll/scrim/polish and added build friction for a site that's outbound-led (Brazil) and deployed by FTP. Static no-build matched the real constraints. Match tooling to the deploy reality + what already works — not to "best practice".
- **No build can still be multi-page (D-024).** The 2,500-line single file per locale is the duplication ceiling again. Without a build: extract shared `assets/` (css+js) and split sections into separate static pages that include them; keep blog content as data files (yaml/md) the operator maintains, page either hand-kept or rendered by a tiny runtime `fetch()` — no SSG.
- **HubSpot new-builder forms ≠ legacy forms.** A form built in HubSpot's new form builder ONLY renders via the new embed (`forms/embed/<portalId>.js` + `<div class="hs-form-frame">`); `hbspt.forms.create` (v2) silently renders nothing for it. The new-embed iframe is `height:100%` (collapses to 0 → give it `min-height`) and **does not render on `http://localhost`** — only the live https domain. Test HubSpot + Meta Pixel on the real domain, not locally.

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
