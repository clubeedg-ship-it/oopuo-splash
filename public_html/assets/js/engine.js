(function () {
  // Locale chrome (switcher + geo-suggest) is shared across BOTH modes and all locales — inject it
  // before branching so legacy single-page locales get it too. Runs once per full page load.
  initLocaleChrome();

  // Section-transition gesture tuning. Declared ABOVE the router-mode branch so both nav systems
  // (router pages in initRouterMode + the legacy in-page snap below) can read them — the early
  // `return` on the next line would otherwise leave these in the TDZ for router pages.
  //
  // Router pages give each section REAL scroll travel (a slack band, --room-slack in canvas.css):
  // you scroll the content freely and only snap to the next section once you hit the scroll edge.
  // EDGE_* is the small extra push needed AT the edge to cross over (low — you're already there).
  // WHEEL/TOUCH_THRESHOLD are the legacy single-page (pt-br) deadzone, unchanged.
  const WHEEL_THRESHOLD = 140;
  const TOUCH_THRESHOLD = 120;
  const EDGE_WHEEL = 70;          // extra wheel delta at the edge before snapping (router pages)
  const EDGE_TOUCH = 80;          // extra swipe px at the edge before snapping (router pages)
  const SLACK_RATIO = 0.34;       // keep in sync with --room-slack (vh) in canvas.css
  const NAV_COOLDOWN = 620;       // ms after a snap during which no further snap fires (router pages).
                                  // FIXED (not extended) so sustained scrolling advances one section
                                  // per cooldown — continuous scrolling never gets stuck.
  const COAST_RATIO = 0.55;       // a wheel event whose |deltaY| drops below this fraction of the
                                  // current gesture's peak is treated as inertial coast and ignored,
                                  // so a single flick = ONE section while steady scrolling keeps going.

  // Phase 2: split pages declare window.OOPUO.journey → ROUTER MODE — the persistent shell drives the
  // sculpture + HUD and hands page-to-page navigation to assets/js/router.js. Pages without a journey
  // fall through to the legacy single-page engine below (current home / nl / fr / pt-br, unchanged).
  if (window.OOPUO && Array.isArray(window.OOPUO.journey)) return initRouterMode(window.OOPUO);

  const TOTAL = 6;
  var __cfg = (window.OOPUO || {}), __cfgL = (__cfg.labels || {});
  const LABELS = __cfgL.rooms || ["Arrival", "The Gap", "Modules", "Studio", "Blog", "Invitation"];
  const END_LABEL = __cfgL.end || "— END";
  const MODULE_LABELS = ["Websites", "AI Support", "Automation", "Integrations"];
  const SUB_LABELS = ["Overview", "Examples", "Process", "Pricing"];
  const HAS_CONTENT = { "1-1": true, "1-2": true, "1-3": true, "1-4": true, "2-1": true, "2-2": true, "2-3": true, "2-4": true, "3-1": true, "3-2": true, "3-3": true, "3-4": true, "4-1": true, "4-2": true, "4-3": true, "4-4": true };

  let current = 1, currentMod = null, currentSub = 1, animating = false, entOpen = false;
  let wheelAcc = 0, wheelTimer;

  const rooms = document.querySelectorAll('.room');
  rooms.forEach(r => { r.inert = !r.classList.contains('active'); }); // a11y: keep inactive rooms out of tab order + SR tree
  const subRooms = document.querySelectorAll('.sub-room');
  const blogReaders = document.querySelectorAll('.blog-reader');
  const TOTAL_POSTS = blogReaders.length;
  let currentPost = null;
  const nodes = document.querySelectorAll('.nav-node');
  const col1Nodes = document.querySelectorAll('.col1-node');
  const stubRoom = document.querySelector('.sub-room[data-mod-stub]');
  const stubTitle = document.getElementById('stub-title');
  const stubDesc = document.getElementById('stub-desc');
  const currentEl = document.querySelector('.counter .current');
  const totalEl = document.querySelector('.counter .total');
  const nextEl = document.getElementById('next-label');
  const sectionName = document.getElementById('section-name');
  const subNavPrev = document.getElementById('sub-nav-prev');
  const subNavNext = document.getElementById('sub-nav-next');
  const subNavPrevName = subNavPrev.querySelector('.sub-nav-name');
  const subNavNextName = subNavNext.querySelector('.sub-nav-name');

  function updateSubNavLabels() {
    if (currentMod === null) return;
    if (currentSub > 1) {
      subNavPrev.disabled = false;
      subNavPrevName.textContent = SUB_LABELS[currentSub - 2];
    } else {
      subNavPrev.disabled = true;
      subNavPrevName.textContent = '—';
    }
    if (currentSub < 4) {
      subNavNext.disabled = false;
      subNavNextName.textContent = SUB_LABELS[currentSub];
    } else {
      subNavNext.disabled = true;
      subNavNextName.textContent = '—';
    }
  }
  subNavPrev.addEventListener('click', () => { if (currentMod !== null) switchSub(currentSub - 1); });
  subNavNext.addEventListener('click', () => { if (currentMod !== null) switchSub(currentSub + 1); });

  // —— ASCII sculpture: rendered by Three.js module (see </body>) ——
  const sculpture = document.getElementById('sculpture');
  function initSculpture() {}
  function setSculpture(roomNum) {
    if (window.__sculpt3D) window.__sculpt3D(roomNum);
  }

  // (Old particle-system code removed; kept stubs so legacy generators don't run.)

  // —— State helpers ——
  function syncBodyTheme() {
    const activeEl = (currentMod !== null) ? document.querySelector('.sub-room.active') : document.querySelector('.room.active');
    if (activeEl && activeEl.getAttribute('data-theme') === 'dark') document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
  }

  function paintTop() {
    if (currentMod !== null) {
      const modKey = 'M.' + String(currentMod).padStart(2, '0');
      const sub = SUB_LABELS[currentSub - 1];
      currentEl.textContent = modKey;
      totalEl.textContent = '· ' + sub.toUpperCase();
      sectionName.textContent = MODULE_LABELS[currentMod - 1].toUpperCase() + ' · ' + sub.toUpperCase();
      sectionName.setAttribute('data-num', modKey);
      nextEl.textContent = '↑ MODULES';
    } else {
      const num = String(current).padStart(2, '0');
      currentEl.textContent = num;
      totalEl.textContent = '/ 06';
      sectionName.textContent = LABELS[current - 1].toUpperCase();
      sectionName.setAttribute('data-num', num);
      nextEl.textContent = current < TOTAL ? `— ${LABELS[current].toUpperCase()}` : END_LABEL;
    }
  }

  function updateNavDist() {
    nodes.forEach(node => {
      const goNum = Number(node.dataset.go);
      if (currentMod !== null) {
        if (goNum === 3) { node.setAttribute('data-state', 'parent'); node.removeAttribute('data-dist'); }
        else { node.removeAttribute('data-state'); node.dataset.dist = String(Math.min(3, Math.abs(goNum - 3))); }
      } else {
        node.removeAttribute('data-state');
        node.dataset.dist = String(Math.min(3, Math.abs(goNum - current)));
      }
    });
  }
  function updateCol1Dist() {
    col1Nodes.forEach(node => { node.dataset.dist = String(Math.min(3, Math.abs(Number(node.dataset.sub) - currentSub))); });
  }

  function showSubRoom() {
    subRooms.forEach(sr => sr.classList.remove('active'));
    const key = currentMod + '-' + currentSub;
    if (HAS_CONTENT[key]) {
      const sr = document.querySelector(`.sub-room[data-mod="${currentMod}"][data-sub="${currentSub}"]`);
      if (sr) sr.classList.add('active');
    } else {
      const sub = SUB_LABELS[currentSub - 1];
      const mod = MODULE_LABELS[currentMod - 1];
      stubTitle.textContent = mod + ' · ' + sub + '.';
      stubDesc.textContent = mod + "'s " + sub.toLowerCase() + " page follows the same template as Websites · " + sub + ". Content TK.";
      stubRoom.classList.add('active');
    }
  }

  function go(n) {
    if (animating || n < 1 || n > TOTAL) return;
    if (entOpen) closeEnterprise();
    if (currentMod === null && currentPost === null && n === current) return;
    if (currentPost !== null) closePost();
    animating = true;
    // Direction-aware slide: down when going forward, up when going back. CSS room
    // transforms read this to slide the incoming/outgoing rooms in the right direction.
    document.body.dataset.direction = n > current ? 'down' : 'up';
    // Asymmetric organic tilt — small random rotation + off-center origin per transition,
    // so each scroll lifts the page sheet with a slightly different physical feel.
    const tilt = (Math.random() - 0.5) * 0.9;          // ±0.45°
    const originX = 20 + Math.random() * 60;            // 20%–80% horizontal origin
    document.body.style.setProperty('--room-tilt', `${tilt.toFixed(3)}deg`);
    document.body.style.setProperty('--room-origin-x', `${originX.toFixed(1)}%`);
    if (currentMod !== null) {
      currentMod = null; currentSub = 1;
      document.body.classList.remove('col1-open');
      subRooms.forEach(sr => sr.classList.remove('active'));
    }
    current = n;
    document.body.dataset.room = String(current);
    rooms.forEach(r => { const a = Number(r.dataset.room) === current; r.classList.toggle('active', a); r.inert = !a; });
    updateNavDist();
    paintTop();
    setSculpture(current);
    syncBodyTheme();
    writeHash();
    setTimeout(() => { animating = false; }, 720);
  }

  function enterMod(modNum, subNum = 1) {
    if (animating || modNum < 1 || modNum > 4) return;
    if (currentPost !== null) closePost();
    if (entOpen) closeEnterprise();
    animating = true;
    currentMod = modNum; currentSub = subNum;
    if (current !== 3) {
      current = 3;
      document.body.dataset.room = '3';
      rooms.forEach(r => { const a = Number(r.dataset.room) === 3; r.classList.toggle('active', a); r.inert = !a; });
    }
    document.body.classList.add('col1-open');
    updateNavDist(); updateCol1Dist();
    showSubRoom(); paintTop(); syncBodyTheme();
    updateSubNavLabels();
    writeHash();
    setTimeout(() => { animating = false; }, 720);
  }

  function switchSub(subNum) {
    if (animating || currentMod === null || subNum < 1 || subNum > 4 || subNum === currentSub) return;
    animating = true;
    currentSub = subNum;
    updateCol1Dist(); showSubRoom(); paintTop(); syncBodyTheme();
    updateSubNavLabels();
    writeHash();
    setTimeout(() => { animating = false; }, 720);
  }

  function exitMod() {
    if (currentMod === null) return;
    animating = true;
    currentMod = null; currentSub = 1;
    document.body.classList.remove('col1-open');
    subRooms.forEach(sr => sr.classList.remove('active'));
    updateNavDist(); paintTop(); syncBodyTheme();
    writeHash();
    setTimeout(() => { animating = false; }, 720);
  }

  function openPost(n) {
    if (n < 1 || n > TOTAL_POSTS) return;
    if (currentPost === n) return;
    if (entOpen) closeEnterprise();
    if (current !== 5) {
      current = 5;
      document.body.dataset.room = '5';
      rooms.forEach(r => { const a = Number(r.dataset.room) === 5; r.classList.toggle('active', a); r.inert = !a; });
      updateNavDist();
      setSculpture(5);
    }
    currentPost = n;
    document.body.classList.add('reader-open');
    blogReaders.forEach(r => {
      const isActive = Number(r.dataset.post) === n;
      r.classList.toggle('active', isActive);
      if (isActive) r.scrollTop = 0;
    });
    paintTop(); syncBodyTheme();
    writeHash();
  }

  function closePost() {
    if (currentPost === null) return;
    currentPost = null;
    document.body.classList.remove('reader-open');
    blogReaders.forEach(r => r.classList.remove('active'));
    paintTop(); syncBodyTheme();
    writeHash();
  }

  function openEnterprise() {
    if (entOpen) return;
    if (currentPost !== null) closePost();
    if (currentMod !== null) exitMod();
    entOpen = true;
    document.body.classList.add('ent-open');
    document.body.removeAttribute('data-theme');   // overlay is always light
    const ep = document.getElementById('ent-page');
    if (ep) { ep.classList.add('active'); ep.scrollTop = 0; }
    writeHash();
  }
  function closeEnterprise() {
    if (!entOpen) return;
    entOpen = false;
    document.body.classList.remove('ent-open');
    const ep = document.getElementById('ent-page');
    if (ep) ep.classList.remove('active');
    syncBodyTheme();   // restore the underlying room's theme
    writeHash();
  }

  // —— Bindings ——
  document.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); go(parseInt(el.dataset.go, 10)); });
  });
  document.querySelectorAll('[data-mod]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); enterMod(parseInt(el.dataset.mod, 10), 1); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterMod(parseInt(el.dataset.mod, 10), 1); } });
  });
  document.querySelectorAll('.col1-node').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); switchSub(parseInt(el.dataset.sub, 10)); });
  });
  document.querySelectorAll('[data-back]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); exitMod(); });
  });
  document.querySelectorAll('[data-post-open]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openPost(parseInt(el.dataset.postOpen, 10));
    });
  });
  document.querySelectorAll('[data-post-back]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); closePost(); });
  });
  document.querySelectorAll('[data-ent-open]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openEnterprise(); });
  });
  document.querySelectorAll('[data-ent-back]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); closeEnterprise(); });
  });

  // —— Blog category filter ————————————————————————————————————————
  // Pills carry data-filter; posts carry data-category. "all" shows everything.
  const blogPills = document.querySelectorAll('.blog-pill');
  const blogPosts = document.querySelectorAll('.blog-featured, .blog-card');
  const blogMidRule = document.querySelectorAll('.blog-rule')[1];
  function filterBlog(cat) {
    blogPills.forEach(p => p.classList.toggle('active', p.dataset.filter === cat));
    blogPosts.forEach(a => {
      a.style.display = (cat === 'all' || a.dataset.category === cat) ? '' : 'none';
    });
    // The mid rule divides featured from grid — only meaningful when both show.
    if (blogMidRule) blogMidRule.style.display = (cat === 'all') ? '' : 'none';
  }
  blogPills.forEach(pill => {
    pill.addEventListener('click', () => filterBlog(pill.dataset.filter));
  });

  window.addEventListener('wheel', e => {
    if (animating || currentMod !== null) return;
    // Reader open: the reader handles its own internal scroll. Never use wheel for room nav.
    if (currentPost !== null) return;
    if (entOpen) return;   // enterprise overlay scrolls itself
    // Blog room: let the room scroll internally. Only treat the wheel as room-nav
    // when the user has scrolled to the top (going up) or the bottom (going down).
    if (current === 5) {
      const blog = document.querySelector('.room[data-room="5"]');
      if (blog) {
        const atTop = blog.scrollTop <= 1;
        const atBottom = blog.scrollTop + blog.clientHeight >= blog.scrollHeight - 1;
        if (e.deltaY > 0 && !atBottom) { wheelAcc = 0; return; }
        if (e.deltaY < 0 && !atTop) { wheelAcc = 0; return; }
      }
    }
    wheelAcc += e.deltaY;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAcc = 0; }, 220);
    if (Math.abs(wheelAcc) >= WHEEL_THRESHOLD) { go(current + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0; }
  }, { passive: true });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && entOpen) { e.preventDefault(); closeEnterprise(); return; }
    if (e.key === 'Escape' && currentPost !== null) { e.preventDefault(); closePost(); return; }
    if (e.key === 'Escape' && currentMod !== null) { e.preventDefault(); exitMod(); return; }
    if (entOpen) return; // enterprise: let the overlay scroll natively
    if (currentPost !== null) return; // reader: let arrows scroll natively
    if (currentMod !== null) {
      if (e.key === 'ArrowDown') { e.preventDefault(); switchSub(currentSub + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); switchSub(currentSub - 1); }
      return;
    }
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(current + 1); }
    else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(1); }
    else if (e.key === 'End') { e.preventDefault(); go(TOTAL); }
  });

  let touchY = 0;
  window.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (currentMod !== null || currentPost !== null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > TOUCH_THRESHOLD) go(current + (dy > 0 ? 1 : -1));
  }, { passive: true });

  // —— URL hash routing —————————————————————————————————————————————
  // Format:
  //   #02            → main room 02 (The Gap)
  //   #03/M.01/2     → room 03, module 01 (Websites), sub-page 2 (Examples)
  // Internal navigation writes hash via pushState (browser history works).
  // popstate listener restores state on browser back/forward.
  let restoringHash = false;

  function computeHash() {
    if (entOpen) return '#enterprise';
    let h = '#' + String(current).padStart(2, '0');
    if (currentMod !== null) {
      h += '/M.' + String(currentMod).padStart(2, '0') + '/' + currentSub;
    } else if (currentPost !== null) {
      h += '/POST.' + String(currentPost).padStart(2, '0');
    }
    return h;
  }
  function writeHash() {
    if (restoringHash) return;
    const newHash = computeHash();
    if (location.hash === newHash) return;
    history.pushState(null, '', newHash);
  }
  function parseHash() {
    const raw = location.hash.slice(1);
    if (!raw) return null;
    if (raw === 'enterprise') return { ent: true };
    const parts = raw.split('/');
    const roomM = parts[0].match(/^0?(\d+)$/);
    if (!roomM) return null;
    const room = parseInt(roomM[1], 10);
    if (!(room >= 1 && room <= TOTAL)) return null;
    const out = { room };
    if (parts.length >= 3 && parts[1].startsWith('M.')) {
      const modM = parts[1].match(/^M\.0?(\d+)$/);
      if (modM) {
        const mod = parseInt(modM[1], 10);
        const sub = parseInt(parts[2], 10);
        if (mod >= 1 && mod <= 4 && sub >= 1 && sub <= 4) {
          out.mod = mod; out.sub = sub;
        }
      }
    } else if (parts.length >= 2 && parts[1].startsWith('POST.')) {
      const postM = parts[1].match(/^POST\.0?(\d+)$/);
      if (postM) {
        const post = parseInt(postM[1], 10);
        if (post >= 1 && post <= TOTAL_POSTS) out.post = post;
      }
    }
    return out;
  }
  function restoreFromHash() {
    const s = parseHash();
    if (!s) return;
    restoringHash = true;
    if (s.mod !== undefined) {
      if (currentPost !== null) closePost();
      enterMod(s.mod, s.sub);
    } else if (s.post !== undefined) {
      if (currentMod !== null) exitMod();
      openPost(s.post);
    } else if (s.ent) {
      openEnterprise();
    } else {
      if (currentMod !== null) exitMod();
      if (currentPost !== null) closePost();
      if (entOpen) closeEnterprise();
      if (s.room !== current) go(s.room);
    }
    // Release suppression after the animations settle so subsequent navigations write hash
    setTimeout(() => { restoringHash = false; }, 50);
  }
  window.addEventListener('popstate', restoreFromHash);
  // —————————————————————————————————————————————————————————————————

  initSculpture();
  syncBodyTheme();
  paintTop();
  setTimeout(() => setSculpture(1), 120);
  // Restore state from URL if present (e.g., Cmd+R, shared link, bookmark)
  if (location.hash) {
    setTimeout(restoreFromHash, 160);
  }

  // ——— ROUTER MODE (Phase 2) ———————————————————————————————————————————
  // Self-contained: drives the persistent shell's sculpture + HUD and delegates page
  // navigation to assets/js/router.js. The legacy code above never runs in this mode.
  function initRouterMode(cfg) {
    const sculpt = (n) => { if (window.__sculpt3D) window.__sculpt3D(n); };
    const currentEl = document.querySelector('.counter .current');
    const totalEl = document.querySelector('.counter .total');
    const nextEl = document.getElementById('next-label');
    const sectionName = document.getElementById('section-name');
    const TOTAL_ROOMS = cfg.totalRooms || 6;
    let journey = cfg.journey, idx = cfg.index || 0, animating = false;
    let pageRooms = [], localIdx = 0; // rooms shown on THIS page (multi for home: Arrival + The Gap)

    // Marks the document so canvas.css can give router sections real scroll travel (the slack
    // band) — legacy pt-br has no journey, never gets this, keeps its old instant-snap canvas.
    document.documentElement.classList.add('router-mode');

    // The section the wheel/touch nav should read for its scroll position.
    const activeRoomEl = () =>
      document.querySelector('main#main .room.active') || document.querySelector('main#main .room');

    // Side pages (service detail / enterprise / blog post / legal) render an .ent-page article
    // instead of .room sections; their scroll container is .ent-page (overflow-y:auto), which the
    // edge-scroll logic above does NOT track. Without this guard activeRoomEl()/atScrollEdge() find
    // no .room, report "always at the edge", and every wheel/touch/key gesture fires navTo() —
    // yanking the reader off the article. On a side page we bail out of snap-nav entirely and let
    // .ent-page scroll natively (navigation off a side page happens via the nav-rail / back link).
    const onSidePage = () => !document.querySelector('main#main .room');

    // True when the active section is scrolled to the edge in the gesture's direction — i.e. there
    // is no more content slack to consume, so the gesture should cross to the next/prev section.
    function atScrollEdge(dir) {
      const el = activeRoomEl();
      if (!el) return true;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 1) return true;                       // nothing to scroll → always at the edge
      return dir > 0 ? el.scrollTop >= max - 2 : el.scrollTop <= 2;
    }

    // Where the active section had SETTLED before the current gesture began.
    //
    // The wheel listener is passive, so the compositor applies the scroll and the handler runs
    // afterwards — meaning el.scrollTop inside the handler can already read "at the edge" for a
    // flick that only just travelled there. Gating on that let one hard flick scroll a section to
    // its end AND cross into the next in the same gesture, skipping all of the content between
    // (measured 2026-07-31: a single 600px delta skipped all 383px of room 1; 420px raced and
    // behaved differently between runs). Sampling the position on a scroll-idle debounce instead
    // makes the gate independent of that race: crossing requires the section to have been RESTING
    // at its edge when the gesture started, so reaching the edge and leaving it are always two
    // separate gestures.
    let settledTop = 0, settleT;
    const markSettled = (v) => { clearTimeout(settleT); settledTop = v; };
    document.addEventListener('scroll', (e) => {
      const el = activeRoomEl();
      if (!el || e.target !== el) return;
      clearTimeout(settleT);
      settleT = setTimeout(() => { settledTop = el.scrollTop; }, 150);
    }, true);

    function settledAtEdge(dir) {
      const el = activeRoomEl();
      if (!el) return true;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 1) return true;                       // nothing to scroll → always at the edge
      return dir > 0 ? settledTop >= max - 2 : settledTop <= 2;
    }

    // Place the scroll position when a section becomes active: short sections sit centred (equal
    // slack above + below to scroll into); sections taller than the viewport anchor at content-top
    // (keeping the upward slack so you can still scroll up a touch before snapping back).
    function placeScroll() {
      const el = activeRoomEl();
      if (!el) return;
      requestAnimationFrame(() => {
        const max = el.scrollHeight - el.clientHeight;
        // markSettled on every branch: a newly activated section is at rest where we put it, and
        // the gesture gate reads that resting position rather than waiting for the scroll debounce.
        if (max <= 1) { el.scrollTop = 0; markSettled(0); return; }
        const rn = el.dataset.room || '';
        if (rn === '5' || rn === '6') { el.scrollTop = 0; markSettled(0); return; }   // blog/contact: real content, no slack band → start at top
        const inner = el.querySelector('.room-inner');
        const slackPx = Math.round(el.clientHeight * SLACK_RATIO);
        el.scrollTop = (inner && inner.offsetHeight > el.clientHeight) ? slackPx : Math.round(max / 2);
        markSettled(el.scrollTop);
      });
    }

    function paint(c) {
      journey = c.journey || journey;
      idx = c.index || 0;
      pageRooms = (c.rooms && c.rooms.length) ? c.rooms.slice() : [];
      localIdx = 0;
      document.body.dataset.palette = c.palette || 'cyan';
      if (c.label) paintSide(c);                      // side page (enterprise, service detail, blog post, legal)
      else if (pageRooms.length) paintHUD(pageRooms[0]); // journey page — HUD for its first room
    }

    function paintSide(c) {
      if (currentEl) currentEl.textContent = c.counter || '';
      if (totalEl) totalEl.textContent = '';
      if (sectionName) { sectionName.textContent = (c.label || '').toUpperCase(); sectionName.setAttribute('data-num', c.counter || ''); }
      if (nextEl) nextEl.textContent = c.next || '';
      document.body.dataset.room = '';
      document.body.removeAttribute('data-theme');
      document.querySelectorAll('.nav-node').forEach((node) => { node.dataset.dist = '3'; node.removeAttribute('aria-current'); });
    }

    function paintHUD(rn) {
      const labels = (cfg.labels && cfg.labels.rooms) || [];
      const num = String(rn).padStart(2, '0');
      if (currentEl) currentEl.textContent = num;
      if (totalEl) totalEl.textContent = '/ ' + String(TOTAL_ROOMS).padStart(2, '0');
      if (sectionName) { sectionName.textContent = (labels[rn - 1] || '').toUpperCase(); sectionName.setAttribute('data-num', num); }
      const end = (cfg.labels && cfg.labels.end) || '— END';
      let nx;
      if (localIdx + 1 < pageRooms.length) nx = '— ' + (labels[pageRooms[localIdx + 1] - 1] || '').toUpperCase();
      else if (idx + 1 < journey.length) nx = '— ' + (journey[idx + 1].label || '').toUpperCase();
      else nx = end;
      if (nextEl) nextEl.textContent = nx;
      document.body.dataset.room = String(rn);
      const ar = document.querySelector('main#main .room.active') || document.querySelector('main#main .room');
      if (ar && ar.getAttribute('data-theme') === 'dark') document.body.setAttribute('data-theme', 'dark');
      else document.body.removeAttribute('data-theme');
      document.querySelectorAll('.nav-node').forEach((node) => {
        const go = Number(node.dataset.go);
        node.dataset.dist = String(Math.min(3, Math.abs(go - rn)));
        if (go === rn) node.setAttribute('aria-current', 'true'); else node.removeAttribute('aria-current');
      });
    }

    // in-page room snap (multi-room pages, e.g. home Arrival <-> The Gap)
    function goLocal(li, dir) {
      localIdx = li;
      const rn = pageRooms[li];
      document.body.dataset.direction = dir > 0 ? 'down' : 'up';
      document.querySelectorAll('main#main .room').forEach((r) => {
        const a = Number(r.dataset.room) === rn;
        r.classList.toggle('active', a); r.inert = !a;
      });
      paintHUD(rn);
      sculpt(rn);
      placeScroll();
    }

    // Returns true only if it actually changed section (so the caller arms the settle lock only
    // on a real move — a no-op at the first/last boundary must not lock out the next gesture).
    function navTo(dir) {
      if (animating) return false;
      const nl = localIdx + dir;
      if (pageRooms.length > 1 && nl >= 0 && nl < pageRooms.length) { // snap between rooms on this page
        animating = true; goLocal(nl, dir);
        setTimeout(() => { animating = false; }, 720); return true;
      }
      const n = idx + dir;                                           // boundary → adjacent journey stop
      if (n < 0 || n >= journey.length || !window.__oopuoRouter) return false;
      animating = true;
      Promise.resolve(window.__oopuoRouter.navigate(journey[n].path)).finally(() => { animating = false; });
      return true;
    }

    // activate the first room of the current page (or, for a side page, just reveal its content).
    // animate=true (router page swap): start the new room inactive, flush that frame, then activate
    // next frame so the slide+fade entry transition actually runs instead of the content popping in
    // dry. animate=false (cold start): activate instantly.
    function activateInitialRoom(animate) {
      const rs = document.querySelectorAll('main#main .room');
      const target = pageRooms.length ? pageRooms[0] : null;
      const apply = () => {
        rs.forEach((r) => { const a = target == null ? true : Number(r.dataset.room) === target; r.classList.toggle('active', a); r.inert = !a; });
        placeScroll();
      };
      if (!animate || !rs.length) { apply(); return; }
      rs.forEach((r) => { r.classList.remove('active'); r.inert = true; });
      void document.getElementById('main').offsetHeight;   // paint the inactive (opacity:0/offset) state
      requestAnimationFrame(apply);                          // → next frame: activate, transition runs
      return;
    }

    // load the HubSpot form embed if the current page has a real (non-placeholder) form frame.
    // Needed because inline <script> inside a swapped <main> never executes (router-mode contact page).
    let hsLoaded = false;
    function loadContactForm() {
      if (hsLoaded) return;
      const frame = document.querySelector('main#main .hs-form-frame');
      if (!frame) return;
      const id = frame.getAttribute('data-form-id') || '';
      if (/^YOUR_/.test(id)) return; // inert placeholder (NL/FR) — load nothing
      hsLoaded = true;
      const s = document.createElement('script');
      s.src = 'https://js-eu1.hsforms.net/forms/embed/148607612.js';
      document.body.appendChild(s);
    }

    // router.js calls this after it swaps <main> — repaint shell for the new page
    window.__oopuoOnRoute = function (c) {
      c = c || cfg;
      const prevIdx = idx;                                  // capture before paint() overwrites it
      paint(c);
      // entry slide direction: forward along the journey = down, backward = up
      document.body.dataset.direction = (c.index || 0) < prevIdx ? 'up' : 'down';
      activateInitialRoom(true);                            // animate the new page in (not a dry pop-in)
      sculpt(c.sculpture || (c.rooms && c.rooms[0]) || 1);
      loadContactForm();
      const m = document.getElementById('main');
      if (m) m.focus({ preventScroll: true });
    };

    // nav-rail nodes → journey routes by room (each dot maps to the stop that owns its room)
    document.querySelectorAll('.nav-node').forEach((node) => {
      node.addEventListener('click', (e) => {
        e.preventDefault();
        const go = Number(node.dataset.go);
        const stop = journey.find((s) => (s.rooms || []).includes(go));
        if (stop && window.__oopuoRouter) window.__oopuoRouter.navigate(stop.path);
      });
    });

    // wheel / keyboard / touch → adjacent journey stop. Edge-gated: while the active section
    // still has content slack to scroll in the gesture's direction, we let it scroll natively
    // (passive listener, no preventDefault) and reset the accumulator. Only once it's at the
    // scroll edge does a further nudge (EDGE_WHEEL) cross to the next/prev section.
    let wAcc = 0, wT, navCooldownUntil = 0, lastNavDir = 0, clusterPeak = 0, lastWheelTs = 0;
    window.addEventListener('wheel', (e) => {
      if (onSidePage()) return;                           // side page → let .ent-page scroll natively
      const now = e.timeStamp, dir = e.deltaY > 0 ? 1 : -1, mag = Math.abs(e.deltaY);
      // Track the peak |deltaY| of the current scroll cluster; a >160ms quiet gap starts a new one.
      if (now - lastWheelTs > 160) clusterPeak = 0;
      lastWheelTs = now;
      clusterPeak = Math.max(clusterPeak, mag);
      // Reversal = fresh intent → drop the cooldown AND reset the peak so the new direction isn't
      // mistaken for the previous fling's coast.
      if (dir !== lastNavDir) { navCooldownUntil = 0; clusterPeak = mag; }
      // Mid-transition or inside the post-snap cooldown → just scroll content, never snap. The
      // cooldown is FIXED (not extended), so sustained scrolling advances one section per cooldown
      // instead of getting stuck.
      if (animating || now < navCooldownUntil) { wAcc = 0; return; }
      // Gate on the SETTLED position, not the live one — see settledAtEdge(). While the section
      // still has slack to travel from where it was resting, the gesture only scrolls content.
      if (!settledAtEdge(dir)) { wAcc = 0; return; }
      // Coast guard: a wheel event well below the gesture's peak is the inertial tail of a flick →
      // ignore it, so one flick = one section while a steady (peak-level) scroll keeps advancing.
      if (mag < clusterPeak * COAST_RATIO) { wAcc = 0; return; }
      wAcc += e.deltaY; clearTimeout(wT); wT = setTimeout(() => { wAcc = 0; }, 200);
      if (Math.abs(wAcc) >= EDGE_WHEEL && navTo(dir)) { wAcc = 0; navCooldownUntil = now + NAV_COOLDOWN; lastNavDir = dir; }
    }, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (onSidePage()) return;                          // side page → leave keys to native scroll
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); navTo(1); }
      else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); navTo(-1); }
    });
    let tY = 0, tTop = 0;
    window.addEventListener('touchstart', (e) => {
      tY = e.touches[0].clientY;
      tTop = activeRoomEl()?.scrollTop ?? 0;             // baseline for the touchend scroll guard
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      if (onSidePage()) return;                          // side page → let .ent-page scroll natively
      const now = e.timeStamp;
      const dy = tY - e.changedTouches[0].clientY;
      if (Math.abs(dy) <= EDGE_TOUCH) return;            // not a deliberate swipe → ignore
      const dir = dy > 0 ? 1 : -1;
      if (dir !== lastNavDir) navCooldownUntil = 0;      // reversal → fresh gesture (see wheel)
      if (animating || now < navCooldownUntil) return;   // fixed cooldown — one swipe = one section
      // Only snap when the section is at its scroll edge — otherwise native scroll already moved
      // the content and we leave the user where they scrolled to.
      // Same rule as the wheel gate: a swipe that consumed content scroll has done its job and must
      // not ALSO cross the edge, or one long swipe skips the whole section. Touch can compare
      // directly, since touchstart samples the position before the scroll happens.
      const tEl = activeRoomEl();
      if (tEl && Math.abs(tEl.scrollTop - tTop) > 2) return;
      if (atScrollEdge(dir) && navTo(dir)) { navCooldownUntil = now + NAV_COOLDOWN; lastNavDir = dir; }
    }, { passive: true });

    // ── Deck (the horizontal accordion) ────────────────────────────────────────────
    // Panels are real links, so pointer and keyboard already work for free: hover and
    // :focus-visible expand a panel in CSS, Enter follows the href, and the URL is the
    // truth rather than a JS-only state. Two things still need handling.
    //
    // 1. Touch has no hover. The first tap OPENS a panel; only a second tap on the panel
    //    that is already open navigates — otherwise a phone user could never read a card.
    // 2. Arrow keys inside a deck must walk the deck, not fly the journey to the next
    //    section. These listeners are on document and the nav listeners are on window, so
    //    these run first and stopPropagation() keeps the gesture local.
    // Both are delegated, so they survive soft-nav without re-binding.
    const coarsePointer = () => window.matchMedia('(hover: none)').matches;
    document.addEventListener('click', (e) => {
      const panel = e.target.closest && e.target.closest('.deck-panel');
      if (!panel || !coarsePointer()) return;
      if (panel.classList.contains('is-open')) return;   // already open → let the link through
      e.preventDefault();
      panel.closest('.deck').querySelectorAll('.deck-panel.is-open').forEach(p => p.classList.remove('is-open'));
      panel.classList.add('is-open');
    });
    document.addEventListener('keydown', (e) => {
      const panel = document.activeElement && document.activeElement.closest && document.activeElement.closest('.deck-panel');
      if (!panel) return;
      const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
      const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
      if (!fwd && !back) return;
      const items = Array.from(panel.closest('.deck').querySelectorAll('.deck-panel'));
      const next = items[items.indexOf(panel) + (fwd ? 1 : -1)];
      if (!next) return;                                 // at either end → let the journey nav have it
      e.preventDefault();
      e.stopPropagation();
      next.focus();
    });

    // first load: paint the HUD + activate the first room + (if contact) load the form. The
    // sculpture module places this page's configured shape itself — instantly, no morph.
    paint(cfg);
    activateInitialRoom();
    loadContactForm();
  }

  // ——— LOCALE CHROME (switcher + geo-suggest) ——————————————————————————
  // Self-hosted, no build. EN/NL/FR have full page parity, so the switcher maps to the EQUIVALENT
  // page in the target locale (e.g. /services/websites/ -> /nl/services/websites/). pt-br is a
  // single Brazil page (different strategy, D-018) so it always targets its home.
  function initLocaleChrome() {
    const LOCALES = [
      { code: 'en',    label: 'EN', prefix: '' },
      { code: 'nl',    label: 'NL', prefix: '/nl' },
      { code: 'fr',    label: 'FR', prefix: '/fr' },
      { code: 'pt-br', label: 'PT', prefix: '/pt-br' }
    ];
    const m = location.pathname.match(/^\/(nl|fr|pt-br)\//);
    const current = m ? m[1] : 'en';
    // EN-equivalent ("bare") path of the page we're on, e.g. /nl/services/ -> /services/ , /fr/ -> /
    const bare = location.pathname.replace(/^\/(nl|fr|pt-br)(?=\/)/, '') || '/';
    const hud = document.querySelector('.hud');
    // Header logo/wordmark → home (locale-aware). Pages where .brand is already an <a> skip this.
    if (hud) {
      const brand = hud.querySelector('.brand');
      if (brand && brand.tagName !== 'A' && !brand.dataset.homeWired) {
        brand.dataset.homeWired = '1';
        brand.style.cursor = 'pointer';
        brand.setAttribute('role', 'link');
        brand.setAttribute('tabindex', '0');
        brand.setAttribute('aria-label', 'OOPUO — home');
        const brandHome = current === 'en' ? '/' : '/' + current + '/';
        const goBrandHome = function () {
          if (window.__oopuoRouter && typeof window.__oopuoRouter.navigate === 'function') window.__oopuoRouter.navigate(brandHome);
          else location.href = brandHome;
        };
        brand.addEventListener('click', goBrandHome);
        brand.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goBrandHome(); } });
      }
    }
    if (hud && !hud.querySelector('.locale')) {
      const nav = document.createElement('nav');
      nav.className = 'locale';
      nav.setAttribute('aria-label', 'Language');

      // Collapsed trigger — shows only the current locale + caret.
      const curLoc = LOCALES.find((l) => l.code === current) || LOCALES[0];
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'locale-toggle';
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Change language');
      toggle.innerHTML = '<span class="locale-cur">' + curLoc.label +
        '</span><span class="locale-caret" aria-hidden="true">▾</span>';

      // Expanded menu — all locales; hidden until the trigger is clicked.
      const menu = document.createElement('div');
      menu.className = 'locale-menu';
      menu.setAttribute('role', 'menu');
      LOCALES.forEach((loc) => {
        const a = document.createElement('a');
        // pt-br has only its home; EN/NL/FR keep the same path across locales
        a.href = (loc.code === 'pt-br') ? '/pt-br/' : (loc.prefix + bare);
        a.textContent = loc.label;
        a.setAttribute('role', 'menuitem');
        a.setAttribute('hreflang', loc.code);
        a.setAttribute('data-no-router', '');                 // cross-locale switch must hard-load (D-018)
        if (loc.code === current) a.setAttribute('aria-current', 'true');
        menu.appendChild(a);
      });

      nav.appendChild(toggle);
      nav.appendChild(menu);
      hud.appendChild(nav);

      const closeMenu = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
      const openMenu = () => { nav.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); };
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.contains('open') ? closeMenu() : openMenu();
      });
      document.addEventListener('click', (e) => { if (!nav.contains(e.target)) closeMenu(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    }

    // Geo-suggest: only on the EN root, only when the browser's preferred language points elsewhere.
    if (current !== 'en' || location.pathname !== '/' || location.hash) return;
    try { if (localStorage.getItem('oopuo-geo-dismissed')) return; } catch (e) {}
    const pref = (navigator.languages || [navigator.language || '']).map((l) => l.toLowerCase());
    const COPY = {
      nl:    { home: '/nl/',    msg: 'Deze site is ook in het Nederlands beschikbaar.', cta: 'Bekijken →' },
      fr:    { home: '/fr/',    msg: 'Ce site est aussi disponible en français.',        cta: 'Ouvrir →'   },
      'pt-br': { home: '/pt-br/', msg: 'Este site também está disponível em português.', cta: 'Abrir →'    }
    };
    let hit = null;
    for (const l of pref) {
      if (l.startsWith('nl')) { hit = COPY.nl; break; }
      if (l.startsWith('fr')) { hit = COPY.fr; break; }
      if (l.startsWith('pt')) { hit = COPY['pt-br']; break; }
    }
    if (!hit) return;
    const bar = document.createElement('div');
    bar.className = 'geo-suggest';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Language suggestion');
    bar.innerHTML = '<span>' + hit.msg + '</span> <a href="' + hit.home + '" data-no-router>' + hit.cta + '</a>';
    const close = document.createElement('button');
    close.type = 'button'; close.setAttribute('aria-label', 'Dismiss'); close.textContent = '✕';
    close.addEventListener('click', () => {
      bar.classList.remove('in');
      try { localStorage.setItem('oopuo-geo-dismissed', '1'); } catch (e) {}
      setTimeout(() => bar.remove(), 400);
    });
    bar.appendChild(close);
    document.body.appendChild(bar);
    requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('in')));
  }
})();
