# oopuo-splash — master doc

Chunked retrieval. Always reach a section via its `## §X` anchor — see `CLAUDE.md §10` for the index, `§G` below for snippets.

Cadence per section:
- `§A` stable · `§B` append-only · `§F` append-only · `§C §D §E §G` overwrite freely.

---

## §A — Design system & architecture

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

**Consequences / watch-outs:** Hostinger shared hosting serves **static files only** (no serverless). So: (a) Astro must build to fully static output; (b) HubSpot forms/meetings work (client-side embeds); (c) **Keystatic's live admin needs GitHub mode + a small OAuth proxy (e.g. free Cloudflare Worker) or local mode** — pick at Phase 3; (d) a CI pipeline (GitHub Actions → build → deploy to Hostinger) gives "edit in Keystatic → auto-publish." Tracks stay separated (D-018): EU/enterprise EN/NL/FR; SMB pt-BR.

---

## §C — Roadmap & open questions

### §C.1 Status

- **Direction locked (D-017):** canvas = design; Astro = product, pixel-accurate to the canvas; English-first launch.
- Canvas (`public/lobby.html`): 6 rooms + blog reader. Module M.01 complete; M.02–M.04 stubs.
- Astro site: 12 pages, EN, builds clean — conventional design superseded, awaiting rebuild to canon.
- Nothing deployed. Hosting not chosen (OQ-6).

### §C.2 Roadmap to deployment (English-first)

> Phased plan to a live multi-locale production site shipping **EN, pt-BR, NL, FR at launch** (D-019) on **Hostinger** (static). Europe track = EN/NL/FR (enterprise); Brazil track = pt-BR (SMB) — distinct content, not a translation (D-018). After upload the site is frozen except for new blog posts. Each phase ends in a reviewable, buildable state.

**Phase 0 — Lock the canvas (design freeze)**
- Module sub-pages M.02–M.04 content + wiring (AI Support, Automation, Integrations × Examples/Process/Pricing). Optionally Studio (room 04) content.
- Benchmark canvas perf on low-end mobile (OQ-2) → decide reduced-motion / static fallback strategy. Informs Phases 1 + 5.
- Decisions only (wiring lands later): contact infra/scheduling (OQ-4), blog CMS approach (OQ-5), hosting target (OQ-6).
- Exit: the canvas is the complete, locked visual spec. Re-snapshot it in STATE.md.

**Phase 1 — Astro foundation for the canon**
- Extract the Three.js / ASCII / bloom engine from `lobby.html` into a reusable module under `src/`.
- Make the sculpture a **persistent island** that survives navigation (Astro `transition:persist` + View Transitions).
- Port canvas tokens 1:1 into Tailwind `@theme` + `@property` color vars (palette families, fonts, HUD).
- Build the shared shell layout: HUD (brand, counter, section title, nav rail) + palette-by-route + View Transitions config.
- Exit: one Astro route renders the canvas look; the sculpture persists across a test navigation.

**Phase 2 — Rooms → real routes**
- Map rooms to routes: `/` (Arrival), `/why` (The Gap), `/services` + module pages (Modules), `/studio` (Studio), `/blog` (Blog), `/contact` (Invitation).
- Each route: real server-rendered HTML content, per-route palette + sculpture on entry, room-to-room slide as a View Transition.
- Nav rail + sub-rail become real links with active states. Retire hash routing.
- Exit: every section is a crawlable URL; navigation matches the canvas feel.

**Phase 3 — Blog as real content**
- Move the 4 posts from canvas markup → MDX content collection (`src/content/blog`); resolve MDX-vs-headless (OQ-5).
- `/blog` index (featured + grid) and `/blog/[slug]` reading view matching the reader aesthetic, as real pages.
- Category filter pills → real filtering. Add RSS + per-post OG.
- Exit: SEO-indexable blog with real per-post URLs.

**Phase 4 — Conversion & integrations**
- Wire contact CTAs to the chosen tool (OQ-4): "Book a free call" + "Send a message". Contact form backend (handler + email).
- Enterprise page content (`design/03-copy/enterprise.md`). WhatsApp wizard island (`design/05-component-specs/`) if in scope.
- Exit: leads can convert end-to-end.

