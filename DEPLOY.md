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

## To go fully live: 2 IDs to set + 1 form to replicate

HubSpot is wired: **portalId `148607612`, region `eu1`**. The EN contact already has your
real form `2fef7ceb-b34c-4792-9a0d-1a2d618767b9` embedded. Remaining:

| Item | Where | What to do |
|---|---|---|
| `YOUR_META_PIXEL_ID` | `<head>` of all 4 pages | Replace with your Meta Pixel ID (Meta Events Manager). Until then the console logs `Invalid PixelID: null`. |
| `oopuo` in `meetings-eu1.hubspot.com/oopuo` | EN/NL/FR contact | Replace with your real HubSpot Meetings slug (create a free Meeting). |
| HubSpot **form** | currently EN only | Copy the same `hs-form-frame` embed block into `nl/index.html` + `fr/index.html` (room 6). (Brazil keeps WhatsApp — no form.) |

## Test it — on the LIVE site, not localhost

⚠️ **The HubSpot form and Meta Pixel only work on the real https domain.** HubSpot's new
form embed refuses to render on `http://localhost`, and the Pixel needs a real ID. Since
you deploy to oopuo.com in seconds, test there:

- **HubSpot form:** open `https://oopuo.com/` → scroll to the last room (Invitation) → the
  form renders → submit → check **HubSpot → Contacts / Form submissions**. (Make sure the
  form has fields and is **Published** in HubSpot, or it shows empty.)
- **HubSpot Meetings:** click "Book a free call" → your scheduler opens (after you set the slug).
- **Meta Pixel:** install *Meta Pixel Helper* (Chrome) or use Events Manager → Test Events →
  load any page → you should see a `PageView` (after you set the Pixel ID).

Note: the EN form uses HubSpot's **new form-builder** embed — do not switch it to the old
`hbspt.forms.create` v2 API (it renders nothing for new-builder forms).

## Tracks (D-018)
- **Europe** (`/`, `/nl/`, `/fr/`): enterprise framing, HubSpot form + Meetings.
- **Brazil** (`/pt-br/`): SMB, WhatsApp `+55 66 99232-3668` (brand colors, never green).

## Updating later
Frozen static site — edit the HTML in `public_html/` and re-upload the changed file.
