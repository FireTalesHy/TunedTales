/* ============ COURSE DE DRAG : logique + rendu 2.5D ============ */

const W = 480, H = 270;
const PPM = 5;                 // pixels par mètre (écart entre voitures)
const FONT = '"Press Start 2P", "Courier New", monospace';

function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

/* ---------- décor : bâtiments, arbres, poteaux (générés une fois) ---------- */
const DECOR = (() => {
  const r = rng(42), far = [], mid = [];
  let x = 0;
  while (x < 960) { const w = 14 + Math.floor(r() * 26), h = 18 + Math.floor(r() * 44); far.push({x, w, h, win: r()}); x += w + Math.floor(r() * 6); }
  x = 0;
  while (x < 960) { const w = 20 + Math.floor(r() * 30), h = 12 + Math.floor(r() * 14); mid.push({x, w, h, tree: r() > 0.45}); x += w + 6 + Math.floor(r() * 30); }
  return {far, mid};
})();

const Race = {
  active: false, state: 'idle', opp: null, oppIdx: 0,
  t: 0, acc: 0, holding: false, revRpm: IDLE, greenAt: 0,
  pl: null, ai: null, plSpec: null, aiSpec: null, plCar: null,
  msg: '', msgT: 0, particles: [], shake: 0, result: null,
  wheelAng: 0, aiWheelAng: 0, fs: false, rt: null, launchAt: 0, lastShiftQ: 0,

  start(idx) {
    const o = OPPONENTS[idx];
    const cs = Game.car();
    this.oppIdx = idx; this.opp = o;
    this.plCar = cs; this.plSpec = specOf(cs);
    this.aiSpec = makeSpec(o.car, o.engine, o.parts);
    this.pl = createSim(); this.ai = createSim();
    this.launchBest = bestLaunchRpm(this.plSpec);
    this.t = 0; this.acc = 0; this.holding = false; this.revRpm = IDLE;
    this.greenAt = 2.2 + 0.5 + Math.random() * 0.7;
    this.aiReact = 0.18 + (1 - o.skill) * 1.2 + Math.random() * 0.12;
    this.aiShiftFrac = 0.90 + (o.skill - 0.8) * 0.45 + (Math.random() - 0.5) * 0.02;
    this.aiLaunchQ = clamp(0.62 + (o.skill - 0.8) * 2.0 + (Math.random() - 0.5) * 0.06, 0.55, 1);
    this.aiLaunchRpm = this.aiSpec.red * 0.55;
    this.msg = ''; this.msgT = 0; this.particles = []; this.result = null;
    this.fs = false; this.rt = null; this.launchAt = Infinity; this.plLaunchRpm = 0;
    this.state = 'stage'; this.active = true; this.wheelAng = 0; this.aiWheelAng = 0;
    this.shiftCount = 0; this.perfectShifts = 0;
    UI.raceStart();
  },
  stop() { this.active = false; this.state = 'idle'; },

  setMsg(m, c) { this.msg = m; this.msgC = c || '#fff'; this.msgT = 1.4; },

  onDown() {
    if (!this.active) return;
    if (this.state === 'stage') {
      if (this.t >= this.greenAt && !this.pl.launched && this.launchAt === Infinity) this.launchPlayer();
      else if (this.t < this.greenAt) this.holding = true;
    } else if (this.state === 'race' && this.pl.launched && !this.pl.fin) this.shift();
  },
  onUp() {
    if (!this.active) return;
    if (this.state === 'stage' && this.holding) {
      this.holding = false;
      if (this.t >= this.greenAt) { if (!this.pl.launched && this.launchAt === Infinity) this.launchPlayer(); }
      else {                                   // faux départ
        this.fs = true; this.launchAt = this.greenAt + 0.7; this.plLaunchRpm = this.revRpm;
        this.setMsg('FAUX DÉPART ! +0.7s', '#ff4040');
      }
    }
  },
  onNitro() {
    if (this.state === 'race' && this.pl.launched && this.plSpec.nitro && this.pl.nitroLeft > 0) { this.pl.nitroOn = true; this.setMsg('NITRO !', '#40e0ff'); }
  },

  launchPlayer() {
    const rpm = this.revRpm, q = launchQuality(rpm, this.launchBest, this.plSpec.red);
    this.rt = Math.max(0, this.t - this.greenAt);
    this.holding = false;
    this.plLaunchRpm = rpm; this.plLaunchQ = q;
    simLaunch(this.pl, this.plSpec, rpm, q);
    this.pl.startT = this.t;
    this.setMsg(q > 0.95 ? 'DÉPART PARFAIT !' : q > 0.82 ? 'Bon départ' : 'Départ mou...', q > 0.95 ? '#50ff70' : q > 0.82 ? '#ffe050' : '#ff9050');
    this.state = 'race';
  },
  shift() {
    const sp = this.plSpec, s = this.pl, q = s.rpm / sp.red;
    if (s.gear >= sp.gears.length - 1 || s.shiftT > 0) return;
    if (q < 0.6) { this.setMsg('Trop tôt !', '#ff9050'); return; }
    simShift(s, sp, q); this.shiftCount++;
    if (q >= 0.93) { this.perfectShifts++; this.setMsg('PARFAIT !', '#50ff70'); }
    else if (q >= 0.84) this.setMsg('Bien', '#ffe050');
    else this.setMsg('Trop tôt', '#ff9050');
    this.shake = 2;
  },

  step(dt) {
    this.t += dt;
    const o = this.opp;
    if (this.state === 'stage') {
      // régime moteur en phase de lancement
      const lim = this.plSpec.red * 0.98;
      if (this.holding) this.revRpm = Math.min(lim, this.revRpm + 5200 * dt);
      else this.revRpm = Math.max(IDLE, this.revRpm - 7000 * dt);
      if (this.fs && this.t >= this.launchAt && !this.pl.launched) { this.revRpm = this.plLaunchRpm; this.launchPlayer(); this.rt = 0.7; }
      if (this.t >= this.greenAt + 1.6 && !this.pl.launched) { this.revRpm = IDLE; this.launchPlayer(); this.setMsg('Trop lent !', '#ff9050'); }
    }
    // IA
    if (!this.ai.launched && this.t >= this.greenAt + this.aiReact) {
      simLaunch(this.ai, this.aiSpec, this.aiLaunchRpm, this.aiLaunchQ);
    }
    if (this.ai.launched && !this.ai.fin) {
      if (this.aiSpec.nitro && !this.ai.nitroOn && this.ai.t > 0.8) this.ai.nitroOn = true;
      if (this.ai.rpm >= this.aiSpec.red * this.aiShiftFrac) simShift(this.ai, this.aiSpec, 0.9);
    }
    if (this.ai.launched) stepSim(this.ai, this.aiSpec, dt);
    if (this.pl.launched) {
      if (this.pl.nitroLeft <= 0) this.pl.nitroOn = false;
      stepSim(this.pl, this.plSpec, dt);
      if (this.pl.spin && Math.random() < 0.5) this.puff(this.pl, 'pl');
    }
    if (this.ai.spin && Math.random() < 0.3) this.puff(this.ai, 'ai');
    // roues
    const pr = this.plSpec.r, ar = this.aiSpec.r;
    this.wheelAng += (this.pl.spin ? 40 : this.pl.v / pr) * dt;
    this.aiWheelAng += (this.ai.spin ? 40 : this.ai.v / ar) * dt;

    if (this.state === 'race' && this.pl.fin && this.ai.launched && this.ai.fin) this.finish();
    else if (this.state === 'race' && this.pl.fin && !this.ai.launched) this.finish();
    if (this.t > 70 && this.state !== 'done') this.finish();
  },

  puff(sim, who) {
    this.particles.push({who, x: 0, y: 0, vx: -20 - Math.random() * 30, vy: -10 - Math.random() * 20, life: 0.7, max: 0.7, sz: 3 + Math.random() * 4});
  },

  finish() {
    if (this.state === 'done') return;
    this.state = 'done';
    const plT = this.pl.fin ? this.pl.tFin + this.pl.startT - this.greenAt : 99;
    const aiT = this.ai.fin ? this.ai.tFin + this.greenAt + this.aiReact - this.greenAt : 99;
    const win = plT < aiT;
    const bestEt = this.pl.fin ? this.pl.tFin : null;
    this.result = {win, plT, aiT, et: bestEt, rt: this.rt, speed: this.pl.v * 3.6, t100: this.pl.t100, fs: this.fs,
                   perfect: this.perfectShifts, shifts: this.shiftCount, launchQ: this.plLaunchQ || 0};
    Game.raceDone(this.oppIdx, this.result);
    this.setMsg(win ? 'VICTOIRE !' : 'PERDU...', win ? '#50ff70' : '#ff5050'); this.msgT = 3;
    setTimeout(() => { if (this.state === 'done') UI.showResult(this.result); }, 1400);
  },

  update(dt) {
    this.acc += Math.min(dt, 0.05);
    while (this.acc >= STEP) { this.step(STEP); this.acc -= STEP; }
    if (this.msgT > 0) this.msgT -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 10);
    for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    this.particles = this.particles.filter(p => p.life > 0);
  },

  /* ---------------- rendu ---------------- */
  draw(ctx) {
    const cs = this.plCar;
    const dP = this.pl.x, dA = this.ai.x;
    const scrollP = dP * PPM;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const sh = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    ctx.save(); ctx.scale(2, 2); ctx.translate(0, sh);
    drawSky(ctx);
    drawFar(ctx, scrollP * 0.04);
    drawMid(ctx, scrollP * 0.16);
    drawFence(ctx, scrollP * 0.55);
    drawTrack(ctx, scrollP, 1);
    const SL = 195;
    drawLine(ctx, SL - scrollP, '#ffffff');
    const fx = SL + (DIST - dP) * PPM;
    if (fx < W + 40) drawFinish(ctx, fx);
    ctx.restore();

    const plX = 96;
    let aiX = clamp(plX + (dA - dP) * PPM, -190, W + 60);
    const oc = Game.oppColor(this.oppIdx);
    const aiStyle = CARS[this.opp.car].style, plStyle = CARS[cs.id].style;
    const AIG = 200, PLG = 250;
    // voitures en résolution native (sprite x2)
    ctx.save(); ctx.translate(0, sh * 2);
    const aiO = {wheelAng: this.aiWheelAng, lean: clamp(this.ai.accel / 3, 0, 3), speed: this.ai.v};
    const plO = {wheelAng: this.wheelAng, lean: clamp(this.pl.accel / 3, 0, 3), speed: this.pl.v, neon: '62,224,255'};
    // reflets sur le bitume
    for (const [st, col, X, Y, O] of [[aiStyle, oc, aiX * 2, AIG * 2, aiO], [plStyle, cs.color, plX * 2, PLG * 2, plO]]) {
      ctx.save(); ctx.globalAlpha = 0.14; ctx.translate(0, Y * 2 + 2); ctx.scale(1, -1);
      drawCar(ctx, st, col, X, Y, 1, Object.assign({}, O, {lean: 0})); ctx.restore();
    }
    drawCar(ctx, aiStyle, oc, aiX * 2, AIG * 2, 1, aiO);
    drawCarLights(ctx, aiStyle, aiX * 2, AIG * 2, 1, {});
    drawCar(ctx, plStyle, cs.color, plX * 2, PLG * 2, 1, plO);
    drawCarLights(ctx, plStyle, plX * 2, PLG * 2, 1, {neon: '62,224,255', brake: this.state === 'stage'});
    ctx.restore();

    ctx.save(); ctx.scale(2, 2);
    this.drawNitro(ctx, this.ai, aiX, AIG, aiStyle);
    this.drawNitro(ctx, this.pl, plX, PLG, plStyle);
    for (const p of this.particles) {
      const st = p.who === 'pl' ? plStyle : aiStyle;
      const bx = (p.who === 'pl' ? plX : aiX) + PROFILES[st].wheels[0] / 2 - 4, by = (p.who === 'pl' ? PLG : AIG) - 4;
      ctx.globalAlpha = Math.max(0, p.life / p.max) * 0.7;
      ctx.fillStyle = '#d8d8e0';
      const sz = Math.round(p.sz);
      ctx.fillRect(Math.round(bx + p.x), Math.round(by + p.y), sz, sz);
    }
    ctx.globalAlpha = 1;
    if (this.pl.v > 35) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let i = 0; i < 6; i++) { const yy = 150 + ((i * 37 + this.t * 700) % 115), xx = (i * 97 + this.t * 1400) % W; ctx.fillRect(W - xx, Math.round(yy), 60, 1); }
    }
    this.drawHud(ctx);
    ctx.restore();
  },
  drawNitro(ctx, sim, x, y, style) {
    if (!(sim.nitroOn && sim.nitroLeft > 0)) return;
    const f = (Math.random() * 14 + 22);
    ctx.fillStyle = '#ff8020'; ctx.fillRect(x - f, y - 7, f, 3);
    ctx.fillStyle = '#ffe060'; ctx.fillRect(x - f * 0.6, y - 6.5, f * 0.6, 1.5);
    ctx.fillStyle = '#40a0ff'; ctx.fillRect(x - 5, y - 7, 5, 3);
  },

  drawHud(ctx) {
    const sp = this.plSpec, s = this.pl;
    const rpm = this.state === 'stage' ? this.revRpm : s.rpm;
    // feux
    if (this.state === 'stage' || this.t < this.greenAt + 3) this.drawTree(ctx);
    // barre de régime
    const bx = 10, by = 10, bw = 190, bh = 14;
    ctx.fillStyle = 'rgba(8,8,16,0.75)'; ctx.fillRect(bx - 4, by - 4, bw + 8, 78);
    ctx.fillStyle = '#222'; ctx.fillRect(bx, by, bw, bh);
    const red = sp.red;
    const segs = 38;
    for (let i = 0; i < segs; i++) {
      const f = i / segs, rr = f * red * 1.05;
      let c = '#2f9e44';
      if (f > 0.78) c = '#e0c020';
      if (f > 0.9) c = '#e03030';
      const on = rpm >= rr;
      ctx.fillStyle = on ? c : '#3a3a44';
      ctx.fillRect(bx + 1 + i * (bw - 2) / segs, by + 1, (bw - 2) / segs - 1, bh - 2);
    }
    // zone verte de départ
    if (this.state === 'stage') {
      const lo = (this.launchBest - 0.07 * red) / (red * 1.05), hi = (this.launchBest + 0.07 * red) / (red * 1.05);
      ctx.strokeStyle = '#7dff9a'; ctx.lineWidth = 2; ctx.strokeRect(bx + lo * bw, by - 2, (hi - lo) * bw, bh + 4); ctx.lineWidth = 1;
    }
    // zone de passage de vitesse
    if (this.state === 'race' && s.gear < sp.gears.length - 1) {
      const f0 = 0.93 * red / (red * 1.05);
      ctx.strokeStyle = (rpm >= 0.93 * red) ? '#ffffff' : '#8d8d99'; ctx.strokeRect(bx + f0 * bw, by - 2, (1 - f0) * bw, bh + 4);
    }
    ctx.fillStyle = '#fff'; ctx.font = `8px ${FONT}`; ctx.textBaseline = 'top';
    ctx.fillText(Math.round(rpm / 10) * 10 + ' tr/min', bx, by + 20);
    ctx.fillText(Math.round(s.v * 3.6) + ' km/h', bx, by + 34);
    ctx.fillStyle = '#ffd34d'; ctx.font = `14px ${FONT}`;
    ctx.fillText((s.gear + 1) + '', bx + bw - 14, by + 22);
    ctx.font = `8px ${FONT}`; ctx.fillStyle = '#9aa';
    ctx.fillText('VIT.', bx + bw - 52, by + 26);
    // nitro
    if (sp.nitro) {
      ctx.fillStyle = '#9ad'; ctx.fillText('NITRO', bx, by + 50);
      ctx.fillStyle = '#223'; ctx.fillRect(bx + 52, by + 49, 100, 8);
      ctx.fillStyle = '#34c8ff'; ctx.fillRect(bx + 52, by + 49, 100 * (s.nitroLeft < 0 ? 1 : Math.max(0, s.nitroLeft / sp.nitro.dur)), 8);
    }
    // chrono + progression
    const el = s.launched ? (s.fin ? s.tFin : s.t) : 0;
    ctx.fillStyle = 'rgba(8,8,16,0.75)'; ctx.fillRect(W - 134, 6, 128, 40);
    ctx.fillStyle = '#fff'; ctx.font = `12px ${FONT}`; ctx.textAlign = 'right';
    ctx.fillText(el.toFixed(2) + ' s', W - 12, 12);
    ctx.font = `8px ${FONT}`; ctx.fillStyle = '#9ab';
    ctx.fillText(Math.min(402, Math.round(s.x)) + ' / 402 m', W - 12, 32);
    ctx.textAlign = 'left';
    // mini-carte de progression
    const mx = 60, my = H - 12, mw = W - 120;
    ctx.fillStyle = 'rgba(8,8,16,0.7)'; ctx.fillRect(mx - 4, my - 6, mw + 8, 14);
    ctx.fillStyle = '#444'; ctx.fillRect(mx, my, mw, 3);
    ctx.fillStyle = '#e04040'; ctx.fillRect(mx + mw * clamp(this.ai.x / DIST, 0, 1) - 2, my - 3, 5, 8);
    ctx.fillStyle = '#40e060'; ctx.fillRect(mx + mw * clamp(s.x / DIST, 0, 1) - 2, my - 3, 5, 8);
    // message
    if (this.msgT > 0) {
      ctx.globalAlpha = Math.min(1, this.msgT * 2); ctx.textAlign = 'center';
      ctx.font = `16px ${FONT}`; ctx.fillStyle = '#000'; ctx.fillText(this.msg, W / 2 + 2, 82);
      ctx.fillStyle = this.msgC; ctx.fillText(this.msg, W / 2, 80);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
    if (this.state === 'stage') {
      ctx.textAlign = 'center'; ctx.font = `8px ${FONT}`;
      ctx.fillStyle = 'rgba(8,8,16,0.8)'; ctx.fillRect(W / 2 - 200, 106, 400, 24);
      ctx.fillStyle = '#ffd34d';
      ctx.fillText(this.t < this.greenAt ? 'MAINTIENS pour monter dans le cadre vert' : 'RELÂCHE vite !', W / 2, 111);
      ctx.fillStyle = '#c8c8d8'; ctx.fillText('Relâche quand le feu passe au VERT', W / 2, 121);
      ctx.textAlign = 'left';
    }
  },

  drawTree(ctx) {
    const cx = W / 2, top = 8;
    ctx.fillStyle = '#15151c'; ctx.fillRect(cx - 14, top, 28, 62);
    ctx.fillStyle = '#2a2a36'; ctx.fillRect(cx - 14, top, 28, 2);
    for (let i = 0; i < 3; i++) {
      const on = this.t >= 1.0 + 0.6 * i && this.t < this.greenAt + 0.1;
      ctx.fillStyle = on ? '#ffc020' : '#3a2f10'; ctx.beginPath(); ctx.arc(cx, top + 10 + i * 12, 4.5, 0, Math.PI * 2); ctx.fill();
    }
    const g = this.t >= this.greenAt;
    ctx.fillStyle = g ? '#30ff60' : '#103018'; ctx.beginPath(); ctx.arc(cx, top + 47, 6, 0, Math.PI * 2); ctx.fill();
    if (this.fs) { ctx.fillStyle = '#ff2020'; ctx.beginPath(); ctx.arc(cx, top + 47, 6, 0, Math.PI * 2); ctx.fill(); }
  }
};

