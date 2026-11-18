/* Radio World — installable PWA. © 2026 Radio World. All rights reserved. See LICENSE.
   Station directory: radio-browser.info (public domain data). */
'use strict';
(() => {
  const APP_VERSION = '2.0.0';
  const API_HOSTS = ['de1.api.radio-browser.info', 'de2.api.radio-browser.info', 'all.api.radio-browser.info'];
  const DATA_CACHE = 'rw-data-v1';
  const PAGE = 120;
  const IS_HTTPS = location.protocol === 'https:';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SLEEP_STEPS = [0, 15, 30, 45, 60, 90];

  // ---------- storage ----------
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('rw.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('rw.' + k, JSON.stringify(v)); } catch (e) { /* quota / private mode */ } },
  };

  // ---------- i18n ----------
  const STR = {
    bg: {
      install: 'Инсталирай', favorites: 'Любими', about: 'За приложението', langName: 'EN',
      livePill: n => `На живо от ${n} държави`, heroA: 'Настрой се на', heroB: 'планетата.',
      lead: (s, c) => `${s} радиостанции от ${c} държави — на живо и без регистрация. Инсталирай го като приложение и слушай навсякъде.`,
      listenNow: 'Слушай сега', resume: 'Продължи', surprise: 'Изненадай ме', statStations: 'станции', statCountries: 'държави', statOffline: 'работи офлайн',
      globeHint: 'Завърти глобуса · докосни сигнал', installTitle: 'Инсталирай Radio World',
      installText: 'Отваря се от началния екран като истинско приложение — на цял екран, бързо и без браузър.', installed: 'Radio World е инсталирано. ✨',
      installIOS: ['Натисни бутона „Сподели“ в Safari (квадрат със стрелка нагоре).', 'Избери „Добави към началния екран“.', 'Натисни „Добави“ — иконата ще се появи на екрана.'],
      installAndroid: ['Отвори менюто ⋮ горе вдясно в Chrome.', 'Избери „Инсталиране на приложение“ или „Добавяне към началния екран“.', 'Потвърди с „Инсталиране“.'],
      installDesktop: ['Потърси иконата за инсталиране вдясно в адресната лента (Chrome или Edge).', 'Натисни „Инсталиране“.', 'Radio World ще се отваря като отделно приложение.'],
      installMacSafari: ['В Safari отвори менюто „Файл“.', 'Избери „Добави в Dock“.', 'Потвърди с „Добави“.'],
      installFirefox: ['Firefox на компютър не инсталира уеб приложения.', 'Отвори този адрес в Chrome или Edge.', 'После натисни иконата за инсталиране в адресната лента.'],
      countries: 'Държави', exploreKicker: 'Открий', nCountries: n => `${n} държави`, nStations: n => `${n} станции`,
      sortDefault: 'Препоръчани', sortName: 'Име А–Я', sortStations: 'Най-много станции', recent: 'Последно слушани',
      searchCountries: 'Търси държава или код…', searchStations: 'Търси станция или жанр…',
      sortPopular: 'Най-слушани', sortVotes: 'Най-харесвани', sortBitrate: 'Най-високо качество', onlyFav: 'Само любими', onlyHttps: 'Само HTTPS',
      noCountries: 'Няма намерени държави.', noStations: 'Няма намерени станции.', loading: 'Зареждане…',
      favTitle: 'Любими станции', favEmpty: 'Още нямаш любими. Натисни ♥ до станция, за да я добавиш.',
      pick: 'Избери станция', connecting: 'Свързване…', live: 'На живо', paused: 'Пауза',
      error: 'Станцията не отговаря', errorHttp: 'Само HTTP — блокирана през HTTPS',
      srcLive: 'Актуален списък от radio-browser.info', srcCache: d => `Офлайн копие от ${d}`, srcSnapshot: d => `Вграден списък от ${d}`,
      offline: 'Няма интернет — радиото изисква връзка.', online: 'Връзката е възстановена.', update: 'Има нова версия.', reload: 'Обнови',
      themeAuto: 'Тема: системна', themeLight: 'Тема: светла', themeDark: 'Тема: тъмна',
      play: 'Пусни', pause: 'Пауза', prev: 'Предишна', next: 'Следваща', addFav: 'Добави в любими', removeFav: 'Махни от любими',
      back: 'Назад', volume: 'Сила на звука', notFound: 'Няма такава държава.', close: 'Затвори',
      httpNote: 'Станциите с етикет HTTP може да не тръгнат, когато приложението е отворено през HTTPS.',
      nowPlaying: 'Сега свири', sleep: 'Таймер за сън', off: 'Изкл.', min: 'мин', sleepSet: n => `Радиото ще спре след ${n} мин.`, sleepOff: 'Таймерът за сън е изключен.',
      sleepDone: 'Таймерът за сън спря радиото. Лека нощ 🌙', share: 'Сподели', copied: 'Връзката е копирана.', surpriseFrom: (n, c) => `Изненада: ${n} · ${c}`,
      aboutTitle: 'За Radio World', aboutLead: 'Радио от целия свят в едно бързо, красиво и инсталируемо приложение.',
      license: 'Лиценз', licenseText: '© 2026 Radio World. Всички права запазени. Кодът, дизайнът, иконата и визуалните елементи на Radio World не може да се копират, променят или разпространяват без писмено разрешение, освен доколкото го позволяват приложимото право или Условията за ползване на GitHub.',
      thirdParty: 'Чужди компоненти и данни', fullLicense: 'Пълен текст на лиценза', notices: 'Всички бележки за чужди компоненти',
      disclaimer: 'Radio World не е свързан с radio-browser.info или с радиостанциите. Потоците, имената и логата принадлежат на съответните им собственици.',
      version: 'Версия', rights: 'Всички права запазени',
    },
    en: {
      install: 'Install', favorites: 'Favorites', about: 'About', langName: 'БГ',
      livePill: n => `Live from ${n} countries`, heroA: 'Tune in to', heroB: 'the planet.',
      lead: (s, c) => `${s} radio stations from ${c} countries — live, no sign-up. Install it as an app and listen anywhere.`,
      listenNow: 'Listen now', resume: 'Resume', surprise: 'Surprise me', statStations: 'stations', statCountries: 'countries', statOffline: 'works offline',
      globeHint: 'Spin the globe · tap a signal', installTitle: 'Install Radio World',
      installText: 'Opens from your home screen like a real app — full screen, fast, no browser.', installed: 'Radio World is installed. ✨',
      installIOS: ['Tap the Share button in Safari (square with an up arrow).', 'Choose “Add to Home Screen”.', 'Tap “Add” — the icon appears on your screen.'],
      installAndroid: ['Open the ⋮ menu in Chrome (top right).', 'Choose “Install app” or “Add to Home screen”.', 'Confirm with “Install”.'],
      installDesktop: ['Find the install icon at the right of the address bar (Chrome or Edge).', 'Click “Install”.', 'Radio World opens as its own app.'],
      installMacSafari: ['In Safari open the “File” menu.', 'Choose “Add to Dock”.', 'Confirm with “Add”.'],
      installFirefox: ['Desktop Firefox does not install web apps.', 'Open this address in Chrome or Edge.', 'Then click the install icon in the address bar.'],
      countries: 'Countries', exploreKicker: 'Explore', nCountries: n => `${n} countries`, nStations: n => `${n} stations`,
      sortDefault: 'Recommended', sortName: 'Name A–Z', sortStations: 'Most stations', recent: 'Recently played',
      searchCountries: 'Search country or code…', searchStations: 'Search station or genre…',
      sortPopular: 'Most played', sortVotes: 'Most liked', sortBitrate: 'Highest quality', onlyFav: 'Favorites only', onlyHttps: 'HTTPS only',
      noCountries: 'No countries found.', noStations: 'No stations found.', loading: 'Loading…',
      favTitle: 'Favorite stations', favEmpty: 'No favorites yet. Tap ♥ next to a station to add it.',
      pick: 'Pick a station', connecting: 'Connecting…', live: 'Live', paused: 'Paused',
      error: 'Station not responding', errorHttp: 'HTTP only — blocked over HTTPS',
      srcLive: 'Live list from radio-browser.info', srcCache: d => `Offline copy from ${d}`, srcSnapshot: d => `Built-in list from ${d}`,
      offline: 'No internet — radio needs a connection.', online: 'Back online.', update: 'A new version is available.', reload: 'Reload',
      themeAuto: 'Theme: system', themeLight: 'Theme: light', themeDark: 'Theme: dark',
      play: 'Play', pause: 'Pause', prev: 'Previous', next: 'Next', addFav: 'Add to favorites', removeFav: 'Remove from favorites',
      back: 'Back', volume: 'Volume', notFound: 'No such country.', close: 'Close',
      httpNote: 'Stations marked HTTP may not play when the app is opened over HTTPS.',
      nowPlaying: 'Now playing', sleep: 'Sleep timer', off: 'Off', min: 'min', sleepSet: n => `Radio stops in ${n} min.`, sleepOff: 'Sleep timer off.',
      sleepDone: 'Sleep timer stopped the radio. Good night 🌙', share: 'Share', copied: 'Link copied.', surpriseFrom: (n, c) => `Surprise: ${n} · ${c}`,
      aboutTitle: 'About Radio World', aboutLead: 'Radio from all over the world in one fast, beautiful, installable app.',
      license: 'License', licenseText: '© 2026 Radio World. All rights reserved. The code, design, icon and visual elements of Radio World may not be copied, modified or distributed without written permission, except as permitted by applicable law or GitHub’s Terms of Service.',
      thirdParty: 'Third-party components and data', fullLicense: 'Full license text', notices: 'All third-party notices',
      disclaimer: 'Radio World is not affiliated with radio-browser.info or the radio stations. Streams, names and logos belong to their respective owners.',
      version: 'Version', rights: 'All rights reserved',
    },
  };
  let lang = LS.get('lang', (navigator.language || '').toLowerCase().startsWith('bg') ? 'bg' : 'en');
  const t = (k, ...a) => { const v = (STR[lang] || STR.en)[k]; return typeof v === 'function' ? v(...a) : (v ?? k); };
  let regionNames = null;
  const countryName = cc => { try { regionNames = regionNames || new Intl.DisplayNames([lang], { type: 'region' }); return regionNames.of(cc) || cc; } catch (e) { return cc; } };
  const fmtNum = n => new Intl.NumberFormat(lang === 'bg' ? 'bg-BG' : 'en-US').format(n);
  const HOME_CC = ((navigator.language || '').split('-')[1] || '').toUpperCase();

  // ---------- helpers ----------
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => (/^https?:\/\//i.test(u || '') ? u : '');
  const upgrade = u => (IS_HTTPS && /^http:\/\//i.test(u || '') ? 'https://' + u.slice(7) : u);
  const fmtDate = iso => { try { return new Date(iso).toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }); } catch (e) { return iso; } };
  const norm = s => String(s || '').toLocaleLowerCase();
  const PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ff3d8b"/><stop offset=".55" stop-color="#7b2ff7"/><stop offset="1" stop-color="#3dd9ff"/></linearGradient></defs>' +
    '<rect width="96" height="96" rx="22" fill="url(#g)" opacity=".9"/><g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M34 34a20 20 0 0 0 0 28M62 34a20 20 0 0 1 0 28"/><path d="M24 24a34 34 0 0 0 0 48M72 24a34 34 0 0 1 0 48" opacity=".55"/></g><circle cx="48" cy="48" r="7" fill="#fff"/></svg>');
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
    if (!action) toastTimer = setTimeout(() => el.classList.add('hidden'), 3800);
  }

  // ---------- theme ----------
  const THEMES = ['auto', 'light', 'dark'];
  let theme = LS.get('theme', 'auto');
  let globe = null;
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    const btn = $('#themeBtn');
    btn.innerHTML = icon(theme === 'light' ? 'i-sun' : theme === 'dark' ? 'i-moon' : 'i-auto');
    const label = t(theme === 'light' ? 'themeLight' : theme === 'dark' ? 'themeDark' : 'themeAuto');
    btn.title = label; btn.setAttribute('aria-label', label);
    requestAnimationFrame(() => {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      $('meta[name="theme-color"]').setAttribute('content', bg || '#08070f');
      if (globe) globe.readTheme();
    });
  }
  $('#themeBtn').addEventListener('click', () => { theme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]; LS.set('theme', theme); applyTheme(); toast($('#themeBtn').title); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => theme === 'auto' && applyTheme());

  // ---------- language ----------
  function applyLang() {
    document.documentElement.lang = lang;
    regionNames = null;
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('#langBtn').textContent = t('langName');
    $('#langBtn').title = lang === 'bg' ? 'English' : 'Български';
    $('#favLink').setAttribute('aria-label', t('favorites'));
    $('#aboutLink').setAttribute('aria-label', t('about')); $('#aboutLink').title = t('about');
    $$('[data-act="prev"]').forEach(b => b.setAttribute('aria-label', t('prev')));
    $$('[data-act="next"]').forEach(b => b.setAttribute('aria-label', t('next')));
    $$('.volRange').forEach(b => b.setAttribute('aria-label', t('volume')));
    $('#npClose').setAttribute('aria-label', t('close')); $('#npShare').setAttribute('aria-label', t('share'));
    $('#sleepBtn').setAttribute('aria-label', t('sleep')); $('#sleepBtn').title = t('sleep');
    $('#installSheet [data-close]').setAttribute('aria-label', t('close'));
    applyTheme(); renderSleepSeg(); updatePlayerUI();
  }
  $('#langBtn').addEventListener('click', () => { lang = lang === 'bg' ? 'en' : 'bg'; LS.set('lang', lang); applyLang(); route(); });

  // ---------- data ----------
  let countriesData = null, globeData = null;
  const stationMem = new Map();
  async function getCountries() {
    if (!countriesData) countriesData = await (await fetch('data/countries.json')).json();
    return countriesData;
  }
  async function getGlobeData() {
    if (!globeData) globeData = await (await fetch('data/globe.json')).json();
    return globeData;
  }
  const countsFor = data => { const o = LS.get('counts', {}); return data.countries.map(c => ({ cc: c.c, n: o[c.c] ?? c.n })); };
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
    if (!res) return { list: [], source: 'none', date: '' };
    stationMem.set(cc, res);
    const counts = LS.get('counts', {}); counts[cc] = res.list.length; LS.set('counts', counts);
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
    $$(`[data-fav="${CSS.escape(st.i)}"]`).forEach(b => setFavBtn(b, isFav(st.i)));
    updatePlayerUI();
  }
  function setFavBtn(b, on) {
    b.classList.toggle('on', on);
    b.innerHTML = icon(on ? 'i-heart-fill' : 'i-heart');
    b.setAttribute('aria-label', t(on ? 'removeFav' : 'addFav'));
    b.setAttribute('aria-pressed', String(on));
  }
  function addRecent(st) { recent = [{ ...st }, ...recent.filter(s => s.i !== st.i)].slice(0, 12); LS.set('recent', recent); }

  // ---------- player ----------
  const audio = $('#audio');
  let current = LS.get('last', null);
  let queue = current ? [current] : [];
  let hls = null, playToken = 0, state = 'idle', hlsLib = null;

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
    if (globe && st.cc) globe.setActive(st.cc);
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
    if (!current) { listenNow(); return; }
    if (state === 'live' || state === 'connecting') pause(); else play(current); // live radio: reconnect instead of resuming a stale buffer
  }
  function step(d) {
    if (!queue.length || !current) return;
    const idx = queue.findIndex(s => s.i === current.i);
    play(queue[(idx + d + queue.length) % queue.length]);
  }
  const preferPlayable = list => { if (!IS_HTTPS) return list; const ok = list.filter(s => /^https:/i.test(s.u)); return ok.length ? ok : list; };
  async function listenNow() {
    if (current) return play(current);
    const data = await getCountries();
    const counts = countsFor(data);
    const cc = counts.some(c => c.cc === HOME_CC && c.n > 0) ? HOME_CC : counts.slice().sort((a, b) => b.n - a.n)[0].cc;
    const res = await loadStations(cc);
    const list = preferPlayable(res.list).map(s => ({ ...s, cc }));
    if (list.length) play(list[0], list);
  }
  async function surprise(tries = 0) {
    const data = await getCountries();
    const pool = countsFor(data).filter(c => c.n >= 5);
    const total = pool.reduce((a, c) => a + Math.sqrt(c.n), 0);
    let r = Math.random() * total, cc = pool[0].cc;
    for (const c of pool) { r -= Math.sqrt(c.n); if (r <= 0) { cc = c.cc; break; } }
    const res = await loadStations(cc);
    const list = preferPlayable(res.list).map(s => ({ ...s, cc }));
    if (!list.length) { if (tries < 4) surprise(tries + 1); return; }
    const top = list.slice(0, Math.min(30, list.length));
    const st = top[Math.floor(Math.random() * top.length)];
    play(st, list);
    toast(t('surpriseFrom', st.n, countryName(cc)));
  }

  audio.addEventListener('playing', () => setState('live'));
  audio.addEventListener('waiting', () => state !== 'paused' && state !== 'error' && setState('connecting'));
  audio.addEventListener('error', () => { if (audio.getAttribute('src') && state !== 'paused') setState('error'); });

  function statusText() {
    if (!current) return '';
    return state === 'live' ? t('live') : state === 'connecting' ? t('connecting') : state === 'error'
      ? (IS_HTTPS && /^http:\/\//i.test(current.u) ? t('errorHttp') : t('error')) : t('paused');
  }
  function updatePlayerUI() {
    const playing = state === 'live' || state === 'connecting';
    $$('[data-act="toggle"]').forEach(pb => { pb.innerHTML = icon(playing ? 'i-pause' : 'i-play'); pb.setAttribute('aria-label', t(playing ? 'pause' : 'play')); });
    $('#pName').textContent = current ? current.n : t('pick');
    const src = current ? (safeUrl(upgrade(current.f)) || PLACEHOLDER) : PLACEHOLDER;
    for (const img of [$('#pLogo'), $('#npLogo')]) if (img.getAttribute('src') !== src) { img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; }; img.src = src; }
    const dot = $('#pDot'); dot.className = (current ? '' : 'hidden ') + 'dot' + (state === 'connecting' ? ' wait' : state === 'error' ? ' err' : '');
    const where = current && current.cc ? countryName(current.cc) : '';
    $('#pStatus').textContent = [statusText(), where].filter(Boolean).join(' · ');
    $('#player').classList.toggle('is-live', state === 'live');
    $('#np').classList.toggle('is-live', state === 'live');
    $$('[data-act="fav"]').forEach(fb => { fb.disabled = !current; fb.dataset.fav = current ? current.i : ''; setFavBtn(fb, !!current && isFav(current.i)); });
    $$('[data-act="prev"], [data-act="next"]').forEach(b => { b.disabled = queue.length < 2; });
    document.title = current && playing ? `${current.n} · Radio World` : 'Radio World — ' + (lang === 'bg' ? 'радио от целия свят' : 'radio from around the world');
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : current ? 'paused' : 'none';
    // now-playing sheet
    $('#npName').textContent = current ? current.n : t('pick');
    $('#npStatus').textContent = statusText();
    const npc = $('#npCountry');
    if (current && current.cc) { npc.innerHTML = `${flagTag(current.cc, 'flag mini')} ${esc(countryName(current.cc))}`; npc.href = `#/c/${current.cc.toLowerCase()}`; } else npc.textContent = '';
    $('#npTags').innerHTML = current ? [current.c, current.b ? `${current.b} kbps` : '', ...(current.t || [])].filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('') : '';
    const art = current ? safeUrl(upgrade(current.f)) : '';
    $('#npBg').style.backgroundImage = art ? `url("${art.replace(/["\\]/g, encodeURIComponent)}")` : 'none';
    markCurrent();
  }
  function updateMediaSession() {
    if (!('mediaSession' in navigator) || !current || !window.MediaMetadata) return;
    const art = safeUrl(upgrade(current.f));
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.n, artist: current.cc ? countryName(current.cc) : 'Radio World', album: 'Radio World',
      artwork: [...(art ? [{ src: art, sizes: '256x256' }] : []), { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
    });
  }
  if ('mediaSession' in navigator) {
    const set = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch (e) { /* unsupported */ } };
    set('play', () => play(current)); set('pause', pause); set('stop', pause);
    set('previoustrack', () => step(-1)); set('nexttrack', () => step(1));
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a === 'toggle') togglePlay(); else if (a === 'prev') step(-1); else if (a === 'next') step(1); else if (a === 'fav') toggleFav(current);
  });
  const vols = $$('.volRange');
  const v0 = LS.get('vol', 80); audio.volume = v0 / 100; vols.forEach(v => { v.value = v0; });
  vols.forEach(v => v.addEventListener('input', () => { audio.volume = v.value / 100; LS.set('vol', +v.value); vols.forEach(o => { if (o !== v) o.value = v.value; }); }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!$('#np').classList.contains('hidden')) closeNP(); else if (!$('#installSheet').classList.contains('hidden')) closeInstall(); return; }
    if (e.code !== 'Space' || /^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(e.target.tagName) || e.target.getAttribute('role') === 'button') return;
    e.preventDefault(); togglePlay();
  });
  function markCurrent() {
    $$('.st.current').forEach(el => el.classList.remove('current', 'playing'));
    if (current) $$(`.st[data-id="${CSS.escape(current.i)}"]`).forEach(el => { el.classList.add('current'); el.classList.toggle('playing', state === 'live'); });
  }

  // ---------- sleep timer ----------
  let sleepEnd = 0, sleepTimer = 0, sleepFading = false;
  const sleepLeft = () => (sleepEnd ? Math.max(0, Math.ceil((sleepEnd - Date.now()) / 60000)) : 0);
  function setSleep(min) {
    clearInterval(sleepTimer); sleepEnd = min ? Date.now() + min * 60000 : 0;
    if (min) sleepTimer = setInterval(sleepTick, 5000);
    toast(min ? t('sleepSet', min) : t('sleepOff'));
    renderSleepSeg(); sleepTick();
  }
  function sleepTick() {
    const left = sleepLeft();
    $('#sleepBtn').classList.toggle('on', !!sleepEnd); $('#sleepBadge').textContent = sleepEnd ? String(left) : '';
    if (sleepEnd && Date.now() >= sleepEnd && !sleepFading) {
      sleepFading = true; clearInterval(sleepTimer);
      const startVol = audio.volume; let k = 0;
      const fade = setInterval(() => {
        k++; audio.volume = Math.max(0, startVol * (1 - k / 40));
        if (k >= 40) { clearInterval(fade); pause(); audio.volume = startVol; sleepEnd = 0; sleepFading = false; sleepTick(); renderSleepSeg(); toast(t('sleepDone')); }
      }, 200);
    }
  }
  function renderSleepSeg() {
    const left = sleepLeft();
    const cur = sleepEnd ? SLEEP_STEPS.slice(1).reduce((best, m) => (Math.abs(m - left) < Math.abs(best - left) ? m : best), 15) : 0;
    $('#sleepSeg').innerHTML = SLEEP_STEPS.map(m => `<button type="button" data-min="${m}" aria-pressed="${m === cur}">${m ? `${m} ${esc(t('min'))}` : esc(t('off'))}</button>`).join('');
  }
  $('#sleepSeg').addEventListener('click', e => { const b = e.target.closest('[data-min]'); if (b) setSleep(+b.dataset.min); });
  $('#sleepBtn').addEventListener('click', () => {
    const left = sleepLeft(); const nextStep = SLEEP_STEPS.find(m => m > left) ?? 0; setSleep(sleepEnd ? nextStep : 15);
  });

  // ---------- now playing sheet + visualizer ----------
  let vizRaf = 0, lastFocus = null;
  function openNP() {
    if (!current) return;
    lastFocus = document.activeElement;
    $('#np').classList.remove('hidden'); document.body.style.overflow = 'hidden';
    history.pushState({ np: 1 }, '');
    $('#npClose').focus(); updatePlayerUI(); startViz();
  }
  function closeNP(fromPop) {
    if ($('#np').classList.contains('hidden')) return;
    $('#np').classList.add('hidden'); document.body.style.overflow = '';
    cancelAnimationFrame(vizRaf); vizRaf = 0;
    if (!fromPop && history.state && history.state.np) history.back();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  window.addEventListener('popstate', () => closeNP(true));
  $('#pInfo').addEventListener('click', openNP);
  $('#npClose').addEventListener('click', () => closeNP());
  $('#npCountry').addEventListener('click', () => closeNP(true));
  $('#npShare').addEventListener('click', async () => {
    if (!current) return;
    const url = location.origin + location.pathname + (current.cc ? `#/c/${current.cc.toLowerCase()}` : '');
    const data = { title: `${current.n} · Radio World`, text: `${current.n} — ${current.cc ? countryName(current.cc) : ''}`, url };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(url); toast(t('copied')); } } catch (e) { /* cancelled */ }
  });
  function startViz() {
    const c = $('#npViz'), ctx = c.getContext('2d');
    const dpr = Math.min(2, devicePixelRatio || 1);
    const draw = now => {
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const n = 44, gap = 3, bw = (w - gap * (n - 1)) / n, live = state === 'live', tt = now / 1000;
      const g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#ff3d8b'); g.addColorStop(.55, '#7b2ff7'); g.addColorStop(1, '#3dd9ff');
      ctx.fillStyle = g; ctx.globalAlpha = .85;
      for (let i = 0; i < n; i++) {
        const x = i / n, env = Math.sin(Math.PI * x) * .8 + .2;
        const wave = live && !REDUCED ? (Math.sin(tt * 3.1 + i * .55) * .5 + .5) * .55 + (Math.sin(tt * 7.3 + i * 1.7) * .5 + .5) * .3 + (Math.sin(tt * 1.3 - i * .3) * .5 + .5) * .15 : .08;
        const bh = Math.max(3, h * env * wave);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(i * (bw + gap), (h - bh) / 2, bw, bh, bw / 2); else ctx.rect(i * (bw + gap), (h - bh) / 2, bw, bh);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!$('#np').classList.contains('hidden')) vizRaf = requestAnimationFrame(draw);
    };
    cancelAnimationFrame(vizRaf); vizRaf = requestAnimationFrame(draw);
  }

  // ---------- install ----------
  let deferredPrompt = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ua = navigator.userAgent;
  const platform = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) ? 'ios'
    : /android/i.test(ua) ? 'android' : /firefox/i.test(ua) ? 'firefox' : /safari/i.test(ua) && !/chrome|chromium|edg/i.test(ua) ? 'macSafari' : 'desktop';
  function syncInstallUI() {
    const show = !standalone();
    $('#installBtn').classList.toggle('hidden', !(show && deferredPrompt));
    $$('.install-card').forEach(c => c.classList.toggle('hidden', !show));
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; syncInstallUI(); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; syncInstallUI(); closeInstall(); toast(t('installed')); });
  async function doInstall() {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(() => null); deferredPrompt = null; syncInstallUI(); return; }
    const steps = { ios: 'installIOS', android: 'installAndroid', firefox: 'installFirefox', macSafari: 'installMacSafari', desktop: 'installDesktop' }[platform];
    $('#installTitle').textContent = t('installTitle'); $('#installText').textContent = t('installText');
    $('#installSteps').innerHTML = t(steps).map(s => `<li>${esc(s)}</li>`).join('');
    $('#installSheet').classList.remove('hidden'); $('#installSheet [data-close]').focus();
  }
  function closeInstall() { $('#installSheet').classList.add('hidden'); }
  $('#installBtn').addEventListener('click', doInstall);
  $('#installSheet').addEventListener('click', e => { if (e.target.id === 'installSheet' || e.target.closest('[data-close]')) closeInstall(); });

  // ---------- views ----------
  const view = $('#view');
  let observer = null;
  const footer = () => `<footer class="site-foot"><span>© 2026 Radio World · ${esc(t('rights'))}</span><span><a href="#/about">${esc(t('about'))}</a> · <a href="https://www.radio-browser.info/" target="_blank" rel="noopener">radio-browser.info</a> · v${APP_VERSION}</span></footer>`;
  const signal = n => { const lv = n >= 600 ? 4 : n >= 150 ? 3 : n >= 30 ? 2 : n >= 1 ? 1 : 0; return `<span class="bars" aria-hidden="true">${[1, 2, 3, 4].map(i => `<i class="${i <= lv ? 'on' : ''}"></i>`).join('')}</span>`; };

  function stationRow(st, showFlag, rank) {
    const meta = [st.c, st.b ? `${st.b} kbps` : '', ...(st.t || []).slice(0, 2)].filter(Boolean).join(' · ');
    const http = IS_HTTPS && /^http:\/\//i.test(st.u) ? '<span class="badge">HTTP</span>' : '';
    const fav = isFav(st.i);
    return `<div class="st" role="button" tabindex="0" data-id="${esc(st.i)}">
      ${rank ? `<span class="rank">${rank}</span>` : ''}
      <span class="logo-wrap">${logoTag(st.f)}<span class="eq"><i></i><i></i><i></i><i></i></span></span>
      <div class="s-text"><div class="s-name">${showFlag && st.cc ? flagTag(st.cc, 'flag mini') + ' ' : ''}${esc(st.n)}${http}</div><div class="s-meta">${esc(meta)}</div></div>
      <button class="fav-btn${fav ? ' on' : ''}" type="button" data-fav="${esc(st.i)}" aria-pressed="${fav}" aria-label="${esc(t(fav ? 'removeFav' : 'addFav'))}">${icon(fav ? 'i-heart-fill' : 'i-heart')}</button>
    </div>`;
  }
  function mountList(container, items, showFlag, ranked) {
    if (observer) { observer.disconnect(); observer = null; }
    container.innerHTML = '';
    if (!items.length) { container.innerHTML = `<div class="empty">${esc(t('noStations'))}</div>`; return; }
    let shown = 0;
    const sentinel = document.createElement('div'); sentinel.className = 'sentinel';
    const more = () => {
      const chunk = items.slice(shown, shown + PAGE);
      sentinel.remove();
      container.insertAdjacentHTML('beforeend', chunk.map((s, j) => stationRow(s, showFlag, ranked ? shown + j + 1 : 0)).join(''));
      shown += chunk.length;
      if (shown < items.length) container.append(sentinel);
      markCurrent();
    };
    more();
    if (shown < items.length && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) more(); }, { rootMargin: '700px' });
      observer.observe(sentinel);
    }
    const byId = id => items.find(s => s.i === id);
    container.onclick = e => {
      const fb = e.target.closest('.fav-btn'); const row = e.target.closest('.st');
      if (!row) return;
      const st = byId(row.dataset.id);
      if (fb) { e.stopPropagation(); toggleFav(st); return; }
      if (current && st && current.i === st.i && (state === 'live' || state === 'connecting')) { openNP(); return; }
      play(st, items);
    };
    container.onkeydown = e => {
      const row = e.target.closest('.st');
      if (row && e.target === row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); play(byId(row.dataset.id), items); }
    };
  }

  async function renderHome() {
    const data = await getCountries();
    const counts = countsFor(data);
    const totalStations = counts.reduce((a, c) => a + c.n, 0);
    const nCountries = counts.length;
    const resumeName = current ? (current.n.length > 22 ? current.n.slice(0, 21) + '…' : current.n) : '';
    view.innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <span class="live-pill"><span class="pulse"></span>${esc(t('livePill', nCountries))}</span>
          <h1>${esc(t('heroA'))}<br><span class="grad-text">${esc(t('heroB'))}</span></h1>
          <p class="lead">${esc(t('lead', fmtNum(totalStations), nCountries))}</p>
          <div class="cta-row">
            <button class="btn primary" id="listenNow" type="button"><span class="ic">${icon('i-play')}</span>${esc(current ? `${t('resume')}: ${resumeName}` : t('listenNow'))}</button>
            <button class="btn" id="surpriseBtn" type="button">${icon('i-dice')} ${esc(t('surprise'))}</button>
          </div>
          <div class="stats">
            <div class="stat"><b>${fmtNum(totalStations)}</b><span>${esc(t('statStations'))}</span></div>
            <div class="stat"><b>${nCountries}</b><span>${esc(t('statCountries'))}</span></div>
            <div class="stat"><b>PWA</b><span>${esc(t('statOffline'))}</span></div>
          </div>
        </div>
        <div class="globe-wrap"><span class="orbit"></span><canvas id="globe" role="img" aria-label="${esc(t('globeHint'))}"></canvas><span class="globe-hint">${icon('i-globe')} ${esc(t('globeHint'))}</span></div>
      </section>
      <section class="install-card${standalone() ? ' hidden' : ''}">
        <img src="icons/icon-192.png" alt="" width="72" height="72">
        <div class="txt"><h3>${esc(t('installTitle'))}</h3><p>${esc(t('installText'))}</p></div>
        <button class="btn primary" type="button" id="installCta">${icon('i-download')} ${esc(t('install'))}</button>
      </section>
      <div id="recentWrap"></div>
      <div class="section-head"><div><span class="kicker">${esc(t('exploreKicker'))}</span><h2>${esc(t('countries'))}</h2></div><span class="count" id="cnt"></span></div>
      <div class="toolbar">
        <label class="search">${icon('i-search')}<input id="q" type="search" placeholder="${esc(t('searchCountries'))}" aria-label="${esc(t('searchCountries'))}" autocomplete="off"></label>
        <select id="sort" aria-label="Sort"><option value="default">${esc(t('sortDefault'))}</option><option value="name">${esc(t('sortName'))}</option><option value="stations">${esc(t('sortStations'))}</option></select>
      </div>
      <div class="grid" id="grid"></div>
      <div class="empty hidden" id="none">${esc(t('noCountries'))}</div>
      ${footer()}`;
    $('#listenNow').onclick = listenNow;
    $('#surpriseBtn').onclick = () => surprise();
    $('#installCta').onclick = doInstall;
    if (recent.length) {
      $('#recentWrap').innerHTML = `<div class="section-head"><h2>${esc(t('recent'))}</h2></div><div class="recent" id="recent">${recent.map(s =>
        `<button class="r-card" type="button" data-id="${esc(s.i)}">${logoTag(s.f)}<span class="r-name">${esc(s.n)}</span></button>`).join('')}</div>`;
      $('#recent').onclick = e => { const b = e.target.closest('.r-card'); if (b) play(recent.find(s => s.i === b.dataset.id), recent.slice()); };
    }
    const list = counts.map(c => ({ ...c, name: countryName(c.cc) }));
    const q = $('#q'), sort = $('#sort');
    sort.value = LS.get('csort', 'default');
    const draw = () => {
      const s = norm(q.value.trim());
      const items = list.filter(c => !s || norm(c.name).includes(s) || norm(c.cc).includes(s));
      if (sort.value === 'stations') items.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, lang));
      else if (sort.value === 'name') items.sort((a, b) => a.name.localeCompare(b.name, lang));
      else items.sort((a, b) => (b.cc === HOME_CC) - (a.cc === HOME_CC) || (b.n >= 100) - (a.n >= 100) || a.name.localeCompare(b.name, lang));
      $('#grid').innerHTML = items.map(c => `<a class="country" href="#/c/${esc(c.cc.toLowerCase())}">${flagTag(c.cc)}
        <span class="c-text"><span class="c-name">${esc(c.name)}</span><span class="c-meta"><span class="cc">${esc(c.cc)} · </span>${esc(t('nStations', fmtNum(c.n)))}</span></span>${signal(c.n)}</a>`).join('');
      $('#cnt').textContent = t('nCountries', items.length);
      $('#none').classList.toggle('hidden', items.length > 0);
    };
    q.addEventListener('input', draw);
    sort.addEventListener('change', () => { LS.set('csort', sort.value); draw(); });
    draw();
    // globe
    try {
      const gd = await getGlobeData();
      if (!window.RadioGlobe || !$('#globe')) return;
      const byCount = counts.filter(c => gd.centres[c.cc]).sort((a, b) => b.n - a.n);
      const pickSet = new Set(byCount.filter(c => c.n >= 40).slice(0, 40).map(c => c.cc));
      if (gd.centres[HOME_CC]) pickSet.add(HOME_CC);
      if (current && current.cc && gd.centres[current.cc]) pickSet.add(current.cc);
      const maxLog = Math.log(1 + (byCount[0] ? byCount[0].n : 1));
      const hubs = byCount.filter(c => pickSet.has(c.cc)).map(c => ({ cc: c.cc, n: c.n, lat: gd.centres[c.cc][0], lon: gd.centres[c.cc][1], w: Math.log(1 + c.n) / maxLog }));
      globe = new window.RadioGlobe($('#globe'), {
        dots: gd.dots, hubs,
        label: h => `${countryName(h.cc)} · ${t('nStations', fmtNum(h.n))}`,
        onPick: cc => { location.hash = `#/c/${cc.toLowerCase()}`; },
      });
      const focusCc = current && current.cc && gd.centres[current.cc] ? current.cc : gd.centres[HOME_CC] ? HOME_CC : null;
      if (focusCc) { const [la, lo] = gd.centres[focusCc]; globe.focus(la, lo); if (current && current.cc === focusCc) globe.active = focusCc; }
    } catch (e) { /* globe is decorative */ }
  }

  async function renderCountry(cc) {
    const data = await getCountries();
    if (!data.countries.some(c => c.c === cc)) { view.innerHTML = `<p class="empty">${esc(t('notFound'))}</p>`; return; }
    view.innerHTML = `
      <div class="page-head">
        <a class="back" href="#/" aria-label="${esc(t('back'))}">${icon('i-back')}</a>
        ${flagTag(cc)}
        <div><h1>${esc(countryName(cc))}</h1><div class="count" id="cnt">${esc(t('loading'))}</div></div>
      </div>
      <div class="toolbar">
        <label class="search">${icon('i-search')}<input id="q" type="search" placeholder="${esc(t('searchStations'))}" aria-label="${esc(t('searchStations'))}" autocomplete="off"></label>
        <select id="sort" aria-label="Sort"><option value="popular">${esc(t('sortPopular'))}</option><option value="votes">${esc(t('sortVotes'))}</option><option value="name">${esc(t('sortName'))}</option><option value="bitrate">${esc(t('sortBitrate'))}</option></select>
        <button class="chip" id="onlyFav" type="button" aria-pressed="false">${icon('i-heart')} ${esc(t('onlyFav'))}</button>
        ${IS_HTTPS ? `<button class="chip" id="onlyHttps" type="button" aria-pressed="false">${icon('i-lock')} ${esc(t('onlyHttps'))}</button>` : ''}
      </div>
      <div class="list" id="list"><div class="empty">${esc(t('loading'))}</div></div>
      <p class="note" id="src"></p>
      ${IS_HTTPS ? `<p class="note">${esc(t('httpNote'))}</p>` : ''}
      ${footer()}`;
    const res = await loadStations(cc);
    if (location.hash.toLowerCase() !== `#/c/${cc.toLowerCase()}`) return;
    const all = res.list.map(s => ({ ...s, cc }));
    $('#src').textContent = res.source === 'live' ? t('srcLive') : res.source === 'cache' ? t('srcCache', fmtDate(res.date))
      : res.source === 'snapshot' ? t('srcSnapshot', fmtDate(res.date)) : t('offline');
    const q = $('#q'), sort = $('#sort'), favBtn = $('#onlyFav'), httpsBtn = $('#onlyHttps');
    sort.value = LS.get('ssort', 'popular');
    let onlyFav = false, onlyHttps = !!(httpsBtn && LS.get('onlyHttps', false));
    if (httpsBtn) httpsBtn.setAttribute('aria-pressed', String(onlyHttps));
    const draw = () => {
      const s = norm(q.value.trim());
      const items = all.filter(st => (!s || norm(st.n).includes(s) || (st.t || []).some(x => norm(x).includes(s)))
        && (!onlyFav || isFav(st.i)) && (!onlyHttps || /^https:/i.test(st.u)));
      if (sort.value === 'votes') items.sort((a, b) => b.v - a.v);
      else if (sort.value === 'name') items.sort((a, b) => a.n.localeCompare(b.n, lang));
      else if (sort.value === 'bitrate') items.sort((a, b) => b.b - a.b);
      $('#cnt').textContent = t('nStations', fmtNum(items.length));
      mountList($('#list'), items, false, sort.value === 'popular' && !s);
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
      <div><h1>${esc(t('favTitle'))}</h1><div class="count">${esc(t('nStations', favs.length))}</div></div></div>
      <div class="toolbar"></div>
      ${favs.length ? '<div class="list" id="list"></div>' : `<div class="card empty">${esc(t('favEmpty'))}</div>`}
      ${footer()}`;
    if (favs.length) mountList($('#list'), favs.slice(), true, false);
  }

  function renderAbout() {
    const bg = lang === 'bg';
    const li = (name, what, lic, href) => `<li><b>${esc(name)}</b> — ${esc(what)} · <a href="${esc(href)}" target="_blank" rel="noopener">${esc(lic)}</a></li>`;
    view.innerHTML = `
      <article class="prose">
        <div class="page-head"><a class="back" href="#/" aria-label="${esc(t('back'))}">${icon('i-back')}</a></div>
        <img src="icons/icon-192.png" alt="" width="84" height="84" style="border-radius:20px;box-shadow:0 14px 34px rgba(123,47,247,.4);margin-top:10px">
        <h1>${esc(t('aboutTitle'))}</h1>
        <p>${esc(t('aboutLead'))}</p>
        <p class="count">${esc(t('version'))} ${APP_VERSION}</p>
        <h2>${esc(t('license'))}</h2>
        <div class="card"><p class="legal">${esc(t('licenseText'))}</p><p><a href="LICENSE.txt" target="_blank" rel="noopener">${esc(t('fullLicense'))}</a> · <a href="THIRD_PARTY_NOTICES.txt" target="_blank" rel="noopener">${esc(t('notices'))}</a></p></div>
        <h2>${esc(t('thirdParty'))}</h2>
        <ul>
          ${li('radio-browser.info', bg ? 'каталог на радиостанциите' : 'radio station directory', bg ? 'публично достояние' : 'public domain', 'https://www.radio-browser.info/')}
          ${li('hls.js 1.7.4', bg ? 'възпроизвеждане на HLS потоци' : 'HLS stream playback', 'Apache-2.0', 'vendor/hls.js-LICENSE.txt')}
          ${li('Unbounded', bg ? 'шрифт за заглавия' : 'display typeface', 'SIL OFL 1.1', 'fonts/Unbounded-OFL.txt')}
          ${li('Manrope', bg ? 'шрифт за текст' : 'text typeface', 'SIL OFL 1.1', 'fonts/Manrope-OFL.txt')}
          ${li('Natural Earth · world-atlas', bg ? 'контури на сушата за глобуса' : 'land outlines for the globe', bg ? 'публично достояние / ISC' : 'public domain / ISC', 'https://www.naturalearthdata.com/')}
          ${li('flagcdn.com', bg ? 'изображения на знамената' : 'flag images', 'flagcdn.com', 'https://flagcdn.com/')}
        </ul>
        <p>${esc(t('disclaimer'))}</p>
      </article>
      ${footer()}`;
  }

  async function route() {
    const h = location.hash.replace(/^#\/?/, '');
    if (globe) { globe.destroy(); globe = null; }
    if (observer) { observer.disconnect(); observer = null; }
    window.scrollTo(0, 0);
    const m = h.match(/^c\/([a-z]{2})$/i);
    if (m) await renderCountry(m[1].toUpperCase());
    else if (h === 'favorites') renderFavorites();
    else if (h === 'about') renderAbout();
    else await renderHome();
    $('#favLink').classList.toggle('active', h === 'favorites');
    $('#aboutLink').classList.toggle('active', h === 'about');
    syncInstallUI(); markCurrent();
  }
  window.addEventListener('hashchange', () => { closeNP(true); route(); });

  // ---------- service worker / connectivity ----------
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
