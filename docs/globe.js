/* Radio World — interactive dotted globe (canvas 2D, orthographic projection). © 2026 Radio World. All rights reserved. */
'use strict';
(function () {
  const RAD = Math.PI / 180;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const vec = (lat, lon) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];

  class Globe {
    constructor(canvas, { dots, hubs, onPick, label }) {
      this.c = canvas; this.ctx = canvas.getContext('2d');
      this.onPick = onPick; this.label = label || (h => h.cc);
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.lon = -20; this.phi = 22; this.vLon = 0; this.vPhi = 0;
      this.anim = null; this.active = null; this.hover = null; this.dragging = false;
      this.lastInteract = 0; this.t0 = performance.now(); this.running = false; this.visible = true;
      // land dots → unit vectors
      const n = dots.length / 2; this.pts = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const v = vec(dots[2 * i] / 10, dots[2 * i + 1] / 10); this.pts.set(v, i * 3); }
      this.hubs = hubs.map((h, i) => ({ ...h, v: vec(h.lat, h.lon), phase: (i * 0.37) % 1 }));
      this.arcs = []; this.nextArcs = 0;
      this.readTheme();
      this.resize();
      this.bind();
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(canvas);
      this.io = new IntersectionObserver(es => { this.visible = es.some(e => e.isIntersecting); this.kick(); }); this.io.observe(canvas);
      document.addEventListener('visibilitychange', () => this.kick());
      this.kick();
    }
    readTheme() {
      const cs = getComputedStyle(document.documentElement);
      const g = k => cs.getPropertyValue(k).trim();
      this.col = { dot: g('--globe-dot') || '#b9a8ff', sea: g('--globe-sea') || '#1a1240', rim: g('--globe-rim') || '#7b2ff7',
        hub: g('--accent') || '#ff3d8b', live: g('--accent-3') || '#3dd9ff', arc: g('--accent-2') || '#7b2ff7', text: g('--text') || '#fff', panel: g('--panel-solid') || '#14112a' };
      this.draw(performance.now());
    }
    resize() {
      const r = this.c.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.w = r.width; this.h = r.height; this.c.width = Math.round(r.width * dpr); this.c.height = Math.round(r.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.R = Math.min(this.w, this.h) * 0.43; this.cx = this.w / 2; this.cy = this.h / 2;
      this.draw(performance.now());
    }
    // rotate unit vector by current view, return [x, y, z] (z>0 visible)
    proj(v, lift = 1) {
      const l = this.lon * RAD, p = this.phi * RAD;
      const x0 = v[0] * Math.cos(l) - v[1] * Math.sin(l), y0 = v[0] * Math.sin(l) + v[1] * Math.cos(l), z0 = v[2];
      // view: x right = y0, up = z0 tilted, depth = x0
      const depth = x0 * Math.cos(p) + z0 * Math.sin(p);
      const up = -x0 * Math.sin(p) + z0 * Math.cos(p);
      return [this.cx + y0 * this.R * lift, this.cy - up * this.R * lift, depth];
    }
    focus(lat, lon) {
      const from = { lon: this.lon, phi: this.phi };
      let tl = -lon; while (tl - from.lon > 180) tl -= 360; while (tl - from.lon < -180) tl += 360;
      this.anim = { from, to: { lon: tl, phi: clamp(lat, -40, 50) }, t0: performance.now(), d: this.reduced ? 1 : 1400 };
      this.lastInteract = performance.now(); this.kick();
    }
    setActive(cc) {
      this.active = cc || null;
      const h = this.hubs.find(x => x.cc === cc);
      if (h) this.focus(h.lat, h.lon);
      this.nextArcs = 0; this.kick();
    }
    bind() {
      const c = this.c; let sx = 0, sy = 0, lx = 0, ly = 0, moved = 0, lt = 0;
      c.addEventListener('pointerdown', e => {
        this.dragging = true; this.anim = null; sx = lx = e.clientX; sy = ly = e.clientY; moved = 0; lt = performance.now();
        c.setPointerCapture(e.pointerId); this.kick();
      });
      c.addEventListener('pointermove', e => {
        if (this.dragging) {
          const dx = e.clientX - lx, dy = e.clientY - ly, now = performance.now(), dt = Math.max(8, now - lt);
          lx = e.clientX; ly = e.clientY; lt = now; moved += Math.abs(dx) + Math.abs(dy);
          const k = 120 / this.R;
          this.lon += dx * k; this.phi = clamp(this.phi + dy * k, -60, 60);
          this.vLon = dx * k / dt * 16; this.vPhi = dy * k / dt * 16; this.lastInteract = now;
          this.draw(now);
        } else {
          const h = this.hit(e); if (h !== this.hover) { this.hover = h; c.style.cursor = h ? 'pointer' : 'grab'; this.draw(performance.now()); }
        }
      });
      const end = e => {
        if (!this.dragging) return; this.dragging = false;
        if (moved < 6) { const h = this.hit(e); if (h && this.onPick) this.onPick(h.cc); }
        this.lastInteract = performance.now(); this.kick();
      };
      c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
      c.addEventListener('pointerleave', () => { if (this.hover) { this.hover = null; this.draw(performance.now()); } });
    }
    hit(e) {
      const r = this.c.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      let best = null, bd = 22 * 22;
      for (const h of this.hubs) {
        const [px, py, z] = this.proj(h.v); if (z < 0.05) continue;
        const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; best = h; }
      }
      return best;
    }
    kick() {
      if (this.destroyed || this.running || document.hidden || !this.visible) return;
      this.running = true; requestAnimationFrame(t => this.loop(t));
    }
    loop(now) {
      if (this.destroyed || document.hidden || !this.visible) { this.running = false; return; }
      if (this.anim) {
        const a = this.anim, k = clamp((now - a.t0) / a.d, 0, 1), e = ease(k);
        this.lon = a.from.lon + (a.to.lon - a.from.lon) * e; this.phi = a.from.phi + (a.to.phi - a.from.phi) * e;
        if (k >= 1) this.anim = null;
      } else if (!this.dragging) {
        if (Math.abs(this.vLon) > 0.01 || Math.abs(this.vPhi) > 0.01) {
          this.lon += this.vLon; this.phi = clamp(this.phi + this.vPhi, -60, 60); this.vLon *= 0.94; this.vPhi *= 0.9;
        } else if (!this.reduced && now - this.lastInteract > 2500) this.lon += 0.06; // gentle autorotate
      }
      this.draw(now);
      if (this.reduced && !this.anim && !this.dragging && Math.abs(this.vLon) < 0.01) { this.running = false; return; }
      requestAnimationFrame(t => this.loop(t));
    }
    pickArcs(now) {
      const src = this.hubs.find(h => h.cc === this.active) || this.hubs[0];
      const others = this.hubs.filter(h => h !== src);
      this.arcs = [];
      for (let i = 0; i < Math.min(6, others.length); i++) {
        const dst = others[Math.floor(Math.random() * others.length)];
        this.arcs.push({ a: src.v, b: dst.v, t0: now + i * 380, d: 2600 + Math.random() * 1200 });
      }
      this.nextArcs = now + 5200;
    }
    draw(now) {
      const ctx = this.ctx, R = this.R, cx = this.cx, cy = this.cy, col = this.col;
      if (!R) return;
      ctx.clearRect(0, 0, this.w, this.h);
      // atmosphere
      const atm = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.28);
      atm.addColorStop(0, col.rim + '55'); atm.addColorStop(1, col.rim + '00');
      ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, 0, Math.PI * 2); ctx.fill();
      // sphere body
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, col.sea + 'ee'); body.addColorStop(1, col.sea + '99');
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col.rim + '66'; ctx.lineWidth = 1; ctx.stroke();
      // land dots in 4 depth buckets
      const buckets = [[], [], [], []]; const p = this.pts;
      for (let i = 0; i < p.length; i += 3) {
        const q = this.proj([p[i], p[i + 1], p[i + 2]]); if (q[2] <= 0) continue;
        buckets[Math.min(3, (q[2] * 4) | 0)].push(q);
      }
      ctx.fillStyle = col.dot;
      buckets.forEach((b, k) => {
        ctx.globalAlpha = 0.18 + k * 0.24; const s = 1.1 + k * 0.45;
        ctx.beginPath(); for (const q of b) ctx.rect(q[0] - s / 2, q[1] - s / 2, s, s); ctx.fill();
      });
      ctx.globalAlpha = 1;
      // signal arcs
      if (!this.reduced) {
        if (now > this.nextArcs) this.pickArcs(now);
        ctx.lineCap = 'round';
        for (const a of this.arcs) {
          const k = (now - a.t0) / a.d; if (k < 0 || k > 1.25) continue;
          const dot = a.a[0] * a.b[0] + a.a[1] * a.b[1] + a.a[2] * a.b[2], om = Math.acos(clamp(dot, -1, 1)), so = Math.sin(om) || 1;
          const N = 40, head = Math.min(1, k), tail = Math.max(0, k - 0.45);
          let prev = null;
          for (let i = 0; i <= N; i++) {
            const t = tail + (head - tail) * (i / N);
            const s1 = Math.sin((1 - t) * om) / so, s2 = Math.sin(t * om) / so;
            const v = [a.a[0] * s1 + a.b[0] * s2, a.a[1] * s1 + a.b[1] * s2, a.a[2] * s1 + a.b[2] * s2];
            const q = this.proj(v, 1 + 0.22 * Math.sin(Math.PI * t) * Math.min(1, om));
            if (prev && q[2] > -0.15 && prev[2] > -0.15) {
              ctx.strokeStyle = col.live; ctx.globalAlpha = (i / N) * 0.9 * Math.min(1, (1.25 - k) * 4); ctx.lineWidth = 1 + 1.6 * (i / N);
              ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
            }
            prev = q;
          }
        }
        ctx.globalAlpha = 1;
      }
      // hubs
      const tt = (now - this.t0) / 1000;
      let labelHub = null;
      for (const h of this.hubs) {
        const [x, y, z] = this.proj(h.v); if (z <= 0.02) continue;
        const live = h.cc === this.active, hov = this.hover === h;
        const base = (live ? 4.2 : 2.2 + h.w * 2.2) * (0.6 + 0.4 * z);
        const color = live ? col.live : col.hub;
        if (!this.reduced) {
          const ph = (tt / (live ? 1.6 : 2.6) + h.phase) % 1;
          ctx.globalAlpha = (1 - ph) * 0.7 * z; ctx.strokeStyle = color; ctx.lineWidth = live ? 2 : 1.3;
          ctx.beginPath(); ctx.arc(x, y, base + ph * (live ? 26 : 14), 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = Math.min(1, 0.35 + z); ctx.fillStyle = color;
        ctx.shadowColor = color; ctx.shadowBlur = live || hov ? 16 : 8;
        ctx.beginPath(); ctx.arc(x, y, hov ? base + 1.5 : base, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (hov || (live && !this.hover)) labelHub = { h, x, y, z };
      }
      ctx.globalAlpha = 1;
      if (labelHub) {
        const { h, x, y } = labelHub; const text = this.label(h);
        ctx.font = '600 12px Manrope, system-ui, sans-serif'; const tw = ctx.measureText(text).width;
        const bx = clamp(x + 12, 4, this.w - tw - 24), by = clamp(y - 30, 4, this.h - 28);
        ctx.fillStyle = col.panel; ctx.globalAlpha = 0.92; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, tw + 18, 24, 12); else ctx.rect(bx, by, tw + 18, 24); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = col.text; ctx.fillText(text, bx + 9, by + 16);
      }
    }
  }
  Globe.prototype.destroy = function () { this.destroyed = true; this.visible = false; try { this.ro.disconnect(); this.io.disconnect(); } catch (e) { /* ignore */ } };
  window.RadioGlobe = Globe;
})();