/* ---------- éléments de décor ---------- */
function drawSky(ctx) {
  if (!SKY) SKY = buildSky();
  ctx.drawImage(SKY, 0, 0, W, 112);
}
function drawFar(ctx, off) {
  const span = 960;
  ctx.fillStyle = '#2a1c4a';
  for (let rep = -1; rep < 2; rep++) for (const b of DECOR.far) {
    const x = Math.round(b.x - (off % span) + rep * span);
    if (x > W || x + b.w < 0) continue;
    ctx.fillRect(x, 112 - b.h, b.w, b.h);
    ctx.fillStyle = '#ffd060';
    for (let wy = 112 - b.h + 4; wy < 108; wy += 6) for (let wx = x + 3; wx < x + b.w - 3; wx += 5) if (((wx * 7 + wy * 13) % 11) / 11 < b.win * 0.6) ctx.fillRect(wx, wy, 2, 2);
    ctx.fillStyle = '#2a1c4a';
  }
}
function drawMid(ctx, off) {
  const span = 960;
  for (let rep = -1; rep < 2; rep++) for (const b of DECOR.mid) {
    const x = Math.round(b.x - (off % span) + rep * span);
    if (x > W || x + b.w < 0) continue;
    if (b.tree) {
      ctx.fillStyle = '#16301f'; ctx.fillRect(x + 4, 128 - b.h, b.w - 8, b.h); ctx.fillRect(x, 128 - b.h + 6, b.w, b.h - 6);
      ctx.fillStyle = '#1f4a2a'; ctx.fillRect(x + 6, 128 - b.h + 2, b.w - 14, 3);
    } else {
      ctx.fillStyle = '#3a2d55'; ctx.fillRect(x, 128 - b.h, b.w, b.h);
      ctx.fillStyle = '#4c3c6e'; ctx.fillRect(x, 128 - b.h, b.w, 2);
    }
  }
  ctx.fillStyle = '#1a2b20'; ctx.fillRect(0, 126, W, 24);
}
function drawFence(ctx, off) {
  ctx.fillStyle = '#242436'; ctx.fillRect(0, 128, W, 22);
  ctx.fillStyle = '#34344c'; ctx.fillRect(0, 128, W, 2);
  // poteaux + projecteurs
  const sp = 150;
  for (let i = -1; i < W / sp + 2; i++) {
    const x = Math.round(i * sp - (off % sp));
    ctx.fillStyle = '#505068'; ctx.fillRect(x, 100, 3, 50);
    ctx.fillStyle = '#ffe9a0'; ctx.fillRect(x - 5, 98, 13, 3);
    ctx.fillStyle = 'rgba(255,233,160,0.10)'; ctx.fillRect(x - 12, 101, 27, 40);
  }
  // grillage
  ctx.fillStyle = '#41415c';
  for (let x = -((off) % 12); x < W; x += 12) ctx.fillRect(Math.round(x), 134, 1, 14);
  ctx.fillRect(0, 134, W, 1); ctx.fillRect(0, 147, W, 1);
  // pubs
  const pw = 90, ps = 300;
  for (let i = -1; i < W / ps + 2; i++) {
    const x = Math.round(i * ps - (off % ps)) + 40;
    ctx.fillStyle = (i & 1) ? '#c02828' : '#2870c0'; ctx.fillRect(x, 136, pw, 10);
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'top'; ctx.font = `6px ${FONT}`; ctx.fillText((i & 1) ? 'NITRO+ ' : 'TUNED TALES', x + 4, 138);
  }
}
function drawTrack(ctx, scroll, run) {
  // herbe / bas côté
  ctx.fillStyle = '#34344a'; ctx.fillRect(0, 150, W, 120);
  // bitume en dégradé de profondeur
  const rows = [[150, '#3b3b4a'], [166, '#3f3f50'], [184, '#444456'], [204, '#4a4a5c'], [226, '#505064'], [248, '#565669']];
  for (let i = 0; i < rows.length; i++) { ctx.fillStyle = rows[i][1]; ctx.fillRect(0, rows[i][0], W, (rows[i + 1] ? rows[i + 1][0] : H) - rows[i][0]); }
  drawAsphalt(ctx, scroll);
  // trottoir/bordures
  const cw = 20;
  for (let x = -((scroll * 0.75) % (cw * 2)); x < W; x += cw * 2) { ctx.fillStyle = '#d8d8e0'; ctx.fillRect(Math.round(x), 150, cw, 3); ctx.fillStyle = '#c03030'; ctx.fillRect(Math.round(x + cw), 150, cw, 3); }
  // séparation des voies (pointillés)
  for (let x = -((scroll) % 60); x < W; x += 60) { ctx.fillStyle = '#e8e8f0'; ctx.fillRect(Math.round(x), 228, 32, 2); }
  // marques d'usure (parallaxe selon la profondeur)
  const r = rng(7);
  for (let i = 0; i < 70; i++) {
    const yy = 154 + Math.floor(r() * 112), sc = 0.7 + (yy - 150) / 120 * 0.6;
    const bx = Math.floor(r() * 1200), w = 6 + Math.floor(r() * 14);
    let x = ((bx - scroll * sc) % 1200 + 1200) % 1200 - 100;
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(Math.round(x), yy, w, 1);
  }
  // pneus gommés au départ
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  const gx = 195 - scroll;
  ctx.fillRect(Math.round(gx), 252, 90, 3); ctx.fillRect(Math.round(gx), 203, 70, 2);
  // bordure basse
  for (let x = -((scroll * 1.2) % 40); x < W; x += 40) { ctx.fillStyle = '#d8d8e0'; ctx.fillRect(Math.round(x), 266, 20, 4); ctx.fillStyle = '#c03030'; ctx.fillRect(Math.round(x + 20), 266, 20, 4); }
}
function drawLine(ctx, x, c) {
  if (x < -20 || x > W + 20) return;
  ctx.fillStyle = c; ctx.fillRect(Math.round(x), 150, 4, 116);
}
function drawFinish(ctx, x) {
  ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(x), 150, 10, 116);
  ctx.fillStyle = '#111';
  for (let y = 150; y < 266; y += 8) { ctx.fillRect(Math.round(x), y, 5, 4); ctx.fillRect(Math.round(x) + 5, y + 4, 5, 4); }
  ctx.fillStyle = '#e8e8f0'; ctx.fillRect(Math.round(x) - 4, 82, 4, 70); ctx.fillRect(Math.round(x) + 10, 82, 4, 70);
  ctx.fillStyle = '#c02828'; ctx.fillRect(Math.round(x) - 4, 82, 18, 14);
  ctx.fillStyle = '#fff'; ctx.font = `8px ${FONT}`; ctx.fillText('402', Math.round(x) - 2, 86);
}

