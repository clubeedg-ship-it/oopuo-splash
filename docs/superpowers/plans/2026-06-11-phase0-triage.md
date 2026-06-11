# Phase 0 — Live-Defect Triage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every live conversion-killing and privacy defect on oopuo.com without restructuring anything — the 4 single-page locale files stay single-page; this is surgical fixes only.

**Architecture:** Direct edits to the 4 existing static files in `public_html/` (`index.html`, `nl/index.html`, `fr/index.html`, `pt-br/index.html`). One new build-free tool folder `tools/og/` (never deployed) generates two branded OG raster images via a headless screenshot. No engine changes, no new dependencies, no router — those are Phase 1+.

**Tech Stack:** Plain static HTML/CSS. OG images rendered from an HTML template via the Playwright MCP screenshot (1200×630). Verification: local `python3 -m http.server` smoke + `grep` assertions + headless console check. Integration paths that only resolve on live https (HubSpot/Pixel) are explicitly deferred to post-deploy — Phase 0 removes/avoids them, it does not wire them.

**Why these and only these (audit refs, PROJECT.md §C.1):** NL/FR are contact-dead (broken legacy embed + no mailto); the primary "Book a free call" CTA 404s on all 3 Europe pages; `og:image` 404s on all 4 (every WhatsApp/LinkedIn share is imageless — fatal for the Brazil WhatsApp motion); Meta Pixel leaks every visitor's IP to Meta pre-consent for zero tracking value and logs a console error on every page; `.DS_Store` ships to production.

**Out of scope (later phases):** asset extraction / self-hosting fonts+three.js (Phase 1), the page split + router + JSON-LD (Phase 2), the consent gate + legal pages + real Pixel ID + per-locale forms + real Meeting slug (Phase 3), `.htaccess` + 404 page + favicon set (Phase 4).

---

## File Structure

| File | Phase 0 responsibility |
|---|---|
| `public_html/index.html` | Remove Pixel snippet; repoint EN meeting CTA to mailto (form stays) |
| `public_html/nl/index.html` | Remove Pixel snippet; rebuild room-6 contact (kill dead form, meeting→mailto, add email line) |
| `public_html/fr/index.html` | Same as NL, French strings |
| `public_html/pt-br/index.html` | Remove Pixel snippet; repoint og:image/twitter:image to the Brazil variant |
| `public_html/og-default.png` | NEW — Europe OG raster (1200×630), referenced by EN/NL/FR (path already in their heads) |
| `public_html/og-default-br.png` | NEW — Brazil OG raster (1200×630), referenced by pt-br |
| `tools/og/europe.html`, `tools/og/brazil.html` | NEW — OG source templates (NOT deployed) |
| `.gitignore` | NEW — ignore `.DS_Store` |

**Reference — the good EN form embed (do NOT touch in Phase 0; mirror only in Phase 3):** `public_html/index.html` room 6 uses the working new-builder embed (`div.hs-form-frame` + `js-eu1.hsforms.net/forms/embed/148607612.js`, lazy-loaded on room visibility). NL/FR get the same pattern in Phase 3, not now.

---

### Task 1: Remove the pre-consent Meta Pixel snippet from all 4 pages

> **EXECUTED AS REVISED (2026-06-11):** operator wanted the placeholder KEPT, not deleted. Final shipped state = the snippet stays on all 4 pages but **wrapped in an HTML comment** (inert: loads no `fbevents.js`, logs no error), with an in-file "TO ACTIVATE" note. Verified inert on preview (0 facebook.net requests, clean console). See memory [[operator-prefers-inert-placeholders]]. The steps below (full removal) are superseded by this note.

**Files:**
- Modify: `public_html/index.html:6-9`
- Modify: `public_html/nl/index.html:6-9`
- Modify: `public_html/fr/index.html:6-9`
- Modify: `public_html/pt-br/index.html:6-9`

The snippet is **byte-identical** on all 4 pages (verified): line 6 comment, line 7 `<script>…fbq('init','YOUR_META_PIXEL_ID');fbq('track','PageView');</script>`, line 8 `<noscript>` beacon, line 9 `<!-- End Meta Pixel -->`. The only `fbq(` references in the entire codebase are inside this snippet (verified), so removal breaks nothing. It returns consent-gated in Phase 3.

- [ ] **Step 1: Assert the defect exists (pre-condition)**

Run: `grep -rc "YOUR_META_PIXEL_ID" public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html`
Expected: each file reports `2` (init + noscript).