**Phase 5 — SEO / perf / a11y hardening**
- Per-route meta, canonical, OG/Twitter, JSON-LD (Organization + Article). sitemap.xml, robots.txt, self-referencing hreflang.
- Perf: code-split Three.js, lazy-init + reduced-motion static fallback (OQ-2), Core Web Vitals tuning. Target Lighthouse ≥ 90 all categories.
- A11y: keyboard nav, focus management across View Transitions, ARIA on nav rail, contrast, reduced-motion.
- Exit: launch-quality on every metric.

**Phase 6 — Pre-launch & deploy (Hostinger)**
- Fully static build → deploy `dist/` to **Hostinger** (D-019). CI (GitHub Actions → build → upload via FTP/SSH) so Keystatic edits auto-publish. Domain + DNS + HTTPS. Cache/security headers via `.htaccess`.
- Wire **HubSpot** embeds (forms + meetings; OQ-4, details TBD) + Brazil WhatsApp deep link. Analytics (privacy-friendly) + cookie/consent. Port privacy/terms/accessibility to canon. 404 page, OG images, hreflang across EN/pt-BR/NL/FR.
- Final cross-browser/device QA, proofread all 4 locales. Deploy → smoke test → submit sitemap to Search Console.
- Exit: **LIVE — EN, pt-BR, NL, FR.**

**Phase 7 — Post-launch (only ongoing surface: blog)**
- Operator posts new blog pages via **Keystatic** → CI rebuild/redeploy. No other changes to the frozen site (D-019).
- Optional later: extra locales (en-us, rs, zh) if needed; iterate perf/SEO from real RUM data.

### §C.3 Open questions

| ID | Question | Status | Notes |
|---|---|---|---|
| OQ-1 | v1/v2 direction — port lobby into Astro, or keep separate? | **RESOLVED (D-017)** | Canvas = design; Astro = product, pixel-accurate. |
| OQ-2 | Low-end mobile perf — Three.js + bloom + ASCII viable on cheap Android? | OPEN | Benchmark in Phase 0; static/reduced fallback in Phase 5. |
| OQ-3 | i18n / market strategy at launch? | **RESOLVED (D-019)** | EN, pt-BR, NL, FR at launch. Europe=EN/NL/FR (enterprise); Brazil=pt-BR (SMB). en-us/rs/zh deferred. |
| OQ-4 | Contact + scheduling? | **TENTATIVE (D-019)** | HubSpot (forms + meetings) embeds — static-friendly. Exact setup still to discuss. Brazil leads with WhatsApp deep link. |
| OQ-5 | Blog editing? | **RESOLVED (D-019)** | Keystatic admin UI → commits to repo → CI rebuild. (Hostinger static: GitHub mode + OAuth proxy or local mode — confirm Phase 3.) |
| OQ-6 | Domain & hosting? | **RESOLVED (D-019)** | Hostinger (static `dist/` deploy via CI). |
| OQ-7 | Brazil track at launch or fast-follow? | **RESOLVED (D-019)** | Ships at launch (pt-BR). |

### §C.4 Production gaps (all addressed by the roadmap)

- Hash-only routing / no real URLs → fixed structurally in Phases 2–3 (real routes).
- No `<meta>`/OpenGraph/Twitter/JSON-LD → Phase 5.
- No analytics, cookie consent, or 404 page → Phase 6.
- Favicon wide-aspect letterboxing → FIXED (D-014, `public/favicon.svg`).

---

## §D — Workstreams (stream memory)

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

> Overwrite per session. As of 2026-05-18.

**Current mode:**
- Solo operator (user + Claude agents).
- Direction LOCKED (D-017): canvas = design, Astro = product (pixel-accurate to canvas), English-first.
- Canvas LIVE at `http://localhost:4321/lobby.html` via `npm run dev`. Astro site builds clean (`npm run build`).
- Full deployment roadmap (Phases 0–7) written in §C.2.

