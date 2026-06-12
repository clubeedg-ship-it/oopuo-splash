# Phase 2 — The Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn each room / service / blog post / legal-equivalent section into a **real crawlable URL** (complete static HTML, full content + meta + JSON-LD in the initial response), while preserving the canvas experience via a hand-rolled persistent-sculpture router — so the snap-scroll/morph feel is identical but the URL bar follows the rooms and every section is independently indexable.

**Architecture (from PROJECT.md §C.2/§C.3 — design already settled in D-025):** Each page = a persistent **shell** (HUD, sculpture `<div>`, nav rail, footer — never swapped) + a `<main id="main">` holding that route's content + a per-page `window.OOPUO` config + `<script>`s to the shared `assets/`. A `assets/js/router.js` (~150–180 lines) intercepts same-origin, same-locale `<a>` clicks, fetches the target, swaps `<main>`, runs the sculpture morph + palette switch as the transition, and updates URL/title/meta — the sculpture/HUD live **outside** `<main>` so they survive navigation. Crossing the Europe↔Brazil boundary (or any locale switch) is always a full load → D-018 separation stays architectural. Every URL also serves complete static HTML, so Google, AI crawlers (zero-JS), and no-JS users all get the content; the router is pure progressive enhancement.

**Tech stack:** static HTML/CSS/JS, no build (except the stdlib `tools/render_posts.py` for blog, sanctioned in D-025). Verification: `curl` each URL for raw-HTML completeness + fresh Playwright for router/morph/scroll behaviour.

**Hard constraints:**
- **Content parity.** Every word/CTA/sculpture/palette that exists today must survive the split — this reorganises, it does not rewrite. The only NEW content is the locale switcher and (Phase 3) legal pages.
- **No build, no third parties.** Reuse the Phase 1 shared assets. No new runtime CDN.
- **D-018.** Router never soft-navigates across tracks; pt-br has its own page set (no enterprise/blog/HubSpot).
- **Preserve Phase 0/1 state:** inert Pixel placeholder, NL/FR guarded form + mailto, self-hosted fonts/three, a11y, reduced-motion.
- **Crawlability is the bar:** `curl <url>` must show the full room text in the raw HTML for every page.

---

## Sub-phase decomposition (this plan details 2.1; 2.2–2.6 get their own detailed plans when reached)

| # | Sub-phase | Output |
|---|---|---|
| **2.1** | **Router + shell foundation** *(detailed below)* | `assets/js/router.js`, the shell template, engine reworked for cross-page nav, proven on a 2-page EN slice (`/` + `/services/`) |
| 2.2 | Split EN into all pages | every EN route from §C.3 as shell+`<main>` static files; real `<a href>` nav; hash routing retired |
| 2.3 | Per-page meta + JSON-LD | title/desc/canonical/hreflang/OG per page; Organization (sitewide), Service, BreadcrumbList |
| 2.4 | Blog pipeline | `tools/render_posts.py` (stdlib) + `blog/content/*.md` (4 posts migrated) → `/blog/<slug>/` with Article JSON-LD + index cards |
| 2.5 | Split NL / FR / pt-br | their smaller per-track page sets (§C.3); pt-br distinct IA |
| 2.6 | Switcher + geo + sitemap + redirects | locale switcher (HUD/footer), root geo-suggest, sitemap + hreflang matrix regen, hash-redirect shim for live deep links |

**Why 2.1 first and alone:** the persistent-sculpture router + the snap-scroll→navigation rework is the only genuinely novel, high-risk engineering in Phase 2. Everything after it is "apply the proven pattern + add metadata." Proving it on a 2-page slice de-risks the whole phase; if the seamless feel can't be preserved, we learn it on 2 pages, not 16.

---

## Sub-phase 2.1 — Router + shell foundation

**Exit:** `/` (home: rooms 1+2) and `/services/` (room 3) are real static URLs (curl shows full content); the nav-rail + a "next" gesture navigate between them through the router with the sculpture **morphing and persisting** (no reload, no re-init); back/forward + scroll restoration work; each page also loads standalone with JS off; console clean; the look is identical to the current single-page canvas.

### File structure (2.1)

