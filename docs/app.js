/* Radio World — installable PWA. Station data: radio-browser.info (public API). */
'use strict';
(() => {
  const API_HOSTS = ['de1.api.radio-browser.info', 'de2.api.radio-browser.info', 'all.api.radio-browser.info'];
  const DATA_CACHE = 'rw-data-v1';
  const PAGE = 120;
  const IS_HTTPS = location.protocol === 'https:';

  // ---------- storage ----------
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('rw.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('rw.' + k, JSON.stringify(v)); } catch (e) { /* quota / private mode */ } },
  };

  // ---------- i18n ----------
  const STR = {
    bg: {
      install: 'Инсталирай', favorites: 'Любими', eyebrow: 'Световно радио',
      homeTitle: 'Радио от целия свят', homeSub: 'Избери държава и слушай станциите ѝ на живо.',
      searchCountries: 'Търси държава или код…', countries: 'Държави', nCountries: n => `${n} държави`,
      nStations: n => `${n} станции`, sortDefault: 'По подразбиране', sortName: 'Име А–Я', sortStations: 'Най-много станции',
      recent: 'Последно слушани', searchStations: 'Търси станция или жанр…', sortPopular: 'Най-слушани',
      sortVotes: 'Най-харесвани', sortBitrate: 'Най-високо качество', onlyFav: 'Само любими', onlyHttps: 'Само HTTPS',
      noCountries: 'Няма намерени държави.', noStations: 'Няма намерени станции.', loading: 'Зареждане…',
      favTitle: 'Любими станции', favEmpty: 'Още нямаш любими. Натисни ♥ до станция, за да я добавиш.',
      pick: 'Избери станция', connecting: 'Свързване…', live: 'На живо', paused: 'Пауза',
      error: 'Станцията не отговаря', errorHttp: 'Само HTTP — блокирана през HTTPS',
      srcLive: 'Актуален списък от radio-browser.info', srcCache: d => `Офлайн копие от ${d}`, srcSnapshot: d => `Вграден списък от ${d}`,
      offline: 'Няма интернет — радиото изисква връзка.', online: 'Връзката е възстановена.',
      update: 'Има нова версия.', reload: 'Обнови',
      themeAuto: 'Тема: системна', themeLight: 'Тема: светла', themeDark: 'Тема: тъмна',
      play: 'Пусни', pause: 'Пауза', prev: 'Предишна', next: 'Следваща', addFav: 'Добави в любими', removeFav: 'Махни от любими',
      back: 'Назад', volume: 'Сила на звука', notFound: 'Няма такава държава.',
      httpNote: 'Станциите с етикет HTTP може да не тръгнат, когато приложението е отворено през HTTPS.',
      iosInstall: 'За инсталиране: бутон Сподели → „Добави към началния екран“.', langName: 'EN',
    },
    en: {
      install: 'Install', favorites: 'Favorites', eyebrow: 'World radio',
      homeTitle: 'Radio from around the world', homeSub: 'Pick a country and listen to its stations live.',
      searchCountries: 'Search country or code…', countries: 'Countries', nCountries: n => `${n} countries`,
      nStations: n => `${n} stations`, sortDefault: 'Default', sortName: 'Name A–Z', sortStations: 'Most stations',
      recent: 'Recently played', searchStations: 'Search station or genre…', sortPopular: 'Most played',
      sortVotes: 'Most liked', sortBitrate: 'Highest quality', onlyFav: 'Favorites only', onlyHttps: 'HTTPS only',
      noCountries: 'No countries found.', noStations: 'No stations found.', loading: 'Loading…',
      favTitle: 'Favorite stations', favEmpty: 'No favorites yet. Tap ♥ next to a station to add it.',
      pick: 'Pick a station', connecting: 'Connecting…', live: 'Live', paused: 'Paused',
      error: 'Station not responding', errorHttp: 'HTTP only — blocked over HTTPS',
      srcLive: 'Live list from radio-browser.info', srcCache: d => `Offline copy from ${d}`, srcSnapshot: d => `Built-in list from ${d}`,
      offline: 'No internet — radio needs a connection.', online: 'Back online.',
      update: 'A new version is available.', reload: 'Reload',
      themeAuto: 'Theme: system', themeLight: 'Theme: light', themeDark: 'Theme: dark',
      play: 'Play', pause: 'Pause', prev: 'Previous', next: 'Next', addFav: 'Add to favorites', removeFav: 'Remove from favorites',
      back: 'Back', volume: 'Volume', notFound: 'No such country.',
      httpNote: 'Stations marked HTTP may not play when the app is opened over HTTPS.',
      iosInstall: 'To install: Share button → “Add to Home Screen”.', langName: 'БГ',
    },
  };
  let lang = LS.get('lang', (navigator.language || '').toLowerCase().startsWith('bg') ? 'bg' : 'en');
  const t = (k, ...a) => { const v = (STR[lang] || STR.en)[k]; return typeof v === 'function' ? v(...a) : (v ?? k); };
  let regionNames = null;
  const countryName = cc => {
    try { regionNames = regionNames || new Intl.DisplayNames([lang], { type: 'region' }); return regionNames.of(cc) || cc; } catch (e) { return cc; }
  };

  // ---------- helpers ----------
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => (/^https?:\/\//i.test(u || '') ? u : '');
  const upgrade = u => (IS_HTTPS && /^http:\/\//i.test(u) ? 'https://' + u.slice(7) : u);
  const fmtDate = iso => { try { return new Date(iso).toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }); } catch (e) { return iso; } };
  const norm = s => String(s || '').toLocaleLowerCase();
  const PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#8884"/>' +
    '<g fill="none" stroke="#8889" stroke-width="2.4" stroke-linecap="round"><path d="M17 17a10 10 0 0 0 0 14M31 17a10 10 0 0 1 0 14"/></g><circle cx="24" cy="24" r="3.5" fill="#8889"/></svg>');
  const logoTag = (url, cls = 'logo') =>
    `<img class="${cls}" src="${esc(safeUrl(upgrade(url)) || PLACEHOLDER)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">`;
  const flagTag = (cc, cls = 'flag') =>
    `<img class="${cls}" src="flags/${esc(cc.toLowerCase())}.png" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;flag-fb&quot;>${esc(cc)}</span>'">`;
  const icon = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;

  let toastTimer = 0;
  function toast(msg, action) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>`;
    if (action) { const b = document.createElement('button'); b.textContent = action.label; b.onclick = action.run; el.append(b); }
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    if (!action) toastTimer = setTimeout(() => el.classList.add('hidden'), 4000);
  }

  // ---------- theme ----------
  const THEMES = ['auto', 'light', 'dark'];
  let theme = LS.get('theme', 'auto');
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    const btn = $('#themeBtn');
    btn.innerHTML = icon(theme === 'light' ? 'i-sun' : theme === 'dark' ? 'i-moon' : 'i-auto');
    const label = t(theme === 'light' ? 'themeLight' : theme === 'dark' ? 'themeDark' : 'themeAuto');
    btn.title = label; btn.setAttribute('aria-label', label);
    requestAnimationFrame(() => {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      document.querySelector('meta[name="theme-color"]').setAttribute('content', bg || '#101114');
    });
  }
  $('#themeBtn').addEventListener('click', () => { theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]; LS.set('theme', theme); applyTheme(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => theme === 'auto' && applyTheme());

  // ---------- language ----------
  function applyLang() {
    document.documentElement.lang = lang;
    regionNames = null;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('#langBtn').textContent = t('langName');
    $('#langBtn').title = lang === 'bg' ? 'English' : 'Български';
    $('#favLink').setAttribute('aria-label', t('favorites'));
    $('#prevBtn').setAttribute('aria-label', t('prev'));
    $('#nextBtn').setAttribute('aria-label', t('next'));
    $('#volume').setAttribute('aria-label', t('volume'));
    applyTheme();
    updatePlayerUI();
  }
  $('#langBtn').addEventListener('click', () => { lang = lang === 'bg' ? 'en' : 'bg'; LS.set('lang', lang); applyLang(); route(); });

  // ---------- data ----------
  let countriesData = null;
  const stationMem = new Map();
  async function getCountries() {
    if (countriesData) return countriesData;
    const r = await fetch('data/countries.json');
    countriesData = await r.json();
    return countriesData;
  }
  const slim = raw => {
    const seen = new Set(); const out = [];
    for (const s of raw) {
      const u = String(s.url_resolved || s.url || '').trim();
      if (!/^https?:\/\//i.test(u) || !s.stationuuid || seen.has(s.stationuuid)) continue;
      seen.add(s.stationuuid);
      out.push({
        i: s.stationuuid, n: String(s.name || '').trim().slice(0, 120), u, f: String(s.favicon || '').trim(),
        c: String(s.codec || '').trim(), b: +s.bitrate || 0, h: s.hls ? 1 : 0, v: +s.votes || 0, k: +s.clickcount || 0,
        t: String(s.tags || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 4),
      });
    }
    return out.sort((a, b) => b.k - a.k || b.v - a.v || a.n.localeCompare(b.n));
  };
  async function fetchTimeout(url, ms) {
    const ctl = new AbortController(); const id = setTimeout(() => ctl.abort(), ms);
    try { return await fetch(url, { signal: ctl.signal, cache: 'no-store' }); } finally { clearTimeout(id); }
  }
  const cacheKey = cc => new URL(`cache/stations/${cc}.json`, location.href).href;
  async function loadStations(cc) {
    if (stationMem.has(cc)) return stationMem.get(cc);
    let res = null;
    if (navigator.onLine !== false) {
      for (const host of API_HOSTS) {
        try {
          const r = await fetchTimeout(`https://${host}/json/stations/bycountrycodeexact/${cc}?hidebroken=true&order=clickcount&reverse=true&limit=100000`, 9000);
          if (!r.ok) continue;
          const list = slim(await r.json());
          res = { list, source: 'live', date: new Date().toISOString() };
          if (self.caches) {
            const c = await caches.open(DATA_CACHE);
            await c.put(cacheKey(cc), new Response(JSON.stringify({ date: res.date, list }), { headers: { 'content-type': 'application/json' } }));
          }
          break;
        } catch (e) { /* try next host */ }
      }
    }
    if (!res && self.caches) {
      try {
        const hit = await (await caches.open(DATA_CACHE)).match(cacheKey(cc));
        if (hit) { const j = await hit.json(); res = { list: j.list, source: 'cache', date: j.date }; }
      } catch (e) { /* ignore */ }
    }
    if (!res) {
      try {
        const r = await fetch(`data/stations/${cc}.json`);
        if (r.ok) res = { list: await r.json(), source: 'snapshot', date: (await getCountries()).snapshot };
      } catch (e) { /* ignore */ }
    }
    if (!res) res = { list: [], source: 'none', date: '' };
    if (res.list.length || res.source !== 'none') {
      stationMem.set(cc, res);
      const counts = LS.get('counts', {}); counts[cc] = res.list.length; LS.set('counts', counts);
    }
    return res;
  }

  // ---------- favorites / recent ----------
  let favs = LS.get('favs', []);
  let recent = LS.get('recent', []);
  const isFav = id => favs.some(s => s.i === id);
  function toggleFav(st) {
    if (!st) return;
    favs = isFav(st.i) ? favs.filter(s => s.i !== st.i) : [{ ...st }, ...favs];
    LS.set('favs', favs);
    document.querySelectorAll(`[data-fav="${CSS.escape(st.i)}"]`).forEach(b => setFavBtn(b, isFav(st.i)));
    updatePlayerUI();
    $('#favLink').classList.toggle('active', favs.length > 0);
  }
  function setFavBtn(b, on) {
    b.classList.toggle('on', on);
    b.innerHTML = icon(on ? 'i-heart-fill' : 'i-heart');
    b.setAttribute('aria-label', t(on ? 'removeFav' : 'addFav'));
    b.setAttribute('aria-pressed', String(on));
  }
  function addRecent(st) {
    recent = [{ ...st }, ...recent.filter(s => s.i !== st.i)].slice(0, 12);
    LS.set('recent', recent);
  }

  // ---------- player ----------
  const audio = $('#audio');
  let current = LS.get('last', null);
  let queue = current ? [current] : [];
  let hls = null;
  let playToken = 0;
  let state = 'idle'; // idle | connecting | live | paused | error
  let hlsLib = null;

  const loadHlsLib = () => hlsLib || (hlsLib = new Promise((ok, fail) => {
    const s = document.createElement('script'); s.src = 'vendor/hls.light.min.js'; s.onload = ok; s.onerror = fail; document.head.append(s);
  }));
  function stopStream() {
    if (hls) { try { hls.destroy(); } catch (e) { /* ignore */ } hls = null; }
    audio.removeAttribute('src'); audio.load();
  }
  function setState(s) { state = s; updatePlayerUI(); }

  async function play(st, list) {
    if (!st) return;
    const token = ++playToken;
    current = st; if (list) queue = list;
    LS.set('last', st); addRecent(st);
    setState('connecting');
    markCurrent();
    stopStream();
    const url = upgrade(st.u);
    const isHls = st.h || /\.m3u8(\?|$)/i.test(url);
    try {
      if (isHls && !audio.canPlayType('application/vnd.apple.mpegurl')) {
        await loadHlsLib();
        if (token !== playToken) return;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ lowLatencyMode: false });
          hls.on(window.Hls.Events.ERROR, (_e, d) => { if (d.fatal && token === playToken) setState('error'); });
          hls.loadSource(url); hls.attachMedia(audio);
        } else audio.src = url;
      } else audio.src = url;
      await audio.play();
      setTimeout(() => { // watchdog: some streams never connect and never fire 'error'
        if (token === playToken && state === 'connecting') { playToken++; stopStream(); setState('error'); }
      }, 15000);
    } catch (e) {
      if (token !== playToken) return;
      setState(e && e.name === 'NotAllowedError' ? 'paused' : 'error');
    }
    updateMediaSession();
  }
  function pause() { playToken++; audio.pause(); stopStream(); setState('paused'); }
  function togglePlay() {
    if (!current) { const first = queue[0] || document.querySelector('.st'); if (first && first.dataset) first.click(); return; }
    if (state === 'live' || state === 'connecting') pause(); else play(current); // live radio: reconnect instead of resuming stale buffer
  }
  function step(d) {
    if (!queue.length || !current) return;
    const idx = queue.findIndex(s => s.i === current.i);
    play(queue[(idx + d + queue.length) % queue.length]);
  }

  audio.addEventListener('playing', () => setState('live'));
  audio.addEventListener('waiting', () => state !== 'paused' && setState('connecting'));
  audio.addEventListener('error', () => { if (audio.getAttribute('src') && state !== 'paused') setState('error'); });

  function updatePlayerUI() {
    const pb = $('#playBtn');
    const playing = state === 'live' || state === 'connecting';
    pb.innerHTML = icon(playing ? 'i-pause' : 'i-play');
    pb.setAttribute('aria-label', t(playing ? 'pause' : 'play'));
    $('#pName').textContent = current ? current.n : t('pick');
    const logo = $('#pLogo');
    const src = current ? (safeUrl(upgrade(current.f)) || PLACEHOLDER) : PLACEHOLDER;
    if (logo.getAttribute('src') !== src) { logo.onerror = () => { logo.onerror = null; logo.src = PLACEHOLDER; }; logo.src = src; }
    const dot = $('#pDot'); dot.classList.toggle('hidden', !current); dot.className = (current ? '' : 'hidden ') + 'dot' + (state === 'live' ? ' live' : state === 'connecting' ? ' wait' : state === 'error' ? ' err' : '');
    let status = '';
    if (current) {
      const where = current.cc ? countryName(current.cc) : '';
      const st = state === 'live' ? t('live') : state === 'connecting' ? t('connecting') : state === 'error'
        ? (IS_HTTPS && /^http:\/\//i.test(current.u) ? t('errorHttp') : t('error')) : t('paused');
      status = [st, where].filter(Boolean).join(' · ');
    }
    $('#pStatus').textContent = status;
    const fb = $('#pFav'); fb.disabled = !current; fb.dataset.fav = current ? current.i : ''; setFavBtn(fb, !!current && isFav(current.i));
    $('#prevBtn').disabled = $('#nextBtn').disabled = queue.length < 2;
    document.title = current && playing ? `${current.n} · Radio World` : 'Radio World';
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : current ? 'paused' : 'none';
  }
  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !current || !window.MediaMetadata) return;
    const art = safeUrl(upgrade(current.f));
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.n, artist: current.cc ? countryName(current.cc) : 'Radio World', album: 'Radio World',
      artwork: art ? [{ src: art, sizes: '256x256' }] : [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
    });
  }
  if ('mediaSession' in navigator) {
    const ms = navigator.mediaSession;
    const set = (a, f) => { try { ms.setActionHandler(a, f); } catch (e) { /* unsupported */ } };
    set('play', () => play(current)); set('pause', pause); set('stop', pause);
    set('previoustrack', () => step(-1)); set('nexttrack', () => step(1));
  }
  $('#playBtn').addEventListener('click', togglePlay);
  $('#prevBtn').addEventListener('click', () => step(-1));
  $('#nextBtn').addEventListener('click', () => step(1));
  $('#pFav').addEventListener('click', () => toggleFav(current));
  const vol = $('#volume');
  vol.value = LS.get('vol', 80); audio.volume = vol.value / 100;
  vol.addEventListener('input', () => { audio.volume = vol.value / 100; LS.set('vol', +vol.value); });
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space' || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName) || e.target.getAttribute('role') === 'button') return;
    e.preventDefault(); togglePlay();
  });

  function markCurrent() {
    document.querySelectorAll('.st.current').forEach(el => el.classList.remove('current'));
    if (current) document.querySelectorAll(`.st[data-id="${CSS.escape(current.i)}"]`).forEach(el => el.classList.add('current'));
  }

  // ---------- views ----------
  const view = $('#view');
  let observer = null;
  function stationRow(st, showFlag) {
    const meta = [st.c, st.b ? `${st.b} kbps` : '', ...(st.t || []).slice(0, 2)].filter(Boolean).join(' · ');
    const http = IS_HTTPS && /^http:\/\//i.test(st.u) ? '<span class="badge">HTTP</span>' : '';
    return `<div class="st${current && current.i === st.i ? ' current' : ''}" role="button" tabindex="0" data-id="${esc(st.i)}">
      ${logoTag(st.f)}
      <div class="s-text"><div class="s-name">${showFlag && st.cc ? flagTag(st.cc, 'flag mini') + ' ' : ''}${esc(st.n)}${http}</div><div class="s-meta">${esc(meta)}</div></div>
      <button class="fav-btn${isFav(st.i) ? ' on' : ''}" type="button" data-fav="${esc(st.i)}" aria-pressed="${isFav(st.i)}" aria-label="${esc(t(isFav(st.i) ? 'removeFav' : 'addFav'))}">${icon(isFav(st.i) ? 'i-heart-fill' : 'i-heart')}</button>
    </div>`;
  }
  function mountList(container, items, showFlag) {
    if (observer) { observer.disconnect(); observer = null; }
    container.innerHTML = '';
    if (!items.length) { container.innerHTML = `<div class="empty">${esc(t('noStations'))}</div>`; return; }
    let shown = 0;
    const sentinel = document.createElement('div'); sentinel.className = 'sentinel';
    const more = () => {
      const chunk = items.slice(shown, shown + PAGE); shown += chunk.length;
      sentinel.remove();
      container.insertAdjacentHTML('beforeend', chunk.map(s => stationRow(s, showFlag)).join(''));
      if (shown < items.length) container.append(sentinel);
    };
    more();
    if (shown < items.length && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) more(); }, { rootMargin: '600px' });
      observer.observe(sentinel);
    }
    const byId = id => items.find(s => s.i === id);
    container.onclick = e => {
      const fb = e.target.closest('.fav-btn'); const row = e.target.closest('.st');
      if (!row) return;
      const st = byId(row.dataset.id);
      if (fb) { e.stopPropagation(); toggleFav(st); return; }
      play(st, items);
    };
    container.onkeydown = e => {
      const row = e.target.closest('.st');
      if (row && e.target === row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); play(byId(row.dataset.id), items); }
    };
  }

  async function renderHome() {
    view.innerHTML = `
      <div class="eyebrow">${icon('i-radio')} ${esc(t('eyebrow'))}</div>
      <h1>${esc(t('homeTitle'))}</h1>
      <p class="sub">${esc(t('homeSub'))}</p>
      <div id="recentWrap"></div>
      <div class="toolbar">
        <label class="search">${icon('i-search')}<input id="q" type="search" placeholder="${esc(t('searchCountries'))}" aria-label="${esc(t('searchCountries'))}" autocomplete="off"></label>
        <select id="sort" aria-label="Sort"><option value="default">${esc(t('sortDefault'))}</option><option value="name">${esc(t('sortName'))}</option><option value="stations">${esc(t('sortStations'))}</option></select>
      </div>
      <div class="section-head"><h2>${esc(t('countries'))}</h2><span class="count" id="cnt"></span></div>
      <div class="grid" id="grid"></div>
      <div class="empty hidden" id="none">${esc(t('noCountries'))}</div>`;
    if (recent.length) {
      $('#recentWrap').innerHTML = `<div class="section-head"><h2>${esc(t('recent'))}</h2></div><div class="recent" id="recent">${recent.map(s =>
        `<button class="r-card" type="button" data-id="${esc(s.i)}">${logoTag(s.f)}<span class="r-name">${esc(s.n)}</span></button>`).join('')}</div>`;
      $('#recent').onclick = e => { const b = e.target.closest('.r-card'); if (b) play(recent.find(s => s.i === b.dataset.id), recent.slice()); };
    }
    const data = await getCountries();
    const counts = LS.get('counts', {});
    const home = ((navigator.language || '').split('-')[1] || '').toUpperCase();
    const list = data.countries.map(c => ({ cc: c.c, name: countryName(c.c), n: counts[c.c] ?? c.n }));
    const q = $('#q'), sort = $('#sort');
    sort.value = LS.get('csort', 'default');
    const draw = () => {
      const s = norm(q.value.trim());
      let items = list.filter(c => !s || norm(c.name).includes(s) || norm(c.cc).includes(s) || norm(c.cc) === s);
      if (sort.value === 'stations') items.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, lang));
      else items.sort((a, b) => (sort.value === 'default' ? (b.cc === home) - (a.cc === home) || (b.n > 0) - (a.n > 0) : 0) || a.name.localeCompare(b.name, lang));
      $('#grid').innerHTML = items.map(c => `<a class="country" href="#/c/${esc(c.cc.toLowerCase())}">${flagTag(c.cc)}
        <span class="c-text"><span class="c-name">${esc(c.name)}</span><span class="c-meta">${esc(c.cc)} · ${esc(t('nStations', c.n))}</span></span></a>`).join('');
      $('#cnt').textContent = t('nCountries', items.length);
      $('#none').classList.toggle('hidden', items.length > 0);
    };
    q.addEventListener('input', draw);
    sort.addEventListener('change', () => { LS.set('csort', sort.value); draw(); });
    draw();
  }

  async function renderCountry(cc) {
    const data = await getCountries();
    if (!data.countries.some(c => c.c === cc)) { view.innerHTML = `<p class="empty">${esc(t('notFound'))}</p>`; return; }
    view.innerHTML = `
      <div class="page-head">
        <a class="back" href="#/" aria-label="${esc(t('back'))}">${icon('i-back')}</a>
        ${flagTag(cc)}
        <div><h1 style="margin:0">${esc(countryName(cc))}</h1><div class="count" id="cnt">${esc(t('loading'))}</div></div>
      </div>
      <div class="toolbar">
        <label class="search">${icon('i-search')}<input id="q" type="search" placeholder="${esc(t('searchStations'))}" aria-label="${esc(t('searchStations'))}" autocomplete="off"></label>
        <select id="sort" aria-label="Sort"><option value="popular">${esc(t('sortPopular'))}</option><option value="votes">${esc(t('sortVotes'))}</option><option value="name">${esc(t('sortName'))}</option><option value="bitrate">${esc(t('sortBitrate'))}</option></select>
        <button class="chip" id="onlyFav" type="button" aria-pressed="false">${icon('i-heart')} ${esc(t('onlyFav'))}</button>
        ${IS_HTTPS ? `<button class="chip" id="onlyHttps" type="button" aria-pressed="false">${icon('i-lock')} ${esc(t('onlyHttps'))}</button>` : ''}
      </div>
      <div class="list" id="list"><div class="empty">${esc(t('loading'))}</div></div>
      <p class="note" id="src"></p>
      ${IS_HTTPS ? `<p class="note">${esc(t('httpNote'))}</p>` : ''}`;
    const res = await loadStations(cc);
    if (location.hash.toLowerCase() !== `#/c/${cc.toLowerCase()}`) return; // navigated away meanwhile
    const all = res.list.map(s => ({ ...s, cc }));
    $('#src').textContent = res.source === 'live' ? t('srcLive') : res.source === 'cache' ? t('srcCache', fmtDate(res.date))
      : res.source === 'snapshot' ? t('srcSnapshot', fmtDate(res.date)) : t('offline');
    const q = $('#q'), sort = $('#sort'), favBtn = $('#onlyFav'), httpsBtn = $('#onlyHttps');
    sort.value = LS.get('ssort', 'popular');
    let onlyFav = false, onlyHttps = !!(httpsBtn && LS.get('onlyHttps', false));
    if (httpsBtn) httpsBtn.setAttribute('aria-pressed', String(onlyHttps));
    const draw = () => {
      const s = norm(q.value.trim());
      let items = all.filter(st => (!s || norm(st.n).includes(s) || (st.t || []).some(x => norm(x).includes(s)))
        && (!onlyFav || isFav(st.i)) && (!onlyHttps || /^https:/i.test(st.u)));
      if (sort.value === 'votes') items.sort((a, b) => b.v - a.v);
      else if (sort.value === 'name') items.sort((a, b) => a.n.localeCompare(b.n, lang));
      else if (sort.value === 'bitrate') items.sort((a, b) => b.b - a.b);
      $('#cnt').textContent = t('nStations', items.length);
      mountList($('#list'), items, false);
    };
    q.addEventListener('input', draw);
    sort.addEventListener('change', () => { LS.set('ssort', sort.value); draw(); });
    favBtn.addEventListener('click', () => { onlyFav = !onlyFav; favBtn.setAttribute('aria-pressed', String(onlyFav)); draw(); });
    httpsBtn?.addEventListener('click', () => { onlyHttps = !onlyHttps; LS.set('onlyHttps', onlyHttps); httpsBtn.setAttribute('aria-pressed', String(onlyHttps)); draw(); });
    draw();
  }

  function renderFavorites() {
    view.innerHTML = `
      <div class="page-head"><a class="back" href="#/" aria-label="${esc(t('back'))}">${icon('i-back')}</a>
      <div><h1 style="margin:0">${esc(t('favTitle'))}</h1><div class="count">${esc(t('nStations', favs.length))}</div></div></div>
      <div class="toolbar"></div>
      ${favs.length ? '<div class="list" id="list"></div>' : `<div class="empty">${esc(t('favEmpty'))}</div>`}`;
    if (favs.length) mountList($('#list'), favs.slice(), true);
  }

  async function route() {
    const h = location.hash.replace(/^#\/?/, '');
    window.scrollTo(0, 0);
    if (observer) { observer.disconnect(); observer = null; }
    const m = h.match(/^c\/([a-z]{2})$/i);
    if (m) await renderCountry(m[1].toUpperCase());
    else if (h === 'favorites') renderFavorites();
    else await renderHome();
    $('#favLink').classList.toggle('active', h === 'favorites' || favs.length > 0);
    markCurrent();
  }
  window.addEventListener('hashchange', route);

  // ---------- install / service worker / connectivity ----------
  let deferredPrompt = null;
  const installBtn = $('#installBtn');
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; installBtn.classList.remove('hidden'); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; installBtn.classList.add('hidden'); });
  if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) installBtn.classList.remove('hidden');
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(() => null); deferredPrompt = null; installBtn.classList.add('hidden'); }
    else toast(t('iosInstall'));
  });

  if ('serviceWorker' in navigator && (IS_HTTPS || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    let wantReload = false; // reload only when the user accepted an update (not on first install's clients.claim)
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (wantReload) { wantReload = false; location.reload(); } });
    navigator.serviceWorker.register('sw.js').then(reg => {
      const offer = w => toast(t('update'), { label: t('reload'), run: () => { wantReload = true; w.postMessage('SKIP_WAITING'); } });
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); });
      });
    }).catch(() => { /* SW unavailable — app still works online */ });
  }
  window.addEventListener('offline', () => toast(t('offline')));
  window.addEventListener('online', () => toast(t('online')));

  // ---------- start ----------
  applyLang();
  route();
})();
