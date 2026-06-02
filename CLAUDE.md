# oopuo-splash — agent memory (always loaded)

Short snapshot + rules. Long-form lives in `PROJECT.md` and is retrieved by section anchor.

## 1. Identity

- Working title: OOPUO Splash
- What: Marketing website for OOPUO — an AI systems consultancy running TWO market strategies (D-018): **Europe** (English; enterprise / EU AI Act / Amsterdam credibility) and **Brazil** (pt-BR; SMB — WhatsApp-first automated service, partnership model, R$ pricing, LGPD, Goiás PMEs). The two audiences never see each other's framing.
- Repo: `/Users/ottogen/oopuo-splash`
- GitHub: `ottogen/oopuo-splash`
- One product, two artifacts (D-017): the **design canvas** (`public/lobby.html`, a non-shipping Three.js/ASCII sketch that defines the look) and the **production site** (Astro in `src/pages/`, rebuilt pixel-accurate to the canvas — this is what ships).

## 2. Session start

First thing every session, in order:

```bash
pwd
git branch --show-current
git status --porcelain
npm run build          # confirm clean state
```

Then read §3.

## 3. First reads

1. `PROJECT.md §E` — current handoff / next-step
2. `design/08-v2-lobby/STATE.md` — lobby prototype canonical state (if working on v2)
3. `PROJECT.md §B` — only if the task touches a settled decision
4. `PROJECT.md §D` — workstream section, only the stream you are working in
5. `PROJECT.md §A` — only if the task touches design system / architecture

Prefer CLI retrieval (`PROJECT.md §G`) over repo-wide grep.

## 4. Workstream rule

Pick exactly one workstream per task: `lobby`, `astro`, `content`, or `production`. Do not mix streams unless the task is explicitly cross-cutting. Stream memory lives in `PROJECT.md §D`.

## 5. Locked vocabulary

- `lobby` / `canvas` = the design canvas at `public/lobby.html` (Three.js + AsciiEffect + bloom). Non-shipping sketch; source of truth for the visual design.
- `astro site` = the production site in `src/pages/` (static, Tailwind, i18n). Rebuilt pixel-accurate to the canvas; this is what deploys.
- `room` = one full-viewport section in the lobby (6 main rooms)
- `sub-room` = nested page within Modules room (4 modules × 4 sub-pages)
- `sculpture` = Three.js ASCII-rendered 3D shape, one per room
- `morph` = animated transition between two sculptures (5.2s easeInOutSine)
- `palette family` = coordinated set of `--grad-*` + `--teal` CSS properties (cyan default, warm for blog)
- `HUD` = persistent overlay elements (brand mark, counter, section title, nav rail)
- `nav rail` = vertical column of balls (COL 0 main, COL 1 sub-rail for modules)
- `design doc` = any file in `design/` — source of truth for intent

## 6. Invariants

> The canvas aesthetic is canonical for the whole product (D-017). The production
> Astro site is rebuilt to match it pixel-accurate. The old conventional v1 page
> design is SUPERSEDED — do not extend it; rebuild to the canon.

### Canonical design invariants (from the canvas; govern the production site)
- Dark-first hero / full-viewport sculpture composition.
- ASCII-rendered Three.js sculpture per section; cyan family default, warm family for blog only.
- No card shadows — glow / HUD treatment instead.
- Logo switches on context (white on dark, black on light).
- `prefers-reduced-motion: reduce` disables sculpture rotation + morph.

### Production-foundation invariants (Astro site)
- Every section / post / module is a REAL crawlable route — NO hash-only routing. SEO requires it.
- The sculpture is a PERSISTENT island that survives route changes (View Transitions), not re-initialized per page.
- Strings live in locale JSON files (`src/i18n/`), never hardcoded in components.
- Body text max-width: ~720px.
- Launch English-first; other 6 locales are a post-launch phase (D-017, OQ-3).

### Design-canvas (lobby) invariants
- All canvas edits go in `public/lobby.html` — single file, inline everything. Non-shipping.
- The canvas defines intent; when the Astro site disagrees with the canvas, match the canvas.

### Shared invariants
- Fonts: Instrument Sans (display) + Satoshi (body) + JetBrains Mono (code/labels). No exceptions.
- Teal accent: `#1E7A6E` on light, `#2D8A7E` on dark.
- Warm highlight: `#C4814A` — max 1× per page.
- Mobile-first responsive design.

## 7. Design tokens (use these class/token names consistently)