- [ ] **Step 2: Replace the 4-line snippet with a single placeholder comment (apply to each of the 4 files)**

Find (exact, lines 6–9, identical in every file):
```html
<!-- Meta Pixel · replace YOUR_META_PIXEL_ID with your Pixel ID to activate -->
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','YOUR_META_PIXEL_ID');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=YOUR_META_PIXEL_ID&ev=PageView&noscript=1" alt=""/></noscript>
<!-- End Meta Pixel -->
```
Replace with:
```html
<!-- Meta Pixel removed (D-025/Phase 0): pre-consent loading of fbevents.js leaked visitor IPs to Meta. Returns consent-gated in Phase 3 (PROJECT.md §C.5) once the real Pixel ID + consent banner exist. -->
```

- [ ] **Step 3: Verify removal on all 4 files**

Run: `grep -rc "fbq\|facebook" public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html`
Expected: each file reports `0`.

- [ ] **Step 4: Smoke-check the console is now clean**

Run: `python3 -m http.server 4330 --directory public_html` (background), then load `http://localhost:4330/` and check the browser console.
Expected: NO `Invalid PixelID: null` error (it was logged on every page before).

- [ ] **Step 5: Commit**

```bash
git add public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html
git commit -m "fix(privacy): remove pre-consent Meta Pixel from all 4 locales (Phase 0)

The snippet loaded fbevents.js on every page view — leaking visitor IPs to
Meta with zero tracking value (placeholder ID) and logging a console error.
Returns consent-gated in Phase 3. Refs D-025, PROJECT.md §C.6."
```

---

### Task 2: Create branded OG images and fix the 404'd `og:image`

**Files:**
- Create: `tools/og/europe.html`
- Create: `tools/og/brazil.html`
- Create: `public_html/og-default.png` (Europe, 1200×630)
- Create: `public_html/og-default-br.png` (Brazil, 1200×630)
- Modify: `public_html/pt-br/index.html:24,28` (point at the Brazil variant)

EN/NL/FR heads already reference `https://oopuo.com/og-default.png` (root) — creating that file at `public_html/og-default.png` fixes all three with zero head edits. pt-br must point at the Brazil-framed image (D-018 — Europe art must never represent a Brazil share).

- [ ] **Step 1: Assert the defect**

Run: `ls public_html/*.png 2>/dev/null; grep -c "og-default.png" public_html/index.html public_html/pt-br/index.html`
Expected: no PNG files exist; both pages reference the missing image.

- [ ] **Step 2: Create the Europe OG template** `tools/og/europe.html`

```html
<!doctype html><html><head><meta charset="utf-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap');
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#070709;overflow:hidden;
    font-family:'Instrument Sans',sans-serif;position:relative}
  .glow{position:absolute;width:900px;height:900px;left:520px;top:-260px;border-radius:50%;
    background:radial-gradient(circle,rgba(34,211,238,.20),transparent 62%);filter:blur(14px)}
  .frame{position:absolute;inset:54px;border:1px solid rgba(255,255,255,.10);border-radius:18px}
  .pad{position:absolute;inset:0;padding:108px 104px;display:flex;flex-direction:column;justify-content:space-between}
  .mark{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:21px;letter-spacing:.42em;
    color:#67E8F9;text-transform:uppercase}
  h1{font-size:78px;line-height:1.04;font-weight:700;color:#EAEDF3;max-width:880px;letter-spacing:-.015em}
  h1 b{color:#22D3EE;font-weight:700}
  .foot{display:flex;justify-content:space-between;align-items:flex-end}
  .tag{font-size:25px;color:#9AA0B4;font-weight:400}
  .dot{font-family:'JetBrains Mono',monospace;font-size:16px;color:#505469;letter-spacing:.25em}
</style></head><body>
  <div class="glow"></div><div class="frame"></div>
  <div class="pad">
    <div class="mark">OOPUO · Engineering Studio</div>
    <h1>We build your <b>AI systems.</b><br>You focus on growing.</h1>
    <div class="foot"><div class="tag">AI websites · automation · support — Amsterdam</div><div class="dot">oopuo.com</div></div>
  </div>
</body></html>
```

- [ ] **Step 3: Create the Brazil OG template** `tools/og/brazil.html`