const ASPH = (() => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 240; const x = c.getContext('2d'), r = rng(99);
  for (let i = 0; i < 3200; i++) {
    const v = r();
    x.fillStyle = v < 0.5 ? 'rgba(0,0,0,0.18)' : v < 0.8 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.10)';
    x.fillRect(Math.floor(r() * 512), Math.floor(r() * 240), 1 + (r() < 0.2 ? 1 : 0), 1);
  }
  for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(0,0,0,0.22)'; let px = r() * 512, py = r() * 240; for (let k = 0; k < 18; k++) { x.fillRect(Math.floor(px), Math.floor(py), 1, 1); px += r() * 3 - 0.4; py += r() * 2 - 1; } }
  return c;
})();
function drawAsphalt(ctx, scroll) {
  ctx.save(); ctx.scale(0.5, 0.5);
  for (const [y0, y1, sc] of [[150, 200, 0.8], [200, 270, 1.25]]) {
    const off = Math.floor((scroll * 2 * sc) % 512), h = (y1 - y0) * 2;
    for (let x = -off; x < 960; x += 512) ctx.drawImage(ASPH, 0, 0, 512, h, x, y0 * 2, 512, h);
  }
  ctx.restore();
}

/* ciel de crépuscule pré-rendu en résolution native avec tramage */
let SKY = null;
function buildSky() {
  const c = document.createElement('canvas'); c.width = 960; c.height = 224; const x = c.getContext('2d');
  const stops = [[0, [16, 10, 46]], [0.35, [58, 28, 104]], [0.6, [150, 58, 130]], [0.8, [232, 112, 108]], [1, [255, 196, 120]]];
  const col = t => { for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i], k = (t - a) / (b - a); return ca.map((v, j) => v + (cb[j] - v) * k); } return stops[stops.length - 1][1]; };
  const img = x.createImageData(960, 224);
  for (let yy = 0; yy < 224; yy++) for (let xx = 0; xx < 960; xx++) {
    const t = yy / 223 + bay(xx, yy) * 0.035, cc = col(Math.max(0, Math.min(1, t))), q = 12;
    const i = (yy * 960 + xx) * 4;
    img.data[i] = Math.round(cc[0] / q) * q; img.data[i + 1] = Math.round(cc[1] / q) * q; img.data[i + 2] = Math.round(cc[2] / q) * q; img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const r = rng(3);
  for (let i = 0; i < 140; i++) { const yy = r() * 110; x.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7 * (1 - yy / 110)})`; x.fillRect(Math.floor(r() * 960), Math.floor(yy), 1, 1); }
  // soleil couchant avec halo
  const g = x.createRadialGradient(740, 196, 0, 740, 196, 140); g.addColorStop(0, 'rgba(255,230,160,0.9)'); g.addColorStop(0.25, 'rgba(255,170,110,0.35)'); g.addColorStop(1, 'rgba(255,120,120,0)');
  x.fillStyle = g; x.fillRect(560, 40, 360, 184);
  x.fillStyle = '#fff0c8'; x.beginPath(); x.arc(740, 200, 30, 0, Math.PI * 2); x.fill();
  for (let yy = 178; yy < 224; yy += 7) { x.fillStyle = 'rgba(200,80,110,0.55)'; x.fillRect(700, yy, 80, 2); }
  // nuages effilés
  x.fillStyle = 'rgba(255,170,150,0.25)';
  for (let i = 0; i < 9; i++) { const cx = r() * 960, cy = 70 + r() * 80, w = 80 + r() * 160; x.fillRect(Math.floor(cx), Math.floor(cy), Math.floor(w), 3); x.fillRect(Math.floor(cx + 20), Math.floor(cy - 3), Math.floor(w * 0.6), 3); }
  return c;
}
