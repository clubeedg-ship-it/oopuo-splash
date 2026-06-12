// assets/js/router.js — persistent-sculpture fetch/swap router (no build). Refs PROJECT.md §C.2 / D-025.
// The sculpture + HUD live OUTSIDE <main id="main">, so they survive navigation; only <main> swaps.
// Same-origin, same-locale links navigate softly; crossing the Europe<->Brazil boundary hard-loads (D-018).
(function () {
  const mainEl = () => document.querySelector('main#main');
  const localePrefix = (location.pathname.match(/^\/(nl|fr|pt-br)\//) || [, ''])[1]; // '' for EN root
  let aborter = null;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function localeOf(pathname) {
    return (pathname.match(/^\/(nl|fr|pt-br)\//) || [, ''])[1];
  }
  function sameLocale(url) {
    return localeOf(url.pathname) === localePrefix; // never soft-navigate across tracks (D-018)
  }
  function isInternal(a) {
    if (!a || !a.getAttribute('href')) return false;
    const href = a.getAttribute('href');
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('data-no-router')) return false;
    return a.origin === location.origin;
  }

  async function fetchDoc(url, signal) {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('router fetch ' + res.status);
    return new DOMParser().parseFromString(await res.text(), 'text/html');
  }

  function readConfigFromDoc(doc) {
    // the new page's window.OOPUO is an inline <script>; run it sandboxed to read fields (never in live scope)
    const s = [...doc.querySelectorAll('script:not([src])')].find((s) => s.textContent.includes('window.OOPUO'));
    if (!s) return null;
    try {
      return Function('"use strict";var window={};' + s.textContent + ';return window.OOPUO;')();
    } catch (e) {
      return null;
    }
  }

  function swapHead(doc) {
    document.title = doc.title;
    const sync = (sel, attr) => {
      const incoming = doc.querySelector(sel);
      const current = document.querySelector(sel);
      if (incoming && current) current.setAttribute(attr, incoming.getAttribute(attr));
    };
    sync('link[rel="canonical"]', 'href');
    sync('meta[name="description"]', 'content');
    sync('meta[property="og:url"]', 'content');
    sync('meta[property="og:title"]', 'content');
    sync('meta[property="og:description"]', 'content');
    sync('html', 'lang');
  }

  async function navigate(url, opts) {
    const push = !opts || opts.push !== false;
    const dest = new URL(url, location.href);
    if (!sameLocale(dest)) { location.href = dest.href; return; }   // hard load across tracks
    if (dest.pathname === location.pathname && !dest.hash) return;  // already here
    if (aborter) aborter.abort();
    aborter = new AbortController();
    document.body.setAttribute('data-routing', '');
    try {
      const doc = await fetchDoc(dest.href, aborter.signal);
      const nextMain = doc.querySelector('main#main');
      if (!nextMain) { location.href = dest.href; return; }
      const nextCfg = readConfigFromDoc(doc);
      // remember the scroll of the page we're leaving
      history.replaceState({ ...(history.state || {}), scroll: window.scrollY }, '');
      mainEl().replaceWith(nextMain);            // swap content only — shell + sculpture persist
      swapHead(doc);
      if (push) history.pushState({ route: dest.pathname }, '', dest.href);
      if (window.__oopuoOnRoute) window.__oopuoOnRoute(nextCfg); // engine: morph sculpture, set palette, repaint HUD, focus
      window.scrollTo(0, 0);
      const m = document.getElementById('main');
      if (m) m.focus({ preventScroll: true });
    } catch (e) {
      if (e && e.name !== 'AbortError') location.href = dest.href;  // hard fallback on any failure
    } finally {
      document.body.removeAttribute('data-routing');
    }
  }

  // intercept primary-button clicks on internal links
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!isInternal(a)) return;
    e.preventDefault();
    navigate(a.href);
  });

  // back / forward
  window.addEventListener('popstate', () => {
    navigate(location.href, { push: false }).then(() => {
      const y = (history.state && history.state.scroll) || 0;
      requestAnimationFrame(() => window.scrollTo(0, y));
    });
  });

  // prefetch on hover/focus — works in every JS browser incl. iOS Safari (Speculation Rules/<link prefetch> don't)
  const prefetched = new Set();
  function maybePrefetch(a) {
    if (!isInternal(a)) return;
    const u = new URL(a.href);
    if (!sameLocale(u) || prefetched.has(u.pathname)) return;
    prefetched.add(u.pathname);
    fetch(u.href).catch(() => {});
  }
  document.addEventListener('mouseover', (e) => { const a = e.target.closest('a'); if (a) maybePrefetch(a); });
  document.addEventListener('focusin', (e) => { const a = e.target.closest('a'); if (a) maybePrefetch(a); });

  window.__oopuoRouter = { navigate };
})();