Same shell, Brazil-track copy (Portuguese, SMB/partnership framing — never enterprise/EU):
```html
<!doctype html><html><head><meta charset="utf-8"><style>
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap');
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#070709;overflow:hidden;
    font-family:'Instrument Sans',sans-serif;position:relative}
  .glow{position:absolute;width:900px;height:900px;left:520px;top:-260px;border-radius:50%;
    background:radial-gradient(circle,rgba(34,211,238,.20),transparent 62%);filter:blur(14px)}
  .frame{position:absolute;inset:54px;border:1px solid rgba(255,255,255,.10);border-radius:18px}
  .pad{position:absolute;inset:0;padding:108px 104px;display:flex;flex-direction:column;justify-content:space-between}
  .mark{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:21px;letter-spacing:.42em;
    color:#67E8F9;text-transform:uppercase}
  h1{font-size:74px;line-height:1.05;font-weight:700;color:#EAEDF3;max-width:900px;letter-spacing:-.015em}
  h1 b{color:#22D3EE;font-weight:700}
  .foot{display:flex;justify-content:space-between;align-items:flex-end}
  .tag{font-size:25px;color:#9AA0B4;font-weight:400}
  .dot{font-family:'JetBrains Mono',monospace;font-size:16px;color:#505469;letter-spacing:.25em}
</style></head><body>
  <div class="glow"></div><div class="frame"></div>
  <div class="pad">
    <div class="mark">OOPUO · Estúdio de Tecnologia · Goiás</div>
    <h1>Seu <b>parceiro de tecnologia.</b><br>Não um software de prateleira.</h1>
    <div class="foot"><div class="tag">Atendimento automatizado · automação · integrações</div><div class="dot">oopuo.com</div></div>
  </div>
</body></html>
```

- [ ] **Step 4: Render both templates to 1200×630 PNGs**

Load each template via the Playwright MCP, set viewport to exactly 1200×630, wait for fonts, screenshot to PNG:
- `tools/og/europe.html` → save as `public_html/og-default.png`
- `tools/og/brazil.html` → save as `public_html/og-default-br.png`

(Playwright `browser_navigate` to the `file://` path or the local server URL, `browser_resize` 1200×630, `browser_take_screenshot` type png. If Playwright is unavailable at execution time, fall back to `qlmanage -t -s 1200 tools/og/europe.html` is NOT acceptable — it renders QuickLook, not the page; instead open in the local server and use the preview screenshot tool. Whatever the tool, the deliverable is a 1200×630 PNG.)

- [ ] **Step 5: Point pt-br at the Brazil variant**

In `public_html/pt-br/index.html`, line 24:
```html
<meta property="og:image" content="https://oopuo.com/og-default.png">
```
→
```html
<meta property="og:image" content="https://oopuo.com/og-default-br.png">
```
And line 28:
```html
<meta name="twitter:image" content="https://oopuo.com/og-default.png">
```
→
```html
<meta name="twitter:image" content="https://oopuo.com/og-default-br.png">
```
Also add `og:image:width`/`height`/`alt` to all 4 heads (lets scrapers render the preview on first share). Insert directly after each page's `og:image` line:
- EN/NL/FR (after the `og-default.png` line):
```html
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="OOPUO — we build your AI systems.">
```
- pt-br (after the `og-default-br.png` line):
```html
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="OOPUO — seu parceiro de tecnologia em Goiás.">
```

- [ ] **Step 6: Verify the files exist, are the right size, and are referenced**

Run: `file public_html/og-default.png public_html/og-default-br.png && grep -c "og-default-br.png" public_html/pt-br/index.html`
Expected: both PNGs report `1200 x 630`; pt-br reports `2`.

- [ ] **Step 7: Commit**

```bash
git add tools/og public_html/og-default.png public_html/og-default-br.png public_html/index.html public_html/nl/index.html public_html/fr/index.html public_html/pt-br/index.html
git commit -m "fix(seo): add branded per-track OG images; fix 404'd og:image (Phase 0)

og-default.png (Europe) + og-default-br.png (Brazil) at 1200x630, generated
from tools/og/ templates in the canvas aesthetic. pt-br points at the Brazil
variant (D-018). Adds og:image dimensions + alt. Every share was imageless
before — fatal for the Brazil WhatsApp-sharing motion. Refs PROJECT.md §C.6."
```

---

### Task 3: Repoint EN's 404'd "Book a free call" CTA to a working mailto

**Files:**
- Modify: `public_html/index.html:1028`

