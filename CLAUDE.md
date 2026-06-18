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
- `room` = one full-viewport section (6: Arrival/Gap/Modules/Studio/Blog|Approach/Invitation). In the CURRENT pages all 6 live in one scroll page per locale; the TARGET (D-024) splits them into separate pages.
- `sculpture` = Three.js ASCII shape (one per room). `morph` = 5.2s transition between two. `HUD` = brand mark + counter + section title + nav rail overlay. `palette family` = `--grad-*` + `--teal` (cyan default, warm for blog/room-5).

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
- `DECISIONS.md` is the append-only log (next id: **D-027**).
- PROJECT.md section cadence: §A stable · §B/§F append-only · §C/§D/§E/§G overwrite. Update `CLAUDE.md §8` (snapshot below) at session close.
- Don't create new top-level planning files when CLAUDE.md / PROJECT.md can hold it (HANDOFF.md + DEPLOY.md are the sanctioned extras).

## 8. Current snapshot

> Overwritten at session close. Mirrors current hot state.

- branch: `main` · clean tree · **no build step** · site = `public_html/` (Hostinger-ready).
- **EN (Europe) is SPLIT** (D-026) into router pages on a 5-stop journey: `/` (rooms 1+2, in-page snap) → `/services/` (+4 details) → `/studio/` → `/blog/` (+3 posts) → `/contact/`, plus `/enterprise/` side page. Persistent sculpture/HUD survive soft-nav; each URL is a full static HTML file. **NL/FR (Europe) + pt-br (Brazil SMB) still single-page canvases** (`/nl/`, `/fr/`, `/pt-br/` — split per-track next). All pass rules (no green; pt-br has no EU/enterprise content). hreflang + regenerated `sitemap.xml` + `robots.txt` present. Locale switcher + root geo-suggest on every page.
- Integrations (after Phase 0): **Meta Pixel = inert commented placeholder on all 4** (loads nothing/0 errors until the real ID is set + uncommented — operator preference [[inert placeholders]]); **EN HubSpot form live** (real `2fef7ceb…`, new-builder embed); **NL/FR = inert new-builder form placeholder** (`YOUR_NL/FR_HUBSPOT_FORM_ID`, guarded loader injects nothing until a real ID is set) **+ `hello@oopuo.com` mailto**; "Book a free call" → **mailto** on EN/NL/FR (404 Meetings slug parked in a code comment); **per-track OG images shipped** (`og-default.png` EU / `og-default-br.png` BR, 1200×630); WhatsApp real on pt-br.
- **NEXT:** Phase 0 + Phase 1 + **Phase 2 EN split = DONE** (D-026). All EN pages live on the router (home rooms 1+2 in-page snap + boundary soft-nav; side pages for enterprise/service-details/blog-posts; hash-redirect shim; locale switcher + geo-suggest injected by shared engine; sitemap regenerated). Verified end-to-end on fresh Playwright, 0 console errors. **Remaining before Phase 3:** (1) split **NL/FR/pt-br** per-track the same way (reuse EN page set + shared router/engine; pt-br stays Brazil-only, router hard-loads the boundary); (2) **blog markdown pipeline** `tools/render_posts.py` (posts are hand-authored HTML now — deferred, operator-convenience); (3) **JSON-LD breadth** (Organization sitewide + Service + BreadcrumbList). Then **Phase 3** (compliance + conversion) when operator inputs land.
- Operator inputs pending (§C.8): real Meta Pixel ID; real Meeting slug; **NL+FR HubSpot form IDs (new builder)**; legal entity details for privacy/mentions-légales pages. (Each is a quick swap into the in-place inert placeholders. None block Phase 2.)
- Testing note: HubSpot form + Meta Pixel only verify on the **live https** domain (operator deploys to oopuo.com in seconds), not on localhost. JS changes can be browser-cached on localhost — verify in a fresh context (Playwright) not the warm preview tab.
- last session: 2026-06-18 — **Phase 2 EN split COMPLETED (D-026)**. Converted EN `index.html` to router-mode home (rooms 1+2, in-page snap, boundary soft-nav); added engine **multi-room snap** (`pageRooms`/`localIdx`/`goLocal`) + **side-page** support (already used by enterprise / 4 service details / 3 blog posts, built earlier this session). Added **locale switcher + dismissible root geo-suggest** injected by the shared `engine.js` into the HUD on every page (incl. legacy locales) + matching CSS. Added the **hash-redirect shim** to the EN home `<head>`. Regenerated `sitemap.xml` with all EN URLs. Verified the whole journey end-to-end on fresh Playwright (in-page snap, soft-nav, nav-rail, side pages, warm blog, direct deep-load, hash redirects, legacy NL page) — 0 console errors (1 harmless vendor AsciiEffect Canvas2D perf warning). Files this session: `index.html`, `assets/js/engine.js`, `assets/css/canvas.css`, `sitemap.xml`.

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
