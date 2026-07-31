# oopuo-splash — agent memory (always loaded)

Short snapshot + rules. Long-form lives in `PROJECT.md` (retrieved by `## §X` anchor)
and `DECISIONS.md` (append-only log). **This file is the source of truth for current
state** — if anything below contradicts older notes, this wins.

## 1. Identity

- Working title: OOPUO Splash. Marketing website for OOPUO, an AI systems consultancy.
- **TWO market strategies (D-018), never mixed:**
  - **Europe** (`en`, `nl`, `fr`) — English/Dutch/French, enterprise framing, EU AI Act, Amsterdam credibility, HubSpot + email contact, € pricing.
  - **Brazil** (`pt-br`) — Portuguese, SMB strategy: WhatsApp-first automated service, "parceria não produto", R$ pricing, LGPD, Goiás PMEs. Outbound motion (WhatsApp/prospecting), low SEO dependence.
  - Enterprise/EU content never shown to Brazil; WhatsApp/LGPD/partnership never shown to Europe.
- Repo: `/Users/ottogen/oopuo-splash` · GitHub: `ottogen/oopuo-splash` · Domain: **oopuo.com** (operator deploys to Hostinger `public_html` instantly — testing of live integrations happens on the real domain, not locally).

## 2. Session start

```bash
pwd && git branch --show-current && git status --porcelain
```
There is **NO build step** (D-020/D-021). No Node, no npm, no Astro. The site is plain
static HTML/CSS/JS in **`public_html/`**. To preview: `Static Site` launch config
(`python3 -m http.server 4330 --directory public_html`) → `http://localhost:4330/`.
Then read §3.

## 3. First reads

1. `PROJECT.md §E` — current handoff / next-step.
2. `PROJECT.md §B` / `DECISIONS.md` — only if the task touches a settled decision.
3. `PROJECT.md §C` — roadmap to deployment (target = multi-page restructure, D-024).
4. `design/08-v2-lobby/STATE.md` — the canvas (visual design) reference, only for look/feel.

## 4. Vocabulary

- `canvas` = the visual aesthetic (Three.js + AsciiEffect sculpture, dark-first hero, HUD, cyan/warm palette). The original single-file design lives in `design/08-v2-lobby/` history; the live pages embed the same engine inline.
- `site` = the shipped static files in **`public_html/`** (what uploads to Hostinger).
- `room` = one full-viewport section. EN is moving to **Arrival / Systems / The Lab / How I work / Services / Contact** (D-028); NL/FR/pt-br still use the old set (Arrival/Gap/Modules/Studio/Blog/Invitation). In the CURRENT pages all 6 live in one scroll page per locale; the TARGET (D-024) splits them into separate pages.
- `sculpture` = Three.js ASCII shape (one per room). `morph` = 5.2s transition between two. `HUD` = brand mark + counter + section title + nav rail overlay. `palette family` = `--grad-*` + `--teal` (cyan default, warm for blog/room-5). `deck` = the horizontal accordion (full-height panels, hover/tap expands, activates into a real URL) — **top level only**.

## 5. Invariants

### Visual canon (keep across any restructure)
- Dark-first hero, full-viewport ASCII sculpture per section; cyan family default, warm family for blog. No card shadows — glow/HUD instead.
- Fonts: **Instrument Sans** (display + body) + **JetBrains Mono** (mono) + **Instrument Serif** (blog titles). Satoshi dropped from canon (D-025). **Self-hosted** at `assets/fonts/` (16 woff2, latin+latin-ext, `@font-face` in `canvas.css`; Phase 1 — no Google CDN, GDPR). No substitutes.
- Three.js **self-hosted minified** at `assets/vendor/three/` via importmap (Phase 1 — no unpkg). `prefers-reduced-motion` disables rotation **and** morph (instant shape-swap; Phase 1 made the §5 invariant true). Render loop pauses when tab hidden + dirty-checks.
- **Engine is shared (Phase 1):** `assets/css/canvas.css` + `assets/js/engine.js` (boot/nav, reads per-page `window.OOPUO`) + `assets/js/sculpture.js` (Three.js module). Each page is now content DOM + a `window.OOPUO` config block + `<link>`/`<script>` to the shared assets (no more ~2,000-line inline copies).
- WhatsApp CTAs use **brand colors (cyan/teal/warm), NEVER WhatsApp green `#25D366`**. Whitelisted (D-025): EN service copy may name WhatsApp as a support *channel capability* (M.02); Brazil GTM framing (wa.me/LGPD/R$/parceria) stays Brazil-only.

