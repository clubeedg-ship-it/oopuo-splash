(function () {
  const TOTAL = 6;
  var __cfg = (window.OOPUO || {}), __cfgL = (__cfg.labels || {});
  const LABELS = __cfgL.rooms || ["Arrival", "The Gap", "Modules", "Studio", "Blog", "Invitation"];
  const END_LABEL = __cfgL.end || "— END";
  const MODULE_LABELS = ["Websites", "AI Support", "Automation", "Integrations"];
  const SUB_LABELS = ["Overview", "Examples", "Process", "Pricing"];
  const HAS_CONTENT = { "1-1": true, "1-2": true, "1-3": true, "1-4": true, "2-1": true, "2-2": true, "2-3": true, "2-4": true, "3-1": true, "3-2": true, "3-3": true, "3-4": true, "4-1": true, "4-2": true, "4-3": true, "4-4": true };

  let current = 1, currentMod = null, currentSub = 1, animating = false, entOpen = false;
  let wheelAcc = 0, wheelTimer;
  const WHEEL_THRESHOLD = 60;

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
    if (Math.abs(dy) > 50) go(current + (dy > 0 ? 1 : -1));
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
})();