| File | Responsibility |
|---|---|
| `public_html/index.html` | becomes the EN **home** page: shell + `<main>` with rooms 1+2 only + routing config |
| `public_html/services/index.html` | NEW: shell + `<main>` with room 3 (modules index) + routing config |
| `public_html/assets/js/router.js` | NEW: fetch + DOM-swap + pushState router with persistent sculpture |
| `public_html/assets/js/engine.js` | reworked: nav-rail → real route links; wheel/touch/keyboard boundary → `router.navigate`; in-page snap only within multi-room pages |
| `public_html/assets/css/canvas.css` | add `@view-transition { navigation: auto }` (fallback crossfade) + any swap-container styles |

> The current `index.html` is the full 6-room EN page. 2.1 **reduces it to home (rooms 1+2)** and moves room 3 to `/services/`. Rooms 4/5/6 + sub-rooms/blog/enterprise stay in `index.html` temporarily (still reachable by in-page scroll) until 2.2 moves them out — i.e. 2.1 leaves a *working hybrid* (home is split, the rest still inline) so each step is shippable. (Decide at execution: simplest is to keep rooms 3–6 inline in home during 2.1 and ALSO publish `/services/` as the first real split page that the router targets; 2.2 then completes the split and trims home to 1+2. Pick whichever keeps a deployable state at each commit.)

### The shell template (document as `docs/superpowers/phase2-shell-template.html` for reuse)

The persistent shell = everything currently between `<body>` and `<div class="stage">`, plus the scripts. The per-route content = the `<section class="room">`(s) for that route, wrapped in `<main id="main">`. Per-page `window.OOPUO` gains routing fields:
```js
window.OOPUO = {
  locale: 'en', track: 'europe',
  route: '/services/',                 // this page's canonical path
  rooms: [3],                          // room number(s) rendered in <main> on this page
  sculpture: 3,                        // which sculpture index to show/morph to
  palette: 'cyan',                     // 'cyan' | 'warm' (page-level; warm for /blog/*)
  index: 1,                            // position in the locale's journey (0-based)
  journey: [                           // ordered routes for nav-rail + prev/next + prefetch
    {path:'/',         label:'Arrival',    sculpture:1},
    {path:'/services/',label:'Modules',    sculpture:3},
    {path:'/studio/',  label:'Studio',     sculpture:4},
    {path:'/blog/',    label:'Blog',       sculpture:5, palette:'warm'},
    {path:'/contact/', label:'Invitation', sculpture:6}
  ],
  labels: { rooms:[...], end:"— END" },  // existing
  integrations: { hubspotFormId:null, whatsapp:null }
};
```
The `journey` is the same array on every page of a locale (the site map for the rail). `index` differs per page. Home holds rooms 1+2 (Arrival+The Gap) but is journey index 0; "The Gap" is an in-page scroll within home, not a separate journey stop (matches §C.3: room 2 folds into home).

### Task 1: Write `assets/js/router.js`

**Files:** Create `public_html/assets/js/router.js`

- [ ] **Step 1: Implement the router** (no test framework — verification is behavioural in Task 5)