- `bg-primary` / `bg-elevated` / `bg-surface` — light context surfaces
- `bg-dark` / `bg-dark-elevated` / `bg-dark-surface` — dark context surfaces
- `data-theme="dark"` — applied to dark sections
- `accent-primary` (#1E7A6E) — teal on light
- `accent-on-dark` (#2D8A7E) — teal on dark
- `highlight-warm` (#C4814A) — warm CTA accent
- `font-display` — Instrument Sans (headings)
- `font-body` — Satoshi (body text)
- `font-mono` — JetBrains Mono (code, labels)
- `shadow-card` / `shadow-card-hover` — card elevation on light
- `accent-glow` / `accent-glow-lg` — glow effects on dark

## 8. Execution & write rules

- One bounded task at a time. Review delegated work before accepting.
- Design docs in `design/` are source of truth for intent — if code disagrees, fix the code. Never edit a design doc without operator approval.
- The lobby prototype (`public/lobby.html`) is a single self-contained file (~2000 lines). Inline CSS + JS + Three.js module. No external deps except CDN Three.js.
- `DECISIONS.md` at repo root is the append-only decision log (next id: D-018).
- Per-section write rules:
  - `PROJECT.md §A` — design system / architecture. Stable; update with care.
  - `PROJECT.md §B` — decisions. Append-only; next id `D-NNN`.
  - `PROJECT.md §C` — roadmap & OQs. Overwrite freely.
  - `PROJECT.md §D` — workstreams. Overwrite freely.
  - `PROJECT.md §E` — handoff. Overwrite per session.
  - `PROJECT.md §F` — history. Append-only.
  - `PROJECT.md §G` — retrieval. Overwrite as commands evolve.
  - `CLAUDE.md §9` (below) — overwrite at session close.

Do not create new top-level planning files when `CLAUDE.md` or `PROJECT.md` can hold the truth.

## 9. Current snapshot

> Overwritten at session close. Mirrors current hot state.

- branch: `main`
- active stream: `static` (no-build production site in `site/`)
- direction: PIVOTED (D-020, supersedes D-017/D-019 Astro build) — ship a hand-authored **static, no-build** site. Core = the canvas single-page (snap-scroll + morph + scrim) per locale; real static blog pages for SEO. Deploy = upload `site/` to Hostinger.
- positioning: TWO tracks (D-018) — Europe/English (enterprise, EU AI Act) + Brazil/pt-BR (SMB: WhatsApp-first, partnership, R$, LGPD, Goiás). Locales ≠ 1:1 translations; pt-BR is its own strategy. Enterprise/EU never shown to Brazil; WhatsApp/LGPD/partnership never shown to Europe.
- astro: **REMOVED entirely (D-021)** — repo is now pure static, **no build step, no Node/npm**. `src/`, `public/`, `astro.config.mjs`, `package.json`, `node_modules` all deleted. The canvas/design source is now `site/index.html` itself (single source of truth; no separate lobby.html).
- static structure: 4 locales LIVE — `site/index.html` (EN), `site/nl/` (NL), `site/fr/` (FR) = Europe track; `site/pt-br/` = Brazil SMB. Self-contained: CDN Three.js (importmap) + Google Fonts; logos/favicon + robots.txt + sitemap.xml in `site/`. Deploy = upload `site/` to Hostinger.
- preview: `Static Site` config → `http://localhost:4330/` (python http.server on `site/`). Only config.
- NL/FR are lean Europe pages (6 rooms): module sub-rooms, blog posts, and the enterprise overlay are **EN-only at launch** (deferred for secondary locales).
- HubSpot (D-022): portal **148607612**, region **eu1**, owner clubeedg@gmail.com. Europe contact "Book a free call" → HubSpot Meetings. **ACTION NEEDED:** replace placeholder slug in `https://meetings-eu1.hubspot.com/oopuo` (EN/NL/FR room 6) with the real meeting link (create a free Meeting in HubSpot). "Send a message" = mailto (can swap to a HubSpot form share link later).
- TODO: set real HubSpot meeting slug; (optional) static `/blog/<slug>.html`; (optional) translated NL/FR blog + enterprise; optional shared `assets/` extraction.
- blockers: none
- resolved: OQ-1/D-020 (static no-build), OQ-3 (EN+pt-BR+NL+FR built), OQ-5 (blog = plain static HTML), OQ-6 (Hostinger static, manual upload), OQ-7 (Brazil at launch).
- open: OQ-2 (perf — reduced-motion fallback present), OQ-4 (HubSpot — just needs the real meeting slug; portal wired).
- WhatsApp (Brazil): **+55 66 99232-3668** → `https://wa.me/5566992323668`. RULE: WhatsApp CTAs use BRAND colors (cyan/teal/warm), NEVER WhatsApp green (#25D366).
- last session: 2026-06-02 — NL + FR Europe pages built; HubSpot Meetings wired (D-022); 4 locales live.

## 10. Pointer table — `PROJECT.md` sections

| Anchor | Content | Cadence |
|---|---|---|
| `§A` | Design system + architecture | Stable |
| `§B` | Decisions log (D-001…D-NNN) | append-only |
| `§C` | Roadmap & open questions | overwrite |
| `§D` | Workstreams (stream memory) | overwrite |
| `§E` | Handoff (current next-step) | overwrite |
| `§F` | History (durable lessons + milestone log) | append-only |
| `§G` | Retrieval (CLI snippets, artifact map) | overwrite |

Extract a section: `sed -n '/^## §B/,/^## §C/p' PROJECT.md`. See §G for the full kit.

## 11. Session close ritual

Before ending:

1. Did a decision land? → append to `PROJECT.md §B` with next `D-NNN` AND to `DECISIONS.md`.
2. Did a durable lesson surface? → append a bullet to `PROJECT.md §F`.
3. Did next-step change? → overwrite `PROJECT.md §E`.
4. Update the **§9 Current snapshot** block above.
5. Commit on `main`.