### Structure (current → target)
- **CURRENT:** one self-contained HTML file per locale in `public_html/` (`index.html`, `nl/`, `fr/`, `pt-br/`), each the full 6-room snap-scroll canvas with inline CSS+JS. Works; deployed-ready.
- **TARGET (D-024):** **multi-page separated static, still no build** — pages split into separate `.html` files, shared assets extracted (`assets/` css+js+fonts), organized **media** folder (blog banners, og images), and a **blog** folder where each post is a content file (yaml/markdown: title, date, body, banner image name) + its rendered page. The next agent plans + executes this (see PROJECT.md §C, §E).

### Content/SEO
- Each section/post should become a REAL crawlable URL (no hash-only routing) once split.
- Strings are currently hardcoded per locale page; the restructure may centralize them.

## 6. Integrations (wired this session — IDs are real)

- **HubSpot** portal **`148607612`**, region **`eu1`**, owner `clubeedg@gmail.com`.
  - **Form** (EN contact / room 6): `data-form-id="2fef7ceb-b34c-4792-9a0d-1a2d618767b9"`, **NEW form-builder** embed (`<script src="https://js-eu1.hsforms.net/forms/embed/148607612.js">` + `<div class="hs-form-frame" data-region data-form-id data-portal-id>`).
    - ⚠️ **New-builder forms do NOT work with the legacy `hbspt.forms.create` v2 API** (it silently renders nothing). Use the new embed only.
    - ⚠️ The new embed renders in an **iframe set to `height:100%`** → collapses to 0 in an auto-height container; give it `min-height`. It is loaded only when the contact room becomes visible so it can size.
    - ⚠️ **The HubSpot form does NOT render on `http://localhost`** — only on the real **https** domain. Test on oopuo.com.
    - EN live (real form). **NL/FR now carry an inert new-builder placeholder** (`YOUR_NL_HUBSPOT_FORM_ID` / `YOUR_FR_HUBSPOT_FORM_ID`) — a guard injects nothing from HubSpot until the placeholder is replaced with a real per-locale form ID; `hello@oopuo.com` mailto is the live fallback meanwhile (Phase 0). Brazil keeps WhatsApp, no form.
  - **Meetings** ("Book a free call", EN/NL/FR): real Meeting not yet created — Phase 0 **parked the placeholder slug `…/oopuo` in a code comment** and points the live CTA at a `mailto:` (the slug 404'd on click). Set the real slug + restore the button to activate.
- **Meta Pixel** — base code present in `<head>` of ALL 4 pages but **inert (wrapped in an HTML comment)** since Phase 0 — it loads nothing and logs no error. The placeholder **`YOUR_META_PIXEL_ID`** stays for a quick swap; to activate, set the real ID and uncomment (the in-file "TO ACTIVATE" note explains). Phase 3 gates it behind consent.
- **WhatsApp (Brazil)** — real number **+55 66 99232-3668** → `https://wa.me/5566992323668`, brand-colored buttons.

## 7. Execution & write rules

- One bounded task at a time. **No build step** — never reintroduce Astro/npm (tried + removed, D-020/D-021).
- `DECISIONS.md` is the append-only log (next id: **D-029**).
- PROJECT.md section cadence: §A stable · §B/§F append-only · §C/§D/§E/§G overwrite. Update `AGENTS.md §8` (snapshot below) at session close.
- Don't create new top-level planning files when AGENTS.md / PROJECT.md can hold it (HANDOFF.md + DEPLOY.md are the sanctioned extras).

## 8. Current snapshot

> Overwritten at session close. Mirrors current hot state.

- branch: `main` · clean tree · **no build step** · site = `public_html/` (Hostinger-ready).
- ⚠️ **A REPOSITIONING IS IN FLIGHT (D-028).** The **EN** site is becoming **OOPUO Intelligence —
  a personal lab**, whose job is credibility that converts into **contracts, not investment**.
  Signature trait, which every section reinforces: *give him a problem that is blocked — legally,
  structurally, or by privacy — and he finds the configuration that unblocks it.* New spine:
  **Arrival → Systems** (client proof) **→ The Lab** (own ventures + research) **→ How I work →
  Services → Contact**. "The Gap" retired as a section. Nothing ships without a **status tag**
  (shipped / running / designed). Private work is described **by capability, never by client
  type**. Read before touching EN content or room structure:
  spec `docs/superpowers/specs/2026-07-31-oopuo-intelligence-repositioning-design.md` ·
  plan `docs/superpowers/plans/2026-08-01-repositioning-build.md`.
  **NL/FR/pt-br are frozen** until EN is approved live — do not propagate early.
- **EN home is repositioned:** room 1 = split hero (text and sculpture never overlap), room 2 =
  **Systems deck** — the one accordion component (full-height panels, hover/tap expands,
  activating navigates to a real URL). **Top level only** — nesting it inside a case page was
  built, rejected, removed. `/systems/cutting-edge/` is live (workflows are a plain list there).
  Still 404: `/systems/websites/`, `/lab/`.
- **EN + NL + FR (Europe) are all fully SPLIT** (D-026 EN, D-027 NL/FR) into the same 13-page router tree on a 5-stop journey: `/` (rooms 1+2, in-page snap) → `/services/` (+4 details) → `/studio/` → `/blog/` (+3 posts) → `/contact/`, plus `/enterprise/` side page. Translated content per locale (NL "je", FR "vous"). Persistent sculpture/HUD survive soft-nav; each URL is a full static HTML file. **pt-br (Brazil SMB) still single-page** (`/pt-br/`) — kept Brazil-native (D-018); its deep content must be authored, not translated. All pass rules (no green; pt-br has no EU/enterprise content). Full hreflang matrix + regenerated `sitemap.xml` (**41 URLs**, incl. `/systems/cutting-edge/`) + `robots.txt`. Locale switcher (→ equivalent page per locale) + root geo-suggest on every page.
- Integrations (after Phase 0): **Meta Pixel = inert commented placeholder on all 4** (loads nothing/0 errors until the real ID is set + uncommented — operator preference [[inert placeholders]]); **EN HubSpot form live** (real `2fef7ceb…`, new-builder embed); **NL/FR = inert new-builder form placeholder** (`YOUR_NL/FR_HUBSPOT_FORM_ID`, guarded loader injects nothing until a real ID is set) **+ `hello@oopuo.com` mailto**; "Book a free call" → **mailto** on EN/NL/FR (404 Meetings slug parked in a code comment); **per-track OG images shipped** (`og-default.png` EU / `og-default-br.png` BR, 1200×630); WhatsApp real on pt-br.
- **NEXT (see plan §2):** `/lab/` + `/lab/zenithcred/` → `/systems/websites/` → mobile overlay
  menu → `/services/private/` (gated on input §9.9) → demote Services / retitle Studio. Phases 0–2
  (triage, shared foundation, EN+NL+FR split, JSON-LD) are DONE. Still queued behind the
  repositioning: **pt-br deep content** (authored Brazil-native, D-018 forbids translating the EU
  material — needs operator direction on the Brazil offer set); **blog markdown pipeline**
  `tools/render_posts.py` (deferred, operator convenience); then **Phase 3** (compliance +
  conversion).
- Operator inputs pending: **nine content inputs for the repositioning** (spec §9, tabulated in
  plan §4) — they gate **publication, not construction**, so build with placeholders. **§9.3 has a
  clock on it: Cutting Edge's name, floor plan and the €66.900,90 figure are ALREADY LIVE on
  oopuo.com** — a current exposure, not a future one. **§9.9** (demonstrable private/sovereign
  capability list) gates `/services/private/` entirely. Plus the older four: real Meta Pixel ID;
  real Meeting slug; **NL+FR HubSpot form IDs (new builder)**; legal entity details for
  privacy/mentions-légales. (Each of those four is a quick swap into an in-place inert placeholder.)
- Testing note: HubSpot form + Meta Pixel only verify on the **live https** domain (operator deploys to oopuo.com in seconds), not on localhost. JS changes can be browser-cached on localhost — verify in a fresh context (Playwright) not the warm preview tab.
- last session: 2026-08-01 — **repositioning brainstormed, specced, and started (D-028).** Spec +
  build plan written; `DECISIONS.md`, `PROJECT.md §B/§E`, `HANDOFF.md` all updated. Ten commits.
  **Repo coherence:** `AGENTS.md` and `public_html/media/` were **untracked while being depended
  on** (a fresh clone lost all agent memory; live pages referenced files not in the repo) — both
  now tracked; `.screenshots/` + `/material/` ignored; 18MB of root PNG debris archived.
  **Engine:** the uncommitted edge-scroll rework was reviewed and committed **with a real bug
  fixed** — the wheel listener is passive, so the compositor applies the scroll *before* the
  handler runs and `scrollTop` read "at the edge" for a flick that had only just arrived; one hard
  flick both scrolled a section to its end and crossed into the next (600px skipped all 383px of
  room 1). The gate now reads a **settled** position sampled on a scroll-idle debounce.
  **Perf:** sculpture visible **2372ms → 986ms** (UnrealBloomPass compiles ~7 shaders and
  allocates 5 mip targets at construction — now built lazily after frame 1); work images **4.4MB →
  272KB** as WebP; `willReadFrequently` on the AsciiEffect context → console **completely
  silent**; hero fonts preloaded. **UI:** split hero, Systems deck, `/systems/cutting-edge/`
  (41 sitemap URLs, exact parity), side-page spacing tightened `120/120/84` → `88/72/48`.
  **Unverified: touch/swipe** — synthetic touch events do not drive native scrolling; needs a real
  device on oopuo.com. **Next:** `/lab/` + `/lab/zenithcred/` (the page carrying the whole
  argument), then `/systems/websites/`, then the mobile overlay menu (the homepage still has ~7
  links and no menu under 900px).
- previous session: 2026-06-19 — **NL + FR full content parity (D-027)** + Phase 2 EN finish + JSON-LD. Earlier in the session: completed the EN split (D-026 — router-mode home, multi-room snap, side pages, locale chrome, hash shim) and added JSON-LD breadth (Organization + Service + BreadcrumbList, 11 blocks). Then, per operator directive "all languages should have all content," split **NL and FR** into the full 13-page router tree (two parallel subagents translated the EN page set: NL informal "je", FR formal "vous"; € + EU-AI-Act framing kept; inert `YOUR_NL/FR_HUBSPOT_FORM_ID` + mailto on contact). Added en/nl/fr hreflang to the 12 EN deep pages; regenerated `sitemap.xml` → 40 URLs with full cross-links; upgraded the engine locale switcher to target the **equivalent page** per locale; mobile CSS for the switcher/geo-suggest. Verified NL + FR journeys on fresh Playwright (in-page snap, soft-nav, warm blog, deep-load, cross-locale hard-load) — 0 errors. **pt-br left Brazil-native** (D-018 — its deep content must be authored, not translated). 26 new NL/FR pages.

## 9. Pointer table — `PROJECT.md` sections

| Anchor | Content | Cadence |
|---|---|---|
| `§A` | Architecture + design system | stable |
| `§B` | Decisions (D-001…) | append-only |
| `§C` | Roadmap to deployment | overwrite |
| `§D` | Workstreams | overwrite |
| `§E` | Handoff (next-step) | overwrite |
| `§F` | History + durable lessons | append-only |
| `§G` | Retrieval (CLI/artifact map) | overwrite |

## 10. Session close ritual

1. Decision landed? → append to `PROJECT.md §B` + `DECISIONS.md` (next `D-NNN`).
2. Durable lesson? → append to `PROJECT.md §F`.
3. Next-step changed? → overwrite `PROJECT.md §E`.
4. Update **§8 snapshot** above. 5. Commit on `main`.
