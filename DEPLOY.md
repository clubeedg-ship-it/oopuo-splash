# Deploy OOPUO — static, no build

The entire website is plain static files in **`site/`**. No build, no Node, no npm.

## Upload to Hostinger (2 minutes)

1. Open Hostinger → **hPanel → Files → File Manager** (or use FTP).
2. Go into **`public_html`** (your domain's web root).
3. Upload **everything inside the `site/` folder** (not the `site` folder itself) so the structure becomes:
   ```
   public_html/index.html        ← English (Europe)
   public_html/nl/index.html     ← Dutch
   public_html/fr/index.html     ← French
   public_html/pt-br/index.html  ← Brazil (Portuguese)
   public_html/favicon.svg, oopuo-logo*.svg, robots.txt, sitemap.xml
   ```
   (Easiest: upload `oopuo-site.zip` from the repo root, then **Extract** it in `public_html` and move the contents up if it extracted into a `site/` subfolder.)
4. Done. Visit your domain — it's live.

There is nothing to compile. Fonts + 3D engine load from CDN; everything else is local.

## One thing to finish: HubSpot meeting link

The Europe "Book a free call" button points to a **placeholder**:
`https://meetings-eu1.hubspot.com/oopuo`

1. In HubSpot (portal **148607612**, EU) → **Library → Meetings** → create your free scheduling page.
2. Copy its public link (e.g. `https://meetings-eu1.hubspot.com/your-name`).
3. Find & replace `https://meetings-eu1.hubspot.com/oopuo` in these 3 files:
   `site/index.html`, `site/nl/index.html`, `site/fr/index.html`.
4. Re-upload those 3 files.

(Brazil `site/pt-br/` already uses your real WhatsApp: `+55 66 99232-3668`.)

## Locales
- **Europe track:** `/` (EN), `/nl/`, `/fr/` — enterprise framing, HubSpot.
- **Brazil track:** `/pt-br/` — SMB, WhatsApp-first, R$, LGPD.

## Updating later
It's a frozen static site. To change anything, edit the HTML in `site/` and re-upload that file. To add a blog post later, copy a page and edit the content.
