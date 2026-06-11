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
- Fonts: **Instrument Sans** (display + body) + **JetBrains Mono** (mono) + **Instrument Serif** (blog titles). Satoshi dropped from canon (D-025 — was never actually loaded). Currently Google Fonts CDN; target = self-hosted `assets/fonts/` (D-025, GDPR). No substitutes.
- Three.js via CDN importmap (unpkg) today; target = self-hosted `assets/vendor/three/` minified (D-025). `prefers-reduced-motion` disables rotation/morph (⚠️ morph half not yet implemented — Phase 1 of §C fixes it).
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
    - Only on EN so far → **replicate to /nl/ and /fr/** (Brazil keeps WhatsApp, no form).
  - **Meetings** ("Book a free call", EN/NL/FR): placeholder link `https://meetings-eu1.hubspot.com/oopuo` — operator must create a free Meeting and replace the `oopuo` slug.
- **Meta Pixel** — base code installed in `<head>` of ALL 4 pages with placeholder **`YOUR_META_PIXEL_ID`** (console shows `Invalid PixelID: null` until replaced). Replace with the real Pixel ID to activate.
- **WhatsApp (Brazil)** — real number **+55 66 99232-3668** → `https://wa.me/5566992323668`, brand-colored buttons.

## 7. Execution & write rules

- One bounded task at a time. **No build step** — never reintroduce Astro/npm (tried + removed, D-020/D-021).
- `DECISIONS.md` is the append-only log (next id: **D-026**).
- PROJECT.md section cadence: §A stable · §B/§F append-only · §C/§D/§E/§G overwrite. Update `CLAUDE.md §8` (snapshot below) at session close.
- Don't create new top-level planning files when CLAUDE.md / PROJECT.md can hold it (HANDOFF.md + DEPLOY.md are the sanctioned extras).

## 8. Current snapshot

> Overwritten at session close. Mirrors current hot state.

- branch: `main` · clean tree · **no build step** · site = `public_html/` (Hostinger-ready).
- 4 locales LIVE as single-page canvases: `public_html/index.html` (EN), `/nl/`, `/fr/` (Europe), `/pt-br/` (Brazil SMB). All pass rules (no green; pt-br has no EU/enterprise content). hreflang + `sitemap.xml` + `robots.txt` present.
- Integrations: Meta Pixel on all 4 (placeholder ID); HubSpot form on EN only (real form `2fef7ceb…`); HubSpot Meetings placeholder slug on EN/NL/FR; WhatsApp real on pt-br.
- **NEXT (D-025):** execute the approved spec in **PROJECT.md §C** (hybrid app-shell, Phases 0–4). Phase 0 = live-defect triage (og:image 404, NL/FR dead form + no mailto, pixel pre-consent removal, CTA repoint). Six-agent audit findings live in §C.1.
- Operator inputs pending (§C.8): real Meta Pixel ID; real Meeting slug; NL+FR HubSpot form IDs; legal entity details for privacy/mentions-légales pages.
- Testing note: HubSpot form + Meta Pixel only verify on the **live https** domain (operator deploys to oopuo.com in seconds), not on localhost.
- last session: 2026-06-11 — six-agent audit (SEO/drift/inventory/compliance/quality/research); D-025 architecture approved (4 forks decided); spec written to PROJECT.md §C.

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
