/* ============ PETITS BOULOTS : mini-jeux, le score rapporte de l'argent ============ */

const JOBS = [
  {id: 'delivery', icon: '🍕', name: 'Livreur express', time: 60, rate: 0.5,
   desc: 'Livre un max de pizzas en 60 s. Ramasse les cartons, dépose-les sur les zones de livraison, évite la circulation.',
   ctrl: '← → (ou touche gauche / droite de l\'écran) pour changer de voie'},
  {id: 'wash', icon: '🧽', name: 'Station de lavage', time: 40, rate: 0.7,
   desc: 'Frotte la boue sur les voitures des clients. Chaque voiture propre rapporte des points, et un bonus de temps.',
   ctrl: 'Clique / touche et glisse pour frotter'},
  {id: 'torque', icon: '🔩', name: 'Atelier : serrage au couple', time: 0, rate: 0.35,
   desc: 'Serre 10 écrous de roue au bon couple. Arrête l\'aiguille dans la zone verte : de plus en plus vite !',
   ctrl: IS_TOUCH ? 'Touche l\'écran pour serrer' : 'ESPACE / clic pour serrer'}
];

const Jobs = {
  active: false, job: null, g: null, t: 0, over: false,

  start(id) {
    this.job = JOBS.find(j => j.id === id); this.active = true; this.over = false; this.t = 0;
    this.g = {score: 0, timeLeft: this.job.time, keys: {}};
    this['init_' + id](this.g);
    UI.jobStart();
  },
  stop() { this.active = false; this.job = null; },
  end() {
    if (this.over) return; this.over = true;
    const score = Math.round(this.g.score), pay = Math.round(score * this.job.rate * (1 + Game.perk('jobs')) * (1 + Game.perk('all')) * 1.5);
    const best = Game.save.jobs = Game.save.jobs || {};
    const record = score > (best[this.job.id] || 0); if (record) best[this.job.id] = score;
    Game.save.money += pay; Game.persist(); UI.refreshTop();
    const job = this.job; setTimeout(() => { if (this.active && this.job === job) UI.showJobResult(job, score, pay, record); }, 700);
  },
  update(dt) {
    if (!this.active || this.over) return;
    this.t += dt;
    if (this.job.time) { this.g.timeLeft -= dt; if (this.g.timeLeft <= 0) { this.g.timeLeft = 0; this.end(); return; } }
    this['update_' + this.job.id](this.g, dt);
  },
  draw(ctx) {
    ctx.setTransform(HD, 0, 0, HD, 0, 0); ctx.imageSmoothingEnabled = false;
    this['draw_' + this.job.id](ctx, this.g);
    // bandeau score / temps
    glassPanel(ctx, 16, 14, 250, 74);
    ctx.fillStyle = '#9097c0'; ctx.font = `600 13px ${UIF}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.fillText(this.job.icon + ' ' + this.job.name.toUpperCase(), 32, 38);
    ctx.fillStyle = '#fff'; ctx.font = `700 32px ${UIF}`; ctx.fillText(Math.round(this.g.score), 32, 74);
    ctx.fillStyle = '#ffd34d'; ctx.font = `700 15px ${UIF}`; ctx.textAlign = 'right'; ctx.fillText('≈ ' + fmt(this.g.score * this.job.rate) + ' €', 250, 74);
    if (this.job.time) {
      glassPanel(ctx, 960 - 16 - 150, 14, 150, 74);
      const tl = this.g.timeLeft; ctx.fillStyle = tl < 10 ? '#ff4a5a' : '#fff'; ctx.font = `700 36px ${UIF}`; ctx.textAlign = 'center';
      ctx.fillText(tl.toFixed(1), 960 - 91, 68);
    }
    if (this.g.msg && this.g.msgT > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, this.g.msgT * 2); ctx.font = `italic 700 34px ${UIF}`; ctx.textAlign = 'center';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(5,6,16,0.85)'; ctx.strokeText(this.g.msg, 480, 150);
      ctx.fillStyle = this.g.msgC || '#fff'; ctx.shadowColor = this.g.msgC || '#fff'; ctx.shadowBlur = 18; ctx.fillText(this.g.msg, 480, 150); ctx.restore();
    }
    ctx.textAlign = 'left';
  },
  msg(m, c) { this.g.msg = m; this.g.msgC = c; this.g.msgT = 1.1; },
  // entrées (coordonnées natives du canvas)
  down(x, y) { if (this.active && !this.over && this['down_' + this.job.id]) this['down_' + this.job.id](this.g, x, y); },
  move(x, y) { if (this.active && !this.over && this['move_' + this.job.id]) this['move_' + this.job.id](this.g, x, y); },
  up() { if (this.active && this.g) this.g.pressing = false; },
  key(code) { if (this.active && !this.over && this['key_' + this.job.id]) this['key_' + this.job.id](this.g, code); },

  /* ======================= LIVRAISON (vue de dessus) ======================= */
  init_delivery(g) {
    g.lanes = [360, 480, 600]; g.lane = 1; g.px = 480; g.scroll = 0; g.speed = 320; g.items = []; g.spawn = 0.6; g.carry = 0; g.crash = 0;
    g.deco = []; const r = rng(4); for (let i = 0; i < 40; i++) g.deco.push({side: r() < 0.5 ? -1 : 1, y: r() * 1600, kind: Math.floor(r() * 3), c: ['#c65b4a', '#d9b25a', '#5a86c6', '#7fae5a'][Math.floor(r() * 4)]});
  },
  update_delivery(g, dt) {
    g.speed = Math.min(620, 320 + this.t * 6) * (g.crash > 0 ? 0.45 : 1);
    if (g.crash > 0) g.crash -= dt;
    g.scroll += g.speed * dt;
    g.px += (g.lanes[g.lane] - g.px) * Math.min(1, dt * 14);
    g.spawn -= dt;
    if (g.spawn <= 0) {
      const r = Math.random(), lane = Math.floor(Math.random() * 3);
      if (!g.items.some(o => o.y < 60 && o.lane === lane)) {
        if (r < 0.5) g.items.push({k: 'car', lane, y: -90, v: 80 + Math.random() * 120, c: PAINTS[Math.floor(Math.random() * PAINTS.length)]});
        else if (r < 0.8) g.items.push({k: 'box', lane, y: -40});
        else g.items.push({k: 'drop', lane, y: -60});
      }
      g.spawn = Math.max(0.28, 0.75 - this.t * 0.007) * (0.7 + Math.random() * 0.6);
    }
    for (const o of g.items) {
      o.y += (g.speed - (o.v || 0)) * dt;
      if (o.hit) continue;
      const near = Math.abs(g.lanes[o.lane] - g.px) < 50, dy = Math.abs(o.y - 430);
      if (o.k === 'car' && near && dy < 80 && g.crash <= 0) { o.hit = true; g.crash = 0.9; g.carry = 0; g.score = Math.max(0, g.score - 50); this.msg('ACCROCHAGE ! -50, cartons perdus', '#ff4a5a'); Sound.ready && Sound.pops && Sound.ctx && Sound.pops(0.6, 2); }
      if (o.k === 'box' && near && dy < 45) { o.hit = true; if (g.carry < 3) { g.carry++; g.score += 15; this.msg('+1 pizza', '#ffd34d'); } }
      if (o.k === 'drop' && near && dy < 50) { o.hit = true; if (g.carry) { const pts = g.carry * 100 + (g.carry === 3 ? 100 : 0); g.score += pts; this.msg(`LIVRÉ ×${g.carry}  +${pts}`, '#4cff8a'); g.carry = 0; } }
    }
    g.items = g.items.filter(o => o.y < 640 && !(o.hit && o.k !== 'car'));
    g.score += dt * 2;
    if (g.msgT > 0) g.msgT -= dt;
  },
  key_delivery(g, code) { if (code === 'ArrowLeft' || code === 'KeyA') g.lane = Math.max(0, g.lane - 1); if (code === 'ArrowRight' || code === 'KeyD') g.lane = Math.min(2, g.lane + 1); },
  down_delivery(g, x) { if (x < 480) g.lane = Math.max(0, g.lane - 1); else g.lane = Math.min(2, g.lane + 1); },
  draw_delivery(ctx, g) {
    // trottoirs, pelouses, maisons
    ctx.fillStyle = '#3b6b3a'; ctx.fillRect(0, 0, 960, 540);
    const off = g.scroll % 40;
    for (let y = -40 + off; y < 540; y += 40) { ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(0, Math.round(y), 960, 20); }
    for (const d of g.deco) {
      const y = ((d.y + g.scroll * 0.999) % 1600) - 200; if (y < -120 || y > 600) continue;
      const x = d.side < 0 ? 90 : 760;
      if (d.kind < 2) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 8, y + 8, 110, 90);
        ctx.fillStyle = d.c; ctx.fillRect(x, y, 110, 90);
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x + 55, y, 55, 90);
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y, 110, 3);
      } else {
        ctx.fillStyle = '#1f4a24'; ctx.beginPath(); ctx.arc(x + 50, y + 40, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2d6431'; ctx.beginPath(); ctx.arc(x + 44, y + 34, 18, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = '#9a9aa6'; ctx.fillRect(268, 0, 22, 540); ctx.fillRect(670, 0, 22, 540);
    ctx.fillStyle = '#34353f'; ctx.fillRect(290, 0, 380, 540);
    for (let y = -60 + g.scroll % 60; y < 540; y += 60) { ctx.fillStyle = '#e8e8f0'; ctx.fillRect(418, Math.round(y), 4, 32); ctx.fillRect(538, Math.round(y), 4, 32); }
    for (const o of g.items) {
      const x = g.lanes[o.lane];
      if (o.k === 'drop') {
        ctx.save(); ctx.globalAlpha = 0.5 + Math.sin(this.t * 8) * 0.2; ctx.fillStyle = '#4cff8a'; roundRect(ctx, x - 50, o.y - 30, 100, 60, 10); ctx.fill(); ctx.restore();
        ctx.fillStyle = '#0b2a14'; ctx.font = `700 13px ${UIF}`; ctx.textAlign = 'center'; ctx.fillText('LIVRAISON', x, o.y + 5);
      } else if (o.k === 'box') {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x - 16, o.y - 12, 36, 32);
        ctx.fillStyle = '#e8c48a'; ctx.fillRect(x - 20, o.y - 16, 36, 32); ctx.fillStyle = '#c62f3a'; ctx.fillRect(x - 20, o.y - 4, 36, 6);
        ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🍕', x - 2, o.y + 6);
      } else topCar(ctx, x, o.y, o.c, false, o.hit);
    }
    topCar(ctx, g.px, 430, Game.car().color, false, g.crash > 0 && Math.floor(this.t * 12) % 2);
    // cartons transportés
    glassPanel(ctx, 16, 100, 250, 44);
    ctx.font = '20px sans-serif'; ctx.textAlign = 'left';
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = i < g.carry ? 1 : 0.2; ctx.fillText('🍕', 32 + i * 30, 130); }
    ctx.globalAlpha = 1; ctx.fillStyle = '#9097c0'; ctx.font = `600 12px ${UIF}`; ctx.fillText('à bord (max 3)', 130, 128);
  },

  /* ======================= LAVAGE ======================= */
  init_wash(g) { g.cleaned = 0; this.newWashCar(g); g.bubbles = []; },
  newWashCar(g) {
    const id = CAR_IDS[Math.floor(Math.random() * CAR_IDS.length)], p = PROFILES[CARS[id].style], s = 3;
    g.car = id; g.color = PAINTS[Math.floor(Math.random() * PAINTS.length)];
    g.s = s; g.cx = Math.round(480 - p.L * s / 2); g.cy = 470;
    // calque de boue limité à la silhouette
    const w = p.L * s, h = p.H * s, d = mkCanvas(w, h), x = d.getContext('2d');
    const r = rng(Math.floor(Math.random() * 1e6) + 1);
    for (let i = 0; i < 70; i++) {
      const bx = r() * w, by = h * 0.25 + r() * h * 0.75, br = 12 + r() * 30;
      x.fillStyle = ['#5b4630', '#6e5638', '#4a3a28', '#7a6243'][Math.floor(r() * 4)];
      x.beginPath(); x.ellipse(bx, by, br, br * (0.5 + r() * 0.5), r() * 3, 0, Math.PI * 2); x.fill();
    }
    for (let i = 0; i < 400; i++) { x.fillStyle = 'rgba(60,45,30,0.6)'; x.fillRect(r() * w, h * 0.4 + r() * h * 0.6, 3, 3); }
    x.globalCompositeOperation = 'destination-in';
    const body = getBody(CARS[id].style, g.color); x.imageSmoothingEnabled = false; x.drawImage(body, 0, 0, w, h);
    g.dirt = d; g.dirtTotal = this.countDirt(d); g.pct = 0; g.left = 1;
  },
  countDirt(c) {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0;
    for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 40) n++;
    return n;
  },
  update_wash(g, dt) {
    for (const b of g.bubbles) { b.y -= 30 * dt; b.life -= dt; }
    g.bubbles = g.bubbles.filter(b => b.life > 0);
    g.chk = (g.chk || 0) - dt;
    if (g.chk <= 0) {
      g.chk = 0.15;
      g.left = this.countDirt(g.dirt) / Math.max(1, g.dirtTotal);
      g.pct = 1 - g.left;
      if (g.left < 0.04) { g.cleaned++; g.score += 100 + Math.round(g.timeLeft); g.timeLeft += 6; this.msg('NICKEL ! +100  +6 s', '#4cff8a'); this.newWashCar(g); }
    }
    if (g.msgT > 0) g.msgT -= dt;
  },
  scrub(g, x, y) {
    const lx = x - g.cx, ly = y - (g.cy - (PROFILES[CARS[g.car].style].H - 1) * g.s);
    const c = g.dirt.getContext('2d'); c.globalCompositeOperation = 'destination-out';
    c.beginPath(); c.arc(lx, ly, 26, 0, Math.PI * 2); c.fill();
    if (Math.random() < 0.6) g.bubbles.push({x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 30, r: 3 + Math.random() * 7, life: 0.8});
    g.score += 0.05;
  },
  down_wash(g, x, y) { g.pressing = true; this.scrub(g, x, y); },
  move_wash(g, x, y) { g.mx = x; g.my = y; if (g.pressing) this.scrub(g, x, y); },
  draw_wash(ctx, g) {
    const bg = ctx.createLinearGradient(0, 0, 0, 540); bg.addColorStop(0, '#1c3a52'); bg.addColorStop(1, '#0e1a26'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 960, 540);
    for (let x = 0; x < 960; x += 64) { ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x, 0, 2, 400); }
    ctx.fillStyle = '#2a4b66'; ctx.fillRect(0, 70, 960, 16); ctx.fillStyle = '#62d6ff'; ctx.font = `700 15px ${UIF}`; ctx.textAlign = 'center'; ctx.fillText('LAVAGE EXPRESS · BULLES & BRILLANCE', 480, 83);
    ctx.fillStyle = '#25303c'; ctx.fillRect(0, 470, 960, 70);
    for (let x = 0; x < 960; x += 40) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, 470, 20, 70); }
    // rouleaux de lavage
    for (const rx of [70, 890]) { ctx.fillStyle = '#2b6fd0'; ctx.fillRect(rx - 22, 110, 44, 360); for (let y = 110 + (this.t * 300) % 20; y < 470; y += 20) { ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(rx - 22, Math.round(y), 44, 6); } }
    drawCar(ctx, CARS[g.car].style, g.color, g.cx, g.cy, g.s, {wheelAng: 0});
    const p = PROFILES[CARS[g.car].style];
    ctx.drawImage(g.dirt, g.cx, g.cy - (p.H - 1) * g.s);
    for (const b of g.bubbles) { ctx.strokeStyle = `rgba(255,255,255,${b.life})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke(); }
    if (g.mx != null) { ctx.font = '34px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🧽', g.mx, g.my + 12); }
    glassPanel(ctx, 330, 14, 300, 56);
    ctx.fillStyle = '#9097c0'; ctx.font = `600 12px ${UIF}`; ctx.textAlign = 'left'; ctx.fillText(`Voiture ${g.cleaned + 1} · ${CARS[g.car].name}`, 346, 34);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; roundRect(ctx, 346, 44, 268, 12, 6); ctx.fill();
    ctx.fillStyle = '#62d6ff'; roundRect(ctx, 346, 44, 268 * clamp(g.pct / 0.96, 0, 1), 12, 6); ctx.fill();
  },

  /* ======================= ATELIER : SERRAGE ======================= */
  init_torque(g) { g.bolt = 0; g.n = 10; g.pos = 0; g.dir = 1; g.speed = 0.7; g.done = []; this.newBolt(g); g.cool = 0; },
  newBolt(g) { g.zw = Math.max(0.06, 0.16 - g.bolt * 0.01); g.zc = 0.25 + Math.random() * 0.5; g.speed = 0.7 + g.bolt * 0.17; },
  update_torque(g, dt) {
    if (g.cool > 0) { g.cool -= dt; if (g.cool <= 0 && g.bolt >= g.n) this.end(); }
    else { g.pos += g.dir * g.speed * dt; if (g.pos > 1) { g.pos = 1; g.dir = -1; } if (g.pos < 0) { g.pos = 0; g.dir = 1; } }
    if (g.msgT > 0) g.msgT -= dt;
  },
  hitTorque(g) {
    if (g.cool > 0 || g.bolt >= g.n) return;
    const d = Math.abs(g.pos - g.zc) / (g.zw / 2);
    let pts, m, c;
    if (d <= 0.25) { pts = 100; m = 'PILE AU COUPLE ! +100'; c = '#4cff8a'; }
    else if (d <= 1) { pts = Math.round(80 - d * 40); m = `BIEN +${pts}`; c = '#ffd34d'; }
    else if (d <= 1.8) { pts = 15; m = g.pos > g.zc ? 'TROP SERRÉ +15' : 'PAS ASSEZ +15'; c = '#ff9a4a'; }
    else { pts = 0; m = g.pos > g.zc ? 'FILETAGE ABÎMÉ !' : 'ÉCROU DESSERRÉ !'; c = '#ff4a5a'; }
    g.score += pts; g.done.push(pts); g.bolt++; g.cool = 0.55; this.msg(m, c);
    if (g.bolt < g.n) this.newBolt(g);
  },
  key_torque(g, code) { if (code === 'Space' || code === 'Enter') this.hitTorque(g); },
  down_torque(g) { this.hitTorque(g); },
  draw_torque(ctx, g) {
    const bg = ctx.createLinearGradient(0, 0, 0, 540); bg.addColorStop(0, '#2b2e3d'); bg.addColorStop(1, '#14151d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 960, 540);
    for (let y = 0; y < 540; y += 20) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, y, 960, 1); }
    // moyeu de roue + écrous
    const cx = 330, cy = 300, R = 150;
    ctx.fillStyle = '#0d0d10'; ctx.beginPath(); ctx.arc(cx, cy, R + 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3d48'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    const hg = ctx.createRadialGradient(cx - 40, cy - 40, 10, cx, cy, R); hg.addColorStop(0, '#9aa0ae'); hg.addColorStop(1, '#4a4e5a');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, R - 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d82828'; ctx.fillRect(cx + R - 70, cy - 60, 40, 120);
    ctx.fillStyle = '#20222a'; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.fill();
    const wheelIdx = g.bolt % 5;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5, bx = cx + Math.cos(a) * 80, by = cy + Math.sin(a) * 80;
      const grp = g.bolt >= g.n ? (g.n / 5 - 1) * 5 : Math.floor(g.bolt / 5) * 5;
      const res = g.done[grp + i], doneOnWheel = res != null;
      ctx.fillStyle = doneOnWheel && res != null ? (res >= 80 ? '#4cff8a' : res >= 15 ? '#ffd34d' : '#ff4a5a') : '#c8ccd6';
      ctx.beginPath(); for (let k = 0; k < 6; k++) { const aa = k * Math.PI / 3; ctx.lineTo(bx + Math.cos(aa) * 16, by + Math.sin(aa) * 16); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
      if (i === wheelIdx && g.bolt < g.n && g.cool <= 0) { ctx.strokeStyle = '#ff9a2e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, by, 24, 0, Math.PI * 2); ctx.stroke(); }
    }
    // clé dynamométrique (jauge)
    const gx = 560, gy = 160, gw = 340, gh = 260;
    glassPanel(ctx, gx, gy, gw, gh);
    ctx.fillStyle = '#fff'; ctx.font = `700 18px ${UIF}`; ctx.textAlign = 'center'; ctx.fillText(`Écrou ${Math.min(g.bolt + 1, g.n)} / ${g.n}`, gx + gw / 2, gy + 34);
    const bx = gx + 30, bw = gw - 60, by = gy + 110;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, bx, by, bw, 34, 10); ctx.fill();
    const z0 = bx + bw * (g.zc - g.zw / 2), z1 = bx + bw * (g.zc + g.zw / 2);
    ctx.fillStyle = 'rgba(255,211,77,0.35)'; ctx.fillRect(z0 - bw * g.zw * 0.4, by, bw * g.zw * 0.4, 34); ctx.fillRect(z1, by, bw * g.zw * 0.4, 34);
    ctx.fillStyle = '#4cff8a'; ctx.fillRect(z0, by, z1 - z0, 34);
    ctx.fillStyle = '#19ff6a'; ctx.fillRect(bx + bw * (g.zc - g.zw / 8), by, bw * g.zw / 4, 34);
    const nx = bx + bw * g.pos;
    ctx.fillStyle = '#ff7a1a'; ctx.shadowColor = '#ff7a1a'; ctx.shadowBlur = 12; ctx.fillRect(nx - 3, by - 12, 6, 58); ctx.shadowBlur = 0;
    ctx.fillStyle = '#9097c0'; ctx.font = `600 13px ${UIF}`; ctx.fillText('Nm', gx + gw / 2, by + 70);
    ctx.fillText(IS_TOUCH ? 'Touche l\'écran pour serrer' : 'ESPACE / clic pour serrer', gx + gw / 2, gy + gh - 24);
    // historique
    ctx.textAlign = 'left';
    g.done.forEach((p, i) => { ctx.fillStyle = p >= 80 ? '#4cff8a' : p >= 15 ? '#ffd34d' : '#ff4a5a'; ctx.beginPath(); ctx.arc(gx + 40 + i * 29, gy + 62, 8, 0, Math.PI * 2); ctx.fill(); });
  }
};