```js
// assets/js/router.js — persistent-sculpture fetch/swap router (no build). Refs PROJECT.md §C.2.
(function () {
  const main = () => document.querySelector('main#main');
  const localePrefix = (location.pathname.match(/^\/(nl|fr|pt-br)\//) || [,''])[1]; // '' for EN root
  let aborter = null;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function sameLocale(url) {
    const p = url.pathname;
    const m = (p.match(/^\/(nl|fr|pt-br)\//) || [,''])[1];
    return m === localePrefix;            // never soft-navigate across tracks (D-018)
  }
  function isInternal(a) {
    return a && a.href && a.origin === location.origin && !a.hasAttribute('data-no-router')
      && !a.target && a.getAttribute('href') && !a.getAttribute('href').startsWith('#');
  }

  async function fetchDoc(url, signal) {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('router fetch ' + res.status);
    return new DOMParser().parseFromString(await res.text(), 'text/html');
  }

  function swapHead(doc) {
    document.title = doc.title;
    const sync = (sel, attr) => {
      const incoming = doc.querySelector(sel), current = document.querySelector(sel);
      if (incoming && current) current.setAttribute(attr, incoming.getAttribute(attr));
    };
    sync('link[rel=canonical]', 'href');
    sync('meta[name=description]', 'content');
    sync('meta[property="og:url"]', 'content');
    sync('meta[property="og:title"]', 'content');
    // (JSON-LD per page is in <main>'s own <script type=application/ld+json> or re-synced here in 2.3)
  }

  async function navigate(url, { push = true } = {}) {
    const dest = new URL(url, location.href);
    if (!sameLocale(dest)) { location.href = dest.href; return; }     // hard load across tracks
    if (aborter) aborter.abort();
    aborter = new AbortController();
    try {
      const doc = await fetchDoc(dest.href, aborter.signal);
      // save scroll of the page we're leaving
      history.replaceState({ ...history.state, scroll: window.scrollY }, '');
      const nextMain = doc.querySelector('main#main');
      const nextCfg = readConfigFromDoc(doc);                         // parse the inline window.OOPUO
      if (!nextMain) { location.href = dest.href; return; }
      main().replaceWith(nextMain);                                   // swap content only — shell persists
      swapHead(doc);
      if (push) history.pushState({ route: dest.pathname }, '', dest.href);
      // drive the persistent sculpture + palette to the new route
      if (window.__oopuoOnRoute) window.__oopuoOnRoute(nextCfg);      // engine hook: morph sculpture, set palette, repaint HUD, move focus
      window.scrollTo(0, 0);
      document.getElementById('main')?.focus({ preventScroll: true });
    } catch (e) {
      if (e.name !== 'AbortError') location.href = dest.href;         // hard fallback on any failure
    }
  }

  function readConfigFromDoc(doc) {
    // the new page's window.OOPUO is in an inline <script>; execute it in isolation to read fields
    const s = [...doc.querySelectorAll('script:not([src])')].find(s => s.textContent.includes('window.OOPUO'));
    if (!s) return null;
    try { return Function('"use strict";let window={};' + s.textContent + ';return window.OOPUO;')(); }
    catch { return null; }
  }

  // intercept clicks
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!isInternal(a)) return;
    e.preventDefault();
    navigate(a.href);
  });

  // back / forward
  window.addEventListener('popstate', () => {
    navigate(location.href, { push: false });
    const y = (history.state && history.state.scroll) || 0;
    requestAnimationFrame(() => window.scrollTo(0, y));
  });

  // prefetch on hover / viewport (works in all JS browsers incl. iOS Safari)
  const prefetched = new Set();
  function prefetch(href) {
    if (prefetched.has(href)) return; prefetched.add(href);
    fetch(href).catch(() => {});                                     // warm the HTTP cache
  }
  document.addEventListener('mouseover', (e) => {
    const a = e.target.closest('a'); if (isInternal(a) && sameLocale(new URL(a.href))) prefetch(a.href);
  });

  window.__oopuoRouter = { navigate };
})();
```

- [ ] **Step 2: Add the view-transition fallback to `canvas.css`**

Append:
```css
@media (prefers-reduced-motion: no-preference){ @view-transition { navigation: auto; } }
```
(CSS at-rule only — the `<meta name=view-transition>` form is deprecated/dead. This gives Chromium 126+/Safari 18.2+ a native crossfade when JS is off or the router bails; Firefox just hard-loads.)

### Task 2: Rework `engine.js` for cross-page navigation

**Files:** Modify `public_html/assets/js/engine.js`

- [ ] **Step 1: Add the `window.__oopuoOnRoute` hook** the router calls after a swap — it must: morph the sculpture to `cfg.sculpture` (`window.__sculpt3D(cfg.sculpture)`); set the page palette (`document.body.dataset.palette = cfg.palette` — see Step 3); repaint the HUD counter/section-title from `cfg` (`index`, `journey`, `labels`); reset in-page room state for the new `<main>`; re-run the `inert`/`.active` sweep on the new rooms; re-init the contact form lazy-loader if the new page is `/contact/`.

- [ ] **Step 2: Nav-rail → real links.** The nav-rail buttons become `<a href>` pointing at `journey[i].path`, with `aria-current="page"` on the active one (from `cfg.index`). The router intercepts the clicks. (Keeps keyboard operability + crawlable links — also fixes an audit a11y item.)

- [ ] **Step 3: Page-level palette.** Today warm is bound to `body[data-room="5"]`. Replace with `body[data-palette="warm"]` driven by `cfg.palette` so a split `/blog/` page (which no longer has `data-room=5`) still goes warm. Update `canvas.css` selector accordingly. Cyan default.