The placeholder Meetings slug `…/oopuo` 404s. Until the operator supplies the real slug (Phase 3), the primary CTA must do something that works. EN already uses `mailto:hello@oopuo.com` in 8 places, so a mailto matches the page. The working HubSpot **form** sits right below this button (room 6) and is untouched.

- [ ] **Step 1: Assert the defect**

Run: `grep -c "meetings-eu1.hubspot.com/oopuo" public_html/index.html`
Expected: `1` (the dead link).

- [ ] **Step 2: Replace the dead meeting link**

Find (line 1028):
```html
        <a class="btn btn-warm" href="https://meetings-eu1.hubspot.com/oopuo" target="_blank" rel="noopener">Book a free call <span class="arrow">→</span></a>
```
Replace with:
```html
        <!-- Phase 0: real HubSpot Meeting slug not yet created; mailto keeps the primary CTA working. Restore the meetings link in Phase 3. -->
        <a class="btn btn-warm" href="mailto:hello@oopuo.com?subject=Booking%20a%20call%20with%20OOPUO">Book a free call <span class="arrow">→</span></a>
```

- [ ] **Step 3: Verify**

Run: `grep -c "meetings-eu1.hubspot.com/oopuo" public_html/index.html && grep -c "mailto:hello@oopuo.com?subject=Booking" public_html/index.html`
Expected: `0` then `1`.

- [ ] **Step 4: Commit**

```bash
git add public_html/index.html
git commit -m "fix(cta): repoint EN 'Book a free call' off the 404 meeting slug to mailto (Phase 0)

Placeholder meetings-eu1.hubspot.com/oopuo 404s for real visitors. mailto
keeps the primary conversion working until the real slug lands in Phase 3.
The working HubSpot form below it is untouched. Refs PROJECT.md §C.6."
```

---

### Task 4: Rebuild NL + FR room 6 — kill the dead form, fix the CTA, add an email fallback

**Files:**
- Modify: `public_html/nl/index.html:998` and `:1000-1011`
- Modify: `public_html/fr/index.html:998` and `:1000-1011`