/* voiture vue de dessus (livraison) */
function topCar(ctx, x, y, color, down, blink) {
  if (blink) return;
  const w = 56, h = 96;
  ctx.save(); ctx.translate(x, y); if (down) ctx.rotate(Math.PI);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, -w / 2 + 5, -h / 2 + 7, w, h, 14); ctx.fill();
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, shade(color, 0.6)); g.addColorStop(0.5, shade(color, 1.25)); g.addColorStop(1, shade(color, 0.6));
  ctx.fillStyle = g; roundRect(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.fillStyle = '#16202c'; roundRect(ctx, -w / 2 + 7, -h / 2 + 22, w - 14, 18, 5); ctx.fill();
  ctx.fillStyle = shade(color, 1.1); roundRect(ctx, -w / 2 + 8, -h / 2 + 42, w - 16, 26, 4); ctx.fill();
  ctx.fillStyle = '#16202c'; roundRect(ctx, -w / 2 + 8, -h / 2 + 70, w - 16, 12, 4); ctx.fill();
  ctx.fillStyle = '#fff6c8'; ctx.fillRect(-w / 2 + 6, -h / 2 + 2, 12, 5); ctx.fillRect(w / 2 - 18, -h / 2 + 2, 12, 5);
  ctx.fillStyle = '#e02a30'; ctx.fillRect(-w / 2 + 6, h / 2 - 6, 12, 4); ctx.fillRect(w / 2 - 18, h / 2 - 6, 12, 4);
  ctx.restore();
}
function shade(hex, f) { const c = tone(hexRgb(hex), f); return `rgb(${c.map(Math.round).join(',')})`; }