- [ ] **Step 4: Wheel/touch/keyboard boundary → router.** Within a page that holds 2 rooms (home), keep in-page snap between them. At the journey boundary — scrolling "down/next" past the last in-page room, or "up/prev" before the first — call `window.__oopuoRouter.navigate(journey[index±1].path)`. Single-room pages: any next/prev gesture navigates. Debounce so one wheel gesture = one navigation. Retire the `#NN` hash router block (replaced by real URLs; the hash-redirect shim lands in 2.6).

### Task 3: Build the home page (`/`) and `/services/` as the proof slice

**Files:** Modify `public_html/index.html`; Create `public_html/services/index.html`

- [ ] **Step 1:** Give `index.html` the routing `window.OOPUO` (route `/`, rooms [1,2], sculpture 1, index 0, the full `journey`), add `<main id="main">` around rooms 1+2 (Arrival+The Gap), and `<script src="/assets/js/router.js">` after engine.js. Keep rooms 3–6 inline for now OR move room 3 out (see the hybrid note above) — whichever stays deployable.
- [ ] **Step 2:** Create `services/index.html` = the shell (copy the persistent shell from home) + `<main id="main">` containing room 3's content (the modules index) + routing `window.OOPUO` (route `/services/`, rooms [3], sculpture 3, index 1, same journey) + the shared `<link>`/`<script>`s (paths are absolute `/assets/...` so they resolve from `/services/`). Per-page `<head>` meta (title "Services / Modules — OOPUO", canonical `/services/`, hreflang, OG). Full content in the static HTML.

### Task 4: (handled inside Tasks 1–3 — no separate code)

### Task 5: Verify the slice

- [ ] **Step 1 — crawlable:** `curl -s localhost:4330/ | grep -c "You focus on growing"` ≥1 and `curl -s localhost:4330/services/ | grep -c "Four modules"` ≥1 — full content in raw HTML, both URLs.
- [ ] **Step 2 — router (fresh Playwright):** load `/`; click the nav-rail "Modules" link → URL becomes `/services/`, **no full reload** (sculpture object identity persists: stash `window.__sculpt3D` ref before, assert same after), sculpture **morphs** to shape 3, palette correct, `<main>` content is room 3, `document.title` updated. Back button → `/`, sculpture morphs back, scroll restored. Console clean.
- [ ] **Step 3 — snap gesture:** on `/`, scroll/wheel past room 2 → router navigates to `/services/`. On `/services/`, wheel up → back to `/`.
- [ ] **Step 4 — no-JS:** disable JS, load `/services/` → room 3 content readable standalone (shell + main render; nav rail hidden via the noscript fallback or shows as plain links).
- [ ] **Step 5 — track guard:** assert the router refuses to soft-navigate to `/pt-br/...` (would `location.href` hard-load) — even though 2.1 doesn't link there, unit-check `sameLocale(new URL('/pt-br/','...'))===false`.

- [ ] **Step 6: Commit** (one commit for router.js, one for the engine rework, one for the page slice — each deployable).

### 2.1 risks & mitigations
- **Persistent sculpture across swap** — the sculpture `<div>` + canvas must be OUTSIDE `<main>`; the swap only replaces `<main>`. If the sculpture is accidentally inside the swap container it gets destroyed → re-init fl/flicker. Mitigation: assert object identity in Task 5 Step 2.
- **Config execution from fetched doc** — `readConfigFromDoc` runs the inline config in a sandboxed `Function`; if a page's config throws, fall back to a hard load. Never `eval` page scripts in the live scope.
- **Double engine init** — engine.js/sculpture.js must NOT re-run on swap (they're in the persistent shell, loaded once). Only `__oopuoOnRoute` runs per nav. Verify no second `window.__sculpt3D` definition after a navigation.
- **Scroll restoration** — store `scrollY` in `history.state` on leave; restore on popstate. Manual mode.

---

## Notes for the executor
- Build 2.1 as a **working hybrid** — each commit leaves a deployable site (home split + `/services/` live + the rest still reachable inline) so a mid-phase deploy is never broken.
- The content for every page already exists in the current files — splitting = move the `<section class="room">` block into a new file's `<main>`, not author new copy.
- After 2.1 proves the mechanism, STOP and write the 2.2 detailed plan (split all EN pages) — don't free-solo the remaining 15 pages without a plan.
- Verify on **fresh Playwright**, never the warm preview tab (localhost caches JS/CSS — the Phase 1 lesson).
- Keep the Phase 0/1 invariants: inert Pixel, NL/FR guarded form, self-hosted assets, a11y, reduced-motion, D-018 separation, no WhatsApp green.
