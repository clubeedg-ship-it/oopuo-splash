# OOPUO Splash — next-agent handoff & initial assignment

Paste-ready brief for the next session. Read this, then `CLAUDE.md`, then `PROJECT.md §E`.
`DECISIONS.md` is the full decision log. **No build step exists or should exist.**

---

## Your assignment (do these, in order)

1. **State snapshot.** Open the repo, confirm the live state, and write a short snapshot
   to `PROJECT.md §E` (overwrite): what exists in `public_html/`, what's wired, what's
   placeholder, what's broken. Verify by serving locally (`Static Site` launch config →
   `http://localhost:4330/`) and walking each locale. Do **not** trust this file over what
   you actually see — reconcile and report differences.
2. **Plan to deployment.** Produce a phased plan (in `PROJECT.md §C`) to take the site from
   today's state to a deployed launch in the **target architecture** below. Keep it
   no-build. Get operator sign-off on the plan before large execution.
3. Then execute, committing working increments. Operator deploys by uploading
   `public_html/` to Hostinger `public_html` — they can do this in seconds, so live
   integrations (HubSpot, Meta Pixel) are tested on **oopuo.com**, not locally.

---

## What OOPUO is (positioning — D-018, never mix the two)

- **Europe track** (`en` root, `nl/`, `fr/`): enterprise framing, EU AI Act, Amsterdam, € pricing, HubSpot + email contact.
- **Brazil track** (`pt-br/`): SMB strategy in Portuguese — WhatsApp-first automated service, "parceria não produto", R$ pricing, LGPD, Goiás PMEs. Outbound motion (low SEO need).
- Enterprise/EU content NEVER appears on Brazil; WhatsApp/LGPD/partnership NEVER on Europe.
- The internal Brazil strategy source: Google Doc "OOPUO — Guia estratégico interno" (indexed in context-mode as `oopuo-strategy-doc`).

## Current state (verify, don't assume)

- **No build.** Astro was tried and fully removed (D-020/D-021). Pure static HTML/CSS/JS.
- Web root = **`public_html/`**. 4 locales, each currently ONE self-contained HTML file
  with the full 6-room snap-scroll "canvas" (Three.js/ASCII sculpture, dark hero, HUD,
  cyan palette; warm palette for the blog/room-5). `index.html` (EN), `nl/`, `fr/`,
  `pt-br/`. Plus `favicon.svg`, `oopuo-logo*.svg`, `robots.txt`, `sitemap.xml`.
- EN page is the FULL canvas (has module sub-rooms, 4 blog-readers, enterprise overlay).
  NL/FR/pt-br are LEAN (6 rooms; sub-rooms/blog/enterprise removed). pt-br has Brazil SMB
  copy + real WhatsApp; NL/FR are translated Europe copy.
- Visual canon (keep): Instrument Sans + Satoshi + JetBrains Mono + Instrument Serif (CDN);
  Three.js via CDN importmap; `prefers-reduced-motion` disables motion. WhatsApp CTAs use
  brand colors, **never** WhatsApp green `#25D366`.

## Integrations already wired (real IDs)

- **HubSpot** portal `148607612`, region `eu1`, owner `clubeedg@gmail.com`.
  - **Form** on EN contact (room 6): real form `2fef7ceb-b34c-4792-9a0d-1a2d618767b9`,
    via the **new form-builder embed** (`https://js-eu1.hsforms.net/forms/embed/148607612.js`
    + `<div class="hs-form-frame" data-region="eu1" data-form-id=… data-portal-id=…>`).
    - ⚠️ New-builder forms do NOT work with legacy `hbspt.forms.create` (v2) — it renders nothing. Use the new embed.
    - ⚠️ The embed iframe is `height:100%` → collapses to 0 in auto-height containers; give it `min-height`. It's loaded only when the contact room becomes visible (so it can size).
    - ⚠️ **It does NOT render on `http://localhost`** — only the live https domain. So you cannot fully verify it locally; deploy to test.
    - **Only on EN.** Replicate the same embed to `nl/` and `fr/` (Brazil keeps WhatsApp — no form).
  - **Meetings** ("Book a free call", EN/NL/FR): placeholder `https://meetings-eu1.hubspot.com/oopuo` — operator creates a free Meeting and replaces the `oopuo` slug.
- **Meta Pixel**: base code in `<head>` of all 4 pages, placeholder `YOUR_META_PIXEL_ID`
  (console logs `Invalid PixelID: null` until replaced). Replace to activate.
- **WhatsApp (Brazil)**: real **+55 66 99232-3668** → `https://wa.me/5566992323668`.

## Target architecture (D-024 — what to build toward)

Restructure the single-page-per-locale canvas into **multi-page separated static, still no build**:

```
public_html/                 (or build into dist/ by hand — but NO build tooling)
  index.html                 home (EN)        nl/  fr/  pt-br/  …same routes per locale
  services/ studio/ contact/ …               (each section its own page = real crawlable URL)
  blog/
    index.html               blog listing
    <slug>/index.html        rendered post page
    content/<slug>.yml|.md    post source: title, date, author, category, body, banner image name
  assets/
    styles.css               shared canvas CSS (extract from the inline <style>)
    sculpture.js             shared Three.js/ASCII engine (extract from inline <script>)
    fonts/ logos/
  media/
    blog/<image>.jpg         blog banners, OG images — organized, referenced by filename from blog content
  robots.txt  sitemap.xml
```

- Each blog post = a content file (yaml or markdown) holding **just content + banner image filename**, plus its page. Decide how content→page happens **without a build** (e.g., author/maintain the HTML alongside the content file, or a tiny runtime `fetch()` renderer — propose in your plan).
- Extract the repeated inline CSS/JS into `assets/` so pages aren't 2,500-line copies.
- Keep the visual canon and the two-track separation. Keep hreflang + sitemap across all locales/pages.

## Open TODOs (carry into the plan)

- Replicate the HubSpot **form** embed to `/nl/` and `/fr/`.
- Set the real HubSpot **Meeting slug** (replace `oopuo`).
- Set the real **Meta Pixel ID** (replace `YOUR_META_PIXEL_ID`).
- **Geo/language auto-routing** at the root: detect the visitor's language/region and route to the right locale (client-side JS, no build). Requested by the operator; not built.
- The D-024 restructure itself (pages split, assets/media/blog folders, blog content files).
- Optional: translated NL/FR blog + enterprise (currently EN-only).

## Hard rules

- No build step, no npm, no Astro. Static files only.
- Never put WhatsApp content/branding on Europe pages or EU/enterprise content on Brazil.
- WhatsApp buttons: brand colors, never `#25D366`.
- Test HubSpot/Pixel on the live https domain, not localhost.
- Commit on `main`; update `CLAUDE.md §8` + `PROJECT.md §E` at session close.