/* ---- éléments visuels du menu (maquette Claude Design « Menu Petits Boulots ») ---- */
const JOB_THEME = {
  delivery: {color: '#ff9a2e', bg: '#2a1a10', bd: '#4a2d18', light: '#ffb15c', target: 1200,
    desc: 'Ramasse jusqu’à 3 pizzas, dépose-les sur les zones de livraison et évite la circulation. Livrer les 3 d’un coup rapporte un bonus.',
    keys: '<kbd>←</kbd><kbd>→</kbd><span>changer de voie</span>'},
  wash: {color: '#3ee0ff', bg: '#0f2433', bd: '#1d4660', light: '#7feaff', target: 800,
    desc: 'Frotte la boue des voitures clientes. Chaque voiture nickel rapporte 100 points et 6 secondes de plus au chrono.',
    keys: '<kbd>CLIC + GLISSER</kbd><span>pour frotter</span>'},
  torque: {color: '#4cff8a', bg: '#10261a', bd: '#1f4a30', light: '#8bffb4', target: 1000,
    desc: 'Arrête l’aiguille de la clé dynamométrique dans la zone verte. Elle rétrécit et accélère à chaque écrou.',
    keys: '<kbd>ESPACE</kbd><span>ou clic pour serrer</span>'}
};
const JOB_SVG = {
  clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  trophy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
  delivery: '<svg width="96" height="96" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Scooter de livraison"><circle cx="16" cy="46" r="7"/><circle cx="48" cy="46" r="7"/><path d="M23 46h14l6-14h-9"/><path d="M40 20h7l4 12"/><rect x="8" y="22" width="18" height="14" rx="2"/><path d="M12 29h10"/></svg>',
  wash: '<svg width="96" height="96" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Voiture et gouttes d’eau"><path d="M8 40l5-11a4 4 0 0 1 4-2h30a4 4 0 0 1 4 2l5 11v7H8z"/><circle cx="18" cy="47" r="5"/><circle cx="46" cy="47" r="5"/><path d="M20 12c0 3-3 4-3 7a3 3 0 0 0 6 0c0-3-3-4-3-7z"/><path d="M34 8c0 3-3 4-3 7a3 3 0 0 0 6 0c0-3-3-4-3-7z"/><path d="M47 14c0 2-2 3-2 5a2 2 0 0 0 4 0c0-2-2-3-2-5z"/></svg>',
  torque: '<svg width="96" height="96" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Clé et écrou"><path d="M38 10a10 10 0 0 0-9 14L10 43a4 4 0 0 0 6 6l19-19a10 10 0 0 0 14-9l-6 6-6-2-2-6 6-6a10 10 0 0 0-3-3z"/><path d="M44 40l6 3.5v7L44 54l-6-3.5v-7z"/><circle cx="44" cy="47" r="2"/></svg>'
};
