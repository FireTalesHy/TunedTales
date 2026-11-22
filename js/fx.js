/* ============ EFFETS « JUICE » : pièces, confettis, étincelles (calque plein écran) ============ */
const FX = {
  cv: null, ctx: null, parts: [], running: false,
  init() {
    if (this.cv) return;
    this.cv = document.createElement('canvas'); this.cv.id = 'fx';
    document.body.appendChild(this.cv); this.ctx = this.cv.getContext('2d');
    const rs = () => { this.cv.width = innerWidth * devicePixelRatio; this.cv.height = innerHeight * devicePixelRatio; };
    addEventListener('resize', rs); rs();
  },
  start() { if (!this.running) { this.running = true; this.last = performance.now(); requestAnimationFrame(t => this.loop(t)); } },
  /* pluie de pièces qui volent jusqu'au compteur d'argent */
  coins(fromEl, n) {
    this.init();
    const cash = document.getElementById('cash'); if (!cash) return;
    const f = fromEl && fromEl.getBoundingClientRect ? fromEl.getBoundingClientRect() : {left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0};
    const t = cash.getBoundingClientRect();
    const fx = f.left + f.width / 2, fy = f.top + f.height / 2, tx = t.left + t.width / 2, ty = t.top + t.height / 2;
    for (let i = 0; i < (n || 18); i++) {
      const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 90;
      this.parts.push({k: 'coin', x0: fx, y0: fy, mx: fx + Math.cos(a) * r, my: fy + Math.sin(a) * r - 60, tx, ty, t: -i * 0.035, d: 0.85 + Math.random() * 0.25, rot: Math.random() * 6});
    }
    this.start();
  },
  confetti(n) {
    this.init();
    const cols = ['#19e6ff', '#ff2bd6', '#ffd23f', '#3dff7a', '#ffffff', '#ff7a1a'];
    for (let i = 0; i < (n || 160); i++) this.parts.push({k: 'conf', x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 120, vy: 140 + Math.random() * 220, r: Math.random() * 6, vr: (Math.random() - 0.5) * 12,
      w: 6 + Math.random() * 6, h: 10 + Math.random() * 8, c: cols[i % cols.length], life: 4});
    this.start();
  },
  sparks(el, color) {
    this.init();
    const b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
    for (let i = 0; i < 26; i++) { const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
      this.parts.push({k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6 + Math.random() * 0.3, c: color || '#ffd23f'}); }
    this.start();
  },
  loop(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    const c = this.ctx, k = devicePixelRatio;
    c.setTransform(k, 0, 0, k, 0, 0); c.clearRect(0, 0, innerWidth, innerHeight);
    let pinged = false;
    for (const p of this.parts) {
      if (p.k === 'coin') {
        p.t += dt; if (p.t < 0) continue;
        const u = Math.min(1, p.t / p.d), e = u * u * (3 - 2 * u), a = 1 - e;
        const x = a * a * p.x0 + 2 * a * e * p.mx + e * e * p.tx, y = a * a * p.y0 + 2 * a * e * p.my + e * e * p.ty;
        const sq = Math.abs(Math.cos(p.rot + p.t * 9));
        c.save(); c.translate(x, y); c.scale(0.35 + sq * 0.65, 1);
        const g = c.createRadialGradient(-3, -3, 1, 0, 0, 10); g.addColorStop(0, '#fff6b0'); g.addColorStop(0.5, '#ffd23f'); g.addColorStop(1, '#b07a00');
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#8a5c00'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = '#8a5c00'; c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('€', 0, 1);
        c.restore();
        if (u >= 1) { p.dead = true; if (!pinged) { pinged = true; UI.cashPing(); } }
      } else if (p.k === 'conf') {
        p.life -= dt; p.vy += 60 * dt; p.x += (p.vx + Math.sin(p.y * 0.02) * 40) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, Math.cos(p.r * 2)); c.fillStyle = p.c; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore();
        if (p.life <= 0 || p.y > innerHeight + 40) p.dead = true;
      } else {
        p.life -= dt; p.vx *= 0.94; p.vy = p.vy * 0.94 + 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        c.globalAlpha = Math.max(0, p.life * 1.6); c.fillStyle = p.c; c.fillRect(p.x, p.y, 3, 3); c.globalAlpha = 1;
        if (p.life <= 0) p.dead = true;
      }
    }
    this.parts = this.parts.filter(p => !p.dead);
    if (this.parts.length) requestAnimationFrame(t => this.loop(t));
    else { this.running = false; c.clearRect(0, 0, innerWidth, innerHeight); }
  }
};

/* reflet lumineux qui balaie la carrosserie (pour le garage et l'atelier) */
const _sheenCv = document.createElement('canvas');
function drawSheen(ctx, style, color, look, x, y, s, phase, strength) {
  const p = PROFILES[style], lk = lookOf({look}), body = getBody(style, color, lk);
  const drop = Math.min(lk.height || 0, p.sill - 2 - (lk.kit >= 2 ? 4 : lk.kit ? 3 : 0));
  _sheenCv.width = p.L; _sheenCv.height = p.H;
  const c = _sheenCv.getContext('2d');
  c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, p.L, p.H); c.drawImage(body, 0, 0);
  c.globalCompositeOperation = 'source-in';
  const cx = -p.L * 0.4 + phase * p.L * 1.8, g = c.createLinearGradient(cx - 30, 0, cx + 30, p.H);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${strength || 0.5})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, p.L, p.H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(_sheenCv, x, y - (p.H - 1 - drop) * s, p.L * s, p.H * s); ctx.restore();
}