NL/FR currently have ZERO working contact channels: the meeting button 404s, the form is the legacy `hbspt.forms.create` embed (cannot render new-builder forms) with placeholder `YOUR_HUBSPOT_FORM_ID` (renders nothing, throws a console error, loads HubSpot's script eagerly = pre-consent IP disclosure), and there is no mailto anywhere. Phase 0 makes them contact-alive with mailto; the real per-locale new-builder form lands in Phase 3. Europe shared inbox = `hello@oopuo.com`.

**NL** (`public_html/nl/index.html`):

- [ ] **Step 1: Assert the defect (NL)**

Run: `grep -c "hbspt.forms.create\|YOUR_HUBSPOT_FORM_ID\|meetings-eu1.hubspot.com/oopuo" public_html/nl/index.html && grep -c "mailto:" public_html/nl/index.html`
Expected: first `3` (dead form + dead slug present), second `0` (no contact escape hatch).

- [ ] **Step 2: Repoint the NL meeting button (line 998)**

Find:
```html
        <a class="btn btn-warm" href="https://meetings-eu1.hubspot.com/oopuo" target="_blank" rel="noopener">Plan een gesprek <span class="arrow">→</span></a>
```
Replace with:
```html
        <!-- Phase 0: echte HubSpot Meeting-slug nog niet aangemaakt; mailto houdt de CTA werkend. Herstel de meetings-link in Phase 3. -->
        <a class="btn btn-warm" href="mailto:hello@oopuo.com?subject=Een%20gesprek%20inplannen%20met%20OOPUO">Plan een gesprek <span class="arrow">→</span></a>
```

- [ ] **Step 3: Replace the entire dead NL form block (lines 1000–1011) with an email fallback**

Find (the comment through the closing script tag):
```html
      <!-- HubSpot form (free) · portal 148607612 / eu1. Replace YOUR_HUBSPOT_FORM_ID to activate. -->
      <style>
        .hs-embed{max-width:520px;margin-top:36px}
        .hs-embed,.hs-embed label,.hs-embed legend,.hs-embed p,.hs-embed .hs-richtext{color:#EAEDF3 !important}
        .hs-embed input,.hs-embed textarea,.hs-embed select{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.22);color:#EAEDF3;padding:11px 12px;border-radius:6px;font-family:inherit;margin-top:6px}
        .hs-embed .hs-form-field{margin-bottom:16px}
        .hs-embed input[type=submit],.hs-embed .hs-button{width:auto;background:var(--warm);border:none;color:#fff;font-weight:600;padding:12px 22px;border-radius:4px;cursor:pointer;margin-top:8px}
        .hs-embed .hs-error-msg,.hs-embed .hs-error-msgs label{color:#ffb4a8 !important}
      </style>
      <div id="hs-contact-form" class="hs-embed"></div>
      <script src="https://js-eu1.hsforms.net/forms/embed/v2.js"></script>
      <script>hbspt.forms.create({region:"eu1",portalId:"148607612",formId:"YOUR_HUBSPOT_FORM_ID",target:"#hs-contact-form"});</script>
```
Replace with:
```html
      <!-- Phase 0: dood legacy HubSpot-embed verwijderd (kon het new-builder formulier niet renderen + laadde HubSpot pre-consent). Echt NL-formulier komt in Phase 3 via de new-builder embed. -->
      <p class="lead" style="margin-top:32px">Liever direct mailen? <a href="mailto:hello@oopuo.com?subject=Vraag%20aan%20OOPUO" style="color:var(--teal)">hello@oopuo.com</a></p>
```

- [ ] **Step 4: Verify (NL)**

Run: `grep -c "hbspt\|YOUR_HUBSPOT_FORM_ID\|js-eu1.hsforms.net\|meetings-eu1.hubspot.com/oopuo" public_html/nl/index.html && grep -c "mailto:hello@oopuo.com" public_html/nl/index.html`
Expected: first `0` (all dead refs gone), second `2` (meeting CTA + email line).

**FR** (`public_html/fr/index.html`) — identical structure, French strings:

- [ ] **Step 5: Repoint the FR meeting button (line 998)**

Find:
```html
        <a class="btn btn-warm" href="https://meetings-eu1.hubspot.com/oopuo" target="_blank" rel="noopener">Réserver un appel <span class="arrow">→</span></a>
```
Replace with:
```html
        <!-- Phase 0: vrai slug HubSpot Meeting pas encore créé ; mailto garde le CTA fonctionnel. Rétablir le lien meetings en Phase 3. -->
        <a class="btn btn-warm" href="mailto:hello@oopuo.com?subject=R%C3%A9server%20un%20appel%20avec%20OOPUO">Réserver un appel <span class="arrow">→</span></a>
```

- [ ] **Step 6: Replace the entire dead FR form block (lines 1000–1011) with an email fallback**

Find the identical block as NL Step 3 (the FR file has the exact same `<!-- HubSpot form (free) … -->` … `hbspt.forms.create(...)` block). Replace with:
```html
      <!-- Phase 0 : embed HubSpot legacy mort supprimé (ne pouvait pas rendre le formulaire new-builder + chargeait HubSpot avant consentement). Vrai formulaire FR en Phase 3 via le new embed. -->
      <p class="lead" style="margin-top:32px">Vous préférez écrire ? <a href="mailto:hello@oopuo.com?subject=Question%20%C3%A0%20OOPUO" style="color:var(--teal)">hello@oopuo.com</a></p>
```

- [ ] **Step 7: Verify (FR)**

Run: `grep -c "hbspt\|YOUR_HUBSPOT_FORM_ID\|js-eu1.hsforms.net\|meetings-eu1.hubspot.com/oopuo" public_html/fr/index.html && grep -c "mailto:hello@oopuo.com" public_html/fr/index.html`
Expected: first `0`, second `2`.

- [ ] **Step 8: Smoke-check both pages render the contact room with no console error**

With the local server running, load `http://localhost:4330/nl/` and `http://localhost:4330/fr/`, scroll to room 6.
Expected: meeting button + visible `hello@oopuo.com` link; no `hbspt is not defined` / form-create console error; network tab shows no `js-eu1.hsforms.net` request.

- [ ] **Step 9: Commit**

```bash
git add public_html/nl/index.html public_html/fr/index.html
git commit -m "fix(contact): make NL/FR contactable — remove dead HubSpot embed, add mailto (Phase 0)

NL/FR had zero working contact channels: 404 meeting slug, a legacy
hbspt.forms.create embed that can't render the new-builder form (placeholder
ID, console error, pre-consent HubSpot load), and no mailto. Phase 0 removes
the dead embed, repoints the CTA to mailto, and adds a visible hello@oopuo.com
line. Real per-locale new-builder forms land in Phase 3. Refs PROJECT.md §C.6."
```

---

### Task 5: Stop shipping `.DS_Store` to production

**Files:**
- Create: `.gitignore`
- Delete (from repo + upload set): `public_html/.DS_Store`

- [ ] **Step 1: Assert the defect**

Run: `ls -la public_html/.DS_Store && git ls-files public_html/.DS_Store`
Expected: the file exists on disk (and may be tracked).

- [ ] **Step 2: Create `.gitignore` at repo root**

```gitignore
# macOS
.DS_Store
**/.DS_Store

# Editor / local
*.swp
.idea/
.vscode/
```

- [ ] **Step 3: Remove the file from the repo and disk**

Run: `git rm --cached --ignore-unmatch public_html/.DS_Store; rm -f public_html/.DS_Store`
Expected: no error; the file is gone from `public_html/`.

- [ ] **Step 4: Verify**

Run: `find public_html -name .DS_Store` and `git status --porcelain`
Expected: `find` returns nothing; `.gitignore` shows staged.

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore + drop .DS_Store from public_html (Phase 0)

macOS junk was shipping to production. Refs PROJECT.md §C.6."
```

---

### Task 6: Phase 0 verification sweep + handoff note

**Files:**
- Modify: `CLAUDE.md` (§8 snapshot) and `PROJECT.md` (§E) — record Phase 0 done, Phase 1 next.

- [ ] **Step 1: Full-site defect sweep (all assertions in one run)**

Run:
```bash
cd public_html
echo "pixel refs (want 0):"; grep -rc "fbq\|YOUR_META_PIXEL_ID" . | grep -v ':0' || echo "  clean"
echo "dead form refs (want 0):"; grep -rc "hbspt\|YOUR_HUBSPOT_FORM_ID" . | grep -v ':0' || echo "  clean"
echo "dead meeting slug (want 0):"; grep -rc "meetings-eu1.hubspot.com/oopuo" . | grep -v ':0' || echo "  clean"
echo "og pngs (want 1200x630 x2):"; file og-default.png og-default-br.png
echo "track separation — green (want 0):"; grep -rc "#25D366" . | grep -v ':0' || echo "  clean"
echo "track separation — wa.me on europe (want 0):"; grep -lc "wa.me" index.html nl/index.html fr/index.html 2>/dev/null || echo "  clean"
echo ".DS_Store (want none):"; find . -name .DS_Store || true
```
Expected: every line reports clean / the wanted value.

- [ ] **Step 2: Headless console check on all 4 locales**

With the local server running, load `/`, `/nl/`, `/fr/`, `/pt-br/` and confirm the console is error-free on each and the sculpture still renders (Phase 0 touched no engine code).

- [ ] **Step 3: Update docs**

In `CLAUDE.md` §8, change the NEXT line to: `**NEXT (D-025):** Phase 0 triage DONE (<commit>); execute Phase 1 (shared foundation) per PROJECT.md §C.6.` and update `last session`.
In `PROJECT.md` §E, note Phase 0 complete + Phase 1 is next.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md PROJECT.md
git commit -m "docs: Phase 0 triage complete; Phase 1 (shared foundation) next (D-025)"
```

- [ ] **Step 5: Hand off to the operator for deploy + live verification**

Tell the operator: upload `public_html/` to Hostinger, then on **live https oopuo.com** confirm — (a) sharing each locale URL in a LinkedIn/WhatsApp preview debugger shows the correct per-track OG image; (b) the EN HubSpot form still renders + submits in room 6 (Phase 0 didn't touch it, but the live domain is the only place it renders); (c) console is error-free on all 4. These three checks cannot be done on localhost.

---

## Notes for the executor

- **No test framework exists** — this is a static site. "Verification" = `grep` assertions + local `python3 -m http.server 4330 --directory public_html` smoke + headless console. The HubSpot-form-renders and Pixel checks **only work on live https** (CLAUDE.md §6) and are deferred to the operator's post-deploy pass — do not claim them verified from localhost.
- **Do not touch the canvas engine** (CSS/JS/Three.js) in Phase 0. Every edit here is `<head>` metadata or room-6 contact markup. Engine extraction is Phase 1.
- **Track separation (D-018) is law:** the Brazil OG template stays Portuguese/SMB; Europe pages stay enterprise; never add `wa.me` to EN/NL/FR or `#25D366` anywhere.
- **Frequent commits:** one per task (6 commits). Each leaves the site deployable.
