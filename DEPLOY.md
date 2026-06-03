# OOPUO — deploy & test (static, no build)

The whole site is plain static HTML in **`public_html/`**. No build, no Node.
Upload the **contents** of `public_html/` to your Hostinger `public_html`.

```
public_html/index.html        ← English (Europe)
public_html/nl/index.html     ← Dutch
public_html/fr/index.html     ← French
public_html/pt-br/index.html  ← Brazil (Portuguese, WhatsApp)
public_html/favicon.svg, oopuo-logo*.svg, robots.txt, sitemap.xml
```

## 3 IDs to set, then everything works (find & replace)

Meta Pixel and the HubSpot form are **already installed** on every page — they just
carry placeholders. Replace these 3 strings across `public_html/` and you're done:

| Placeholder | Where | What to paste |
|---|---|---|
| `YOUR_META_PIXEL_ID` | `<head>` of all 4 pages | Your Meta Pixel ID (Meta Events Manager) |
| `YOUR_HUBSPOT_FORM_ID` | EN/NL/FR contact (last room) | A HubSpot Form's ID (create a free form first) |
| `oopuo` in `meetings-eu1.hubspot.com/oopuo` | EN/NL/FR contact | Your HubSpot Meetings slug |

HubSpot portal is already wired: **portalId `148607612`, region `eu1`** (your account).

## Test it

**Local:** `python3 -m http.server 4330 --directory public_html` → open `http://localhost:4330`.

- **Meta Pixel:** install the *Meta Pixel Helper* Chrome extension (or Events Manager →
  Test Events). After setting your Pixel ID, load any page → you should see a `PageView`.
- **HubSpot form:** create a form in HubSpot → copy its Form ID → paste over
  `YOUR_HUBSPOT_FORM_ID` → reload `/` and scroll to the last room (Invitation). The form
  renders; submit it → check HubSpot → Contacts / Form submissions. (Until a real Form ID
  is set, the form area stays empty — that's expected.)
- **HubSpot Meetings:** click "Book a free call" → your scheduler opens.

## Tracks (D-018)
- **Europe** (`/`, `/nl/`, `/fr/`): enterprise framing, HubSpot form + Meetings.
- **Brazil** (`/pt-br/`): SMB, WhatsApp `+55 66 99232-3668` (brand colors, never green).

## Updating later
Frozen static site — edit the HTML in `public_html/` and re-upload the changed file.