**What just landed (2026-05-18):**
1. **Blog post reading view** — 4 posts, slide overlay, prev/next nav, Esc/back/nav-ball close, hash `#05/POST.NN` (D-016).
2. **Direction resolved (D-017)** — canvas/Astro relationship locked; OQ-1 + OQ-3 closed; deployment roadmap written.
3. Docs made coherent with D-017 (CLAUDE.md §1/§5/§6/§9, PROJECT.md §A/§C/§D, STATE.md, DECISIONS.md).
4. **Two-market positioning locked (D-018)** — Europe/English enterprise track + Brazil/pt-BR SMB track (WhatsApp-first, partnership, R$, LGPD, Goiás), from the operator's strategy guide. Locales ≠ translations. The "basic starting point" = Brazil track (still to be built).
5. **Launch scope locked (D-019)** — EN/pt-BR/NL/FR at launch on Hostinger; HubSpot for contact/scheduling (details TBD); Keystatic for blog; static set-and-forget. OQ-3/5/6/7 resolved, OQ-4 tentative.

**Recommended next actions (follow §C.2 roadmap):**

1. **Phase 0 — lock the canvas:** module sub-pages M.02–M.04 (AI Support, Automation, Integrations × Examples/Process/Pricing); benchmark low-end mobile perf (OQ-2); decide contact infra/scheduling (OQ-4), blog CMS (OQ-5), hosting (OQ-6).
2. **Phase 1 — Astro foundation:** extract the sculpture engine into a persistent island (View Transitions); port tokens + HUD shell to match the canvas.
3. **Phase 2 — rooms → real routes:** every section becomes a crawlable URL with View Transition navigation.
4. Then Phases 3–6: blog content collection → conversion wiring → SEO/perf/a11y hardening → deploy (English live).

**Decisions still needed from operator:** finalize **HubSpot** setup (OQ-4 — forms/meetings specifics + portal ID); plus these assets when ready: Hostinger deploy access (FTP/SSH), domain, Brazil WhatsApp number, HubSpot meeting link. Perf fallback (OQ-2) I'm defaulting to reduced-motion + static poster. Everything else locked (D-019).

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
- **2026-05-18 — D-017** — Direction locked: canvas = design sketch (never ships), Astro = product rebuilt pixel-accurate to it. OQ-1 + OQ-3 resolved. Full deployment roadmap (Phases 0–7) written into §C.2.
- **2026-05-18 — D-018** — Two markets, two strategies locked from the operator's strategy guide: Europe/English (enterprise, EU AI Act) + Brazil/pt-BR (SMB: WhatsApp-first, partnership, R$, LGPD, Goiás). Locale = strategy, not translation. Added OQ-7 (Brazil launch sequencing).
- **2026-06-01 — D-019** — Launch scope locked: EN/pt-BR/NL/FR at launch on Hostinger; HubSpot (contact/scheduling, TBD); Keystatic (blog); static set-and-forget. OQ-3/5/6/7 resolved, OQ-4 tentative.

### §F.4 Durable lessons

- **Single-file prototype is fast but has a ceiling.** `public/lobby.html` at ~2000 lines is approaching the limit of comfortable single-file editing. D-010 (hash routing) defers the Astro port but doesn't eliminate it. The port conversation (OQ-1) must happen before production.
- **Morph state needs immutable anchors.** Mutable `origPos` corrupts across multiple aborts. Permanent `homePos`/`homeScale` ensure `resetShape` always returns to ground truth. Pattern: keep one immutable copy + one mutable working copy for any position-based animation system.
- **SEO is about architecture, not file format.** Astro is SEO-strong, but a 1:1 port of the canvas would inherit its un-crawlable shape: one page, hash routing (`#NN`), JS-revealed content. Search engines index URLs + initial HTML, not `#hash` fragments. The fix is structural — each section/post becomes a real route with server-rendered HTML; the sculpture stays as decoration via a persistent View-Transitions island. Decoration can be JS-only; content cannot.
- **Palette transitions need `@property` registration.** CSS custom properties don't animate by default. Registering each `--grad-*` as `@property <color>` enables smooth 4s transitions. Without registration, colors snap.
- **Design docs are source of truth, code follows.** Enforced from day one. If code and design doc disagree, fix the code. This prevents design drift and keeps the `design/` tree reliable.
- **A locale can be a different strategy, not a translation (D-018).** OOPUO's pt-BR is a separate market (Brazil SMB) with its own offers, pricing (R$), trust signals (LGPD), and tone — distinct from the English enterprise track. Don't assume i18n = same copy translated. Check which *market* a locale serves before writing or porting its content; never leak one track's framing into the other.

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
