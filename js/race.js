/* ============ COURSE DE DRAG : logique, son, décor réaliste en couches, HUD ============ */

const W = 480, H = 270;                 // repère logique (le canvas fait 960x540)
const PPM = 5;                          // pixels logiques par mètre
const FONT = '"Press Start 2P", "Courier New", monospace';
const LAUNCH_ZONE = 0.09;           // demi-largeur de la zone verte (fraction de la zone rouge)
const UIF = '"Chakra Petch", "Segoe UI", sans-serif';

function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

const Race = {
  active: false, state: 'idle', opp: null,
  t: 0, acc: 0, holding: false, revRpm: IDLE, greenAt: 0,
  pl: null, ai: null, plSpec: null, aiSpec: null, plCar: null,
  msg: '', msgT: 0, particles: [], shake: 0, result: null,
  wheelAng: 0, aiWheelAng: 0, fs: false, rt: null, launchAt: 0,
  plV: null, aiV: null,

  start(opp) {
    const cs = Game.car();
    this.opp = opp;
    this.plCar = cs; this.plSpec = specOf(cs);
    this.aiSpec = makeSpec(opp.car, opp.engine, opp.parts);
    this.pl = createSim(); this.ai = createSim();
    this.launchBest = bestLaunchRpm(this.plSpec);
    this.t = 0; this.acc = 0; this.holding = false; this.revRpm = IDLE;
    this.greenAt = 2.2 + 0.5 + Math.random() * 0.7;
    const sk = opp.skill;
    this.aiReact = 0.18 + (1 - sk) * 1.2 + Math.random() * 0.12;
    this.aiShiftFrac = 0.90 + (sk - 0.8) * 0.45 + (Math.random() - 0.5) * 0.02;
    this.aiLaunchQ = clamp(0.62 + (sk - 0.8) * 2.0 + (Math.random() - 0.5) * 0.06, 0.55, 1);
    this.aiLaunchRpm = this.aiSpec.red * 0.55;
    this.msg = ''; this.msgT = 0; this.particles = []; this.result = null;
    this.fs = false; this.rt = null; this.launchAt = Infinity; this.plLaunchRpm = 0;
    this.state = 'stage'; this.active = true; this.wheelAng = 0; this.aiWheelAng = 0;
    this.shiftCount = 0; this.perfectShifts = 0; this.aiGear = 0; this.zoneT = 0; this.countT = 0; this.zoneFrac = 0;
    Sound.stopAll(); this.plV = this.aiV = null;
    Sound.resume();
    UI.raceStart();
  },
  stop() { this.active = false; this.state = 'idle'; Sound.stopAll(); this.plV = this.aiV = null; },

  setMsg(m, c) { this.msg = m; this.msgC = c || '#fff'; this.msgT = 1.4; },

  onDown() {
    if (!this.active) return;
    if (this.state === 'stage') this.holding = true;
    else if (this.state === 'race' && this.pl.launched && !this.pl.fin) this.shift();
  },
  onUp() {
    if (!this.active) return;
    this.holding = false;
  },
  onNitro() {
    if (this.state === 'race' && this.pl.launched && this.plSpec.nitro && this.pl.nitroLeft > 0) { this.pl.nitroOn = true; this.setMsg('NITRO !', '#3ee0ff'); }
  },

  launchPlayer() {
    const rpm = this.revRpm, red = this.plSpec.red, dev = Math.abs(rpm - this.launchBest);
    const q = dev <= LAUNCH_ZONE * red ? 1 - 0.04 * dev / (LAUNCH_ZONE * red) : launchQuality(rpm, this.launchBest, red) * 0.95;
    this.rt = 0;
    this.zoneFrac = this.zoneT / Math.max(0.01, this.countT);
    this.plLaunchRpm = rpm; this.plLaunchQ = q;
    simLaunch(this.pl, this.plSpec, rpm, q);
    this.pl.startT = this.t;
    this.setMsg(q > 0.95 ? 'DÉPART PARFAIT' : q > 0.82 ? 'BON DÉPART' : 'DÉPART MOU', q > 0.95 ? '#4cff8a' : q > 0.82 ? '#ffd34d' : '#ff9a4a');
    this.state = 'race';
  },
  shift() {
    const sp = this.plSpec, s = this.pl, q = s.rpm / sp.red;
    if (s.gear >= sp.gears.length - 1 || s.shiftT > 0) return;
    if (q < 0.6) { this.setMsg('TROP TÔT', '#ff9a4a'); return; }
    simShift(s, sp, q); this.shiftCount++;
    Sound.shift(this.plV);
    if (q >= 0.93) { this.perfectShifts++; this.setMsg('PARFAIT', '#4cff8a'); }
    else if (q >= 0.84) this.setMsg('BIEN', '#ffd34d');
    else this.setMsg('UN PEU TÔT', '#ff9a4a');
    this.shake = 2;
  },

  step(dt) {
    this.t += dt;
    if (this.state === 'stage') {
      const red = this.plSpec.red, lim = red * 0.98;
      if (this.holding) this.revRpm = Math.min(lim, this.revRpm + 3400 * dt);
      else this.revRpm = Math.max(IDLE, this.revRpm - 3000 * dt);
      // temps passé dans la zone verte pendant le compte à rebours (à partir du 1er feu orange)
      if (this.t >= 1.0) { this.countT += dt; if (Math.abs(this.revRpm - this.launchBest) <= LAUNCH_ZONE * red) this.zoneT += dt; }
      if (this.t >= this.greenAt && !this.pl.launched) this.launchPlayer();
    }
    if (!this.ai.launched && this.t >= this.greenAt + this.aiReact) simLaunch(this.ai, this.aiSpec, this.aiLaunchRpm, this.aiLaunchQ);
    if (this.ai.launched && !this.ai.fin) {
      if (this.aiSpec.nitro && !this.ai.nitroOn && this.ai.t > 0.8) this.ai.nitroOn = true;
      if (this.ai.rpm >= this.aiSpec.red * this.aiShiftFrac) simShift(this.ai, this.aiSpec, 0.9);
      if (this.ai.gear !== this.aiGear) { this.aiGear = this.ai.gear; Sound.shift(this.aiV); }
    }
    if (this.ai.launched) stepSim(this.ai, this.aiSpec, dt);
    if (this.pl.launched) {
      if (this.pl.nitroLeft <= 0) this.pl.nitroOn = false;
      stepSim(this.pl, this.plSpec, dt);
      if (this.pl.spin && Math.random() < 0.5) this.puff('pl');
    }
    if (this.ai.spin && Math.random() < 0.3) this.puff('ai');
    this.wheelAng += (this.pl.spin ? 40 : this.pl.v / this.plSpec.r) * dt;
    this.aiWheelAng += (this.ai.spin ? 40 : this.ai.v / this.aiSpec.r) * dt;
    if (this.state === 'race' && this.pl.fin && (!this.ai.launched || this.ai.fin)) this.finish();
    if (this.t > 70 && this.state !== 'done') this.finish();
  },

  puff(who) { this.particles.push({who, x: 0, y: 0, vx: -20 - Math.random() * 30, vy: -10 - Math.random() * 20, life: 0.8, max: 0.8, sz: 3 + Math.random() * 5}); },

  finish() {
    if (this.state === 'done') return;
    this.state = 'done';
    const plT = this.pl.fin ? this.pl.tFin + this.pl.startT - this.greenAt : 99;
    const aiT = this.ai.fin ? this.ai.tFin + this.aiReact : 99;
    const win = plT < aiT;
    this.result = {win, plT, aiT, et: this.pl.fin ? this.pl.tFin : null, rt: this.rt, speed: this.pl.v * 3.6, t100: this.pl.t100, fs: this.fs,
                   perfect: this.perfectShifts, shifts: this.shiftCount, launchQ: this.plLaunchQ || 0, zone: this.zoneFrac};
    Game.raceDone(this.opp, this.result);
    this.setMsg(win ? 'VICTOIRE' : 'DÉFAITE', win ? '#4cff8a' : '#ff4a5a'); this.msgT = 3;
    setTimeout(() => { if (this.state === 'done') { Sound.stopAll(); this.plV = this.aiV = null; UI.showResult(this.result); } }, 1600);
  },

  updateSound() {
    if (!Sound.ready) return;
    if (!this.plV) this.plV = Sound.engine(this.plCar.engine, this.plCar.parts, {vol: 1});
    if (!this.aiV) this.aiV = Sound.engine(this.opp.engine, this.opp.parts, {vol: 0.38, distant: true});
    const s = this.pl, a = this.ai, sp = this.plSpec;
    if (this.state === 'stage' && !s.launched) Sound.update(this.plV, this.revRpm, this.holding ? 1 : 0.12, false, this.revRpm >= sp.red * 0.97);
    else Sound.update(this.plV, s.rpm, this.state === 'done' ? 0.05 : s.shiftT > 0 ? 0.15 : 1, s.spin, s.limiter);
    const aiStageRpm = this.t > 1 ? this.aiLaunchRpm * (0.92 + Math.sin(this.t * 9) * 0.05) : IDLE;
    Sound.update(this.aiV, a.launched ? a.rpm : aiStageRpm, a.launched ? (a.fin || this.state === 'done' ? 0.05 : a.shiftT > 0 ? 0.15 : 1) : (this.t > 1 ? 0.8 : 0.1), a.spin, a.limiter);
  },

  update(dt) {
    this.acc += Math.min(dt, 0.05);
    while (this.acc >= STEP) { this.step(STEP); this.acc -= STEP; }
    if (this.msgT > 0) this.msgT -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 10);
    for (const p of this.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.sz += dt * 10; }
    this.particles = this.particles.filter(p => p.life > 0);
    this.updateSound();
  },

  /* ---------------- rendu ---------------- */
  draw(ctx) {
    const cs = this.plCar, dP = this.pl.x, dA = this.ai.x;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const sh = this.shake > 0 ? Math.round((Math.random() - 0.5) * this.shake * 2) : 0;
    ctx.save(); ctx.translate(0, sh);
    drawEnvironment(ctx, dP, this.t);

    const plX = 96, AIG = 200, PLG = 250;
    const aiX = clamp(plX + (dA - dP) * PPM, -190, W + 60);
    const aiStyle = CARS[this.opp.car].style, plStyle = CARS[cs.id].style, oc = this.opp.color;
    const aiO = {wheelAng: this.aiWheelAng, lean: clamp(this.ai.accel / 3, 0, 3), speed: this.ai.v};
    const plO = {wheelAng: this.wheelAng, lean: clamp(this.pl.accel / 3, 0, 3), speed: this.pl.v};
    for (const [st, col, X, Y, O] of [[aiStyle, oc, aiX * 2, AIG * 2, aiO], [plStyle, cs.color, plX * 2, PLG * 2, plO]]) {
      ctx.save(); ctx.globalAlpha = 0.16; ctx.translate(0, Y * 2 + 2); ctx.scale(1, -1);
      drawCar(ctx, st, col, X, Y, 1, Object.assign({}, O, {lean: 0})); ctx.restore();
    }
    drawCar(ctx, aiStyle, oc, aiX * 2, AIG * 2, 1, aiO);
    drawCarLights(ctx, aiStyle, aiX * 2, AIG * 2, 1, {brake: !this.ai.launched});
    this.drawNitro(ctx, this.ai, aiX * 2, AIG * 2);
    drawCar(ctx, plStyle, cs.color, plX * 2, PLG * 2, 1, plO);
    drawCarLights(ctx, plStyle, plX * 2, PLG * 2, 1, {neon: '62,224,255', brake: this.state === 'stage'});
    this.drawNitro(ctx, this.pl, plX * 2, PLG * 2);
    // fumée de pneus
    for (const p of this.particles) {
      const st = p.who === 'pl' ? plStyle : aiStyle;
      const bx = ((p.who === 'pl' ? plX : aiX) + PROFILES[st].wheels[0] / 2 - 4) * 2, by = ((p.who === 'pl' ? PLG : AIG) - 4) * 2;
      const a = Math.max(0, p.life / p.max) * 0.55, r = p.sz * 2;
      const g = ctx.createRadialGradient(bx + p.x * 2, by + p.y * 2, 0, bx + p.x * 2, by + p.y * 2, r);
      g.addColorStop(0, `rgba(225,225,235,${a})`); g.addColorStop(1, 'rgba(225,225,235,0)');
      ctx.fillStyle = g; ctx.fillRect(bx + p.x * 2 - r, by + p.y * 2 - r, r * 2, r * 2);
    }
    // traits de vitesse
    if (this.pl.v > 30) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.18, (this.pl.v - 30) / 200)})`;
      for (let i = 0; i < 10; i++) { const yy = 300 + ((i * 53 + this.t * 900) % 230), xx = (i * 197 + this.t * 2600) % 960; ctx.fillRect(960 - xx, Math.round(yy), 90, 1); }
    }
    ctx.restore();
    this.drawHud(ctx);
  },
  drawNitro(ctx, sim, x, y) {
    if (!(sim.nitroOn && sim.nitroLeft > 0)) return;
    const f = Math.random() * 30 + 46;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x - 10, y - 13, 0, x - 10, y - 13, f);
    g.addColorStop(0, 'rgba(120,200,255,0.9)'); g.addColorStop(0.35, 'rgba(255,140,40,0.6)'); g.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x - f * 0.6, y - 13, f, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },

  /* ---------------- HUD (résolution native) ---------------- */
  drawHud(ctx) {
    const sp = this.plSpec, s = this.pl, red = sp.red;
    const rpm = this.state === 'stage' ? this.revRpm : s.rpm;
    // --- compte-tours ---
    const px = 16, py = 14, pw = 250, ph = 196;
    glassPanel(ctx, px, py, pw, ph);
    const cx = px + 125, cy = py + 118, R = 82, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
    const maxR = Math.ceil(red / 1000 + 1) * 1000, ang = v => a0 + (a1 - a0) * clamp(v / maxR, 0, 1);
    ctx.lineCap = 'butt';
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(cx, cy, R, a0, a1); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,74,90,0.85)'; ctx.beginPath(); ctx.arc(cx, cy, R, ang(red), a1); ctx.stroke();
    if (this.state === 'stage') { ctx.strokeStyle = '#4cff8a'; ctx.beginPath(); ctx.arc(cx, cy, R, ang(this.launchBest - LAUNCH_ZONE * red), ang(this.launchBest + LAUNCH_ZONE * red)); ctx.stroke(); }
    else if (s.gear < sp.gears.length - 1) { ctx.strokeStyle = rpm >= 0.93 * red ? '#ffffff' : 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(cx, cy, R, ang(0.93 * red), ang(red)); ctx.stroke(); }
    // arc de régime actuel
    const grd = ctx.createLinearGradient(cx - R, 0, cx + R, 0); grd.addColorStop(0, '#ff3d9a'); grd.addColorStop(1, '#ff9a2e');
    ctx.lineWidth = 4; ctx.strokeStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, R - 10, a0, ang(rpm)); ctx.stroke();
    // graduations
    ctx.fillStyle = '#c9cdf0'; ctx.font = `600 13px ${UIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let r = 0; r <= maxR; r += 1000) {
      const a = ang(r), c = Math.cos(a), si = Math.sin(a);
      ctx.strokeStyle = r >= red ? '#ff4a5a' : '#e8ebff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + c * (R - 20), cy + si * (R - 20)); ctx.lineTo(cx + c * (R - 13), cy + si * (R - 13)); ctx.stroke();
      ctx.fillText(r / 1000, cx + c * (R - 31), cy + si * (R - 31));
    }
    // aiguille
    const na = ang(rpm);
    ctx.save(); ctx.shadowColor = 'rgba(255,120,40,0.8)'; ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ff7a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - Math.cos(na) * 12, cy - Math.sin(na) * 12); ctx.lineTo(cx + Math.cos(na) * (R - 6), cy + Math.sin(na) * (R - 6)); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#1a1c38'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,154,46,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `700 34px ${UIF}`; ctx.fillText(s.gear + 1, cx, cy + 1);
    ctx.font = `700 26px ${UIF}`; ctx.fillText(Math.round(s.v * 3.6), cx, cy + 56);
    ctx.fillStyle = '#9097c0'; ctx.font = `600 11px ${UIF}`; ctx.fillText('KM/H', cx, cy + 75);
    // LED de passage
    const leds = 9;
    for (let i = 0; i < leds; i++) {
      const th = red * (0.7 + 0.23 * i / (leds - 1)), on = rpm >= th;
      const flash = rpm >= 0.93 * red && Math.floor(performance.now() / 70) % 2;
      const col = flash ? '#5fb0ff' : i < 3 ? '#4cff8a' : i < 6 ? '#ffd34d' : '#ff4a5a';
      ctx.fillStyle = on ? col : 'rgba(255,255,255,0.1)';
      if (on) { ctx.shadowColor = col; ctx.shadowBlur = 8; }
      ctx.beginPath(); ctx.arc(cx - 64 + i * 16, py + 16, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    // nitro
    if (sp.nitro) {
      const nl = s.nitroLeft < 0 ? 1 : Math.max(0, s.nitroLeft / sp.nitro.dur);
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; roundRect(ctx, px + 14, py + ph - 14, pw - 28, 6, 3); ctx.fill();
      ctx.fillStyle = '#3ee0ff'; roundRect(ctx, px + 14, py + ph - 14, (pw - 28) * nl, 6, 3); ctx.fill();
    }
    // --- chrono / écart ---
    const el = s.launched ? (s.fin ? s.tFin : s.t) : 0;
    const qx = 960 - 16 - 230;
    glassPanel(ctx, qx, 14, 230, 112);
    ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = `700 40px ${UIF}`; ctx.fillText(el.toFixed(2), qx + 196, 52);
    ctx.fillStyle = '#9097c0'; ctx.font = `600 14px ${UIF}`; ctx.fillText('s', qx + 212, 58);
    ctx.textAlign = 'left'; ctx.fillStyle = '#9097c0'; ctx.font = `600 13px ${UIF}`;
    ctx.fillText(`${Math.min(402, Math.round(s.x))} / 402 m`, qx + 16, 88);
    const gap = s.x - this.ai.x, gc = gap >= 0 ? '#4cff8a' : '#ff4a5a';
    ctx.textAlign = 'right'; ctx.fillStyle = gc; ctx.font = `700 15px ${UIF}`;
    ctx.fillText(`${gap >= 0 ? '+' : '−'}${Math.abs(gap).toFixed(1)} m`, qx + 214, 88);
    ctx.fillStyle = '#c9cdf0'; ctx.font = `600 12px ${UIF}`; ctx.textAlign = 'left';
    ctx.fillText(`vs ${this.opp.name} · ${CARS[this.opp.car].name}`, qx + 16, 110);
    // --- barre de progression ---
    const mx = 300, my = 520, mw = 360;
    ctx.fillStyle = 'rgba(10,12,30,0.65)'; roundRect(ctx, mx - 10, my - 12, mw + 20, 24, 12); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(mx, my - 1, mw, 2);
    for (const [x, c] of [[this.ai.x, oc(this.opp.color)], [s.x, '#3ee0ff']]) {
      const X = mx + mw * clamp(x / DIST, 0, 1); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X, my, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fff'; ctx.fillRect(mx + mw, my - 8, 2, 16);
    // --- arbre de départ ---
    if (this.state === 'stage' || this.t < this.greenAt + 2.5) this.drawTree(ctx);
    // --- consigne de départ ---
    if (this.state === 'stage') {
      const inZone = Math.abs(this.revRpm - this.launchBest) <= LAUNCH_ZONE * red;
      const txt = this.t < 1.0 ? 'Accélère et place l\'aiguille dans la zone verte' : inZone ? '✓ DANS LE VERT — tiens-la jusqu\'au feu vert' : (this.revRpm < this.launchBest ? '▲ Accélère un peu (maintiens)' : '▼ Trop haut, relâche un peu');
      ctx.font = `700 17px ${UIF}`; const tw = ctx.measureText(txt).width + 40;
      ctx.fillStyle = 'rgba(10,12,30,0.75)'; roundRect(ctx, 480 - tw / 2, 214, tw, 34, 17); ctx.fill();
      ctx.strokeStyle = 'rgba(255,211,77,0.5)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = inZone ? '#4cff8a' : '#ffd34d'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 480, 232);
    }
    // --- message ---
    if (this.msgT > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, this.msgT * 2.5);
      const k = 1 + Math.max(0, this.msgT - 1.2) * 0.8;
      ctx.translate(480, 300); ctx.scale(k, k);
      ctx.font = `italic 700 46px ${UIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(5,6,16,0.85)'; ctx.strokeText(this.msg, 0, 0);
      ctx.shadowColor = this.msgC; ctx.shadowBlur = 24; ctx.fillStyle = this.msgC; ctx.fillText(this.msg, 0, 0);
      ctx.restore();
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  },

  drawTree(ctx) {
    const cx = 480, top = 14;
    ctx.fillStyle = '#2a2d3c'; ctx.fillRect(cx - 4, top + 150, 8, 40);
    glassPanel(ctx, cx - 34, top, 68, 156, '#0b0c16');
    const bulb = (y, on, col, r) => {
      ctx.fillStyle = on ? col : 'rgba(255,255,255,0.07)';
      if (on) { ctx.shadowColor = col; ctx.shadowBlur = 18; }
      ctx.beginPath(); ctx.arc(cx - 14, y, r, 0, Math.PI * 2); ctx.arc(cx + 14, y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    };
    bulb(top + 16, true, '#f2f2ff', 5);                                    // pré-stage / stage
    for (let i = 0; i < 3; i++) bulb(top + 42 + i * 26, this.t >= 1.0 + 0.6 * i && this.t < this.greenAt + 0.1, '#ffb11c', 9);
    bulb(top + 122, this.t >= this.greenAt && !this.fs, '#2bff5c', 10);
    if (this.fs) bulb(top + 142, true, '#ff2a2a', 7);
  }
};

function oc(c) { return c; }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function glassPanel(ctx, x, y, w, h, bg) {
  ctx.save();
  ctx.fillStyle = bg || 'rgba(12,14,34,0.72)'; roundRect(ctx, x, y, w, h, 14); ctx.fill();
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,154,46,0.55)'); g.addColorStop(0.5, 'rgba(130,140,255,0.18)'); g.addColorStop(1, 'rgba(255,61,154,0.45)');
  ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

/* ==================== DÉCOR RÉALISTE (couches pré-rendues, résolution native) ==================== */
const ENV = {};
function envBuild() {
  if (ENV.ok) return;
  ENV.sky = buildSky(); ENV.city = buildCity(); ENV.trees = buildTrees(); ENV.stands = buildStands();
  ENV.wall = buildWall(); ENV.track = buildTrackBase(); ENV.asph = buildAsphalt(); ENV.ok = true;
}
function tile(ctx, img, off, y) {
  const w = img.width; let x = -(((off % w) + w) % w);
  for (; x < 960; x += w) ctx.drawImage(img, Math.round(x), y);
}
function drawEnvironment(ctx, dP, t) {
  envBuild();
  const S = dP * PPM * 2;                       // défilement en pixels natifs (voie proche)
  ctx.drawImage(ENV.sky, 0, 0);
  tile(ctx, ENV.city, S * 0.03, 72);
  tile(ctx, ENV.trees, S * 0.12, 120);
  // halos des projecteurs
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const tx of ENV.towers) {
    let x = ((tx - S * 0.12) % 1920 + 1920) % 1920; if (x > 980) x -= 1920;
    if (x < -120 || x > 1080) continue;
    const g = ctx.createRadialGradient(x, 132, 0, x, 132, 90); g.addColorStop(0, 'rgba(255,240,200,0.55)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 90, 42, 180, 180);
    const b = ctx.createLinearGradient(0, 140, 0, 520); b.addColorStop(0, 'rgba(255,236,190,0.10)'); b.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = b; ctx.beginPath(); ctx.moveTo(x - 16, 140); ctx.lineTo(x + 16, 140); ctx.lineTo(x + 150, 540); ctx.lineTo(x - 150, 540); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  tile(ctx, ENV.stands, S * 0.4, 196);
  tile(ctx, ENV.wall, S * 0.8, 256);
  ctx.drawImage(ENV.track, 0, 300);
  // texture du bitume (2 profondeurs)
  for (const [y0, h, f] of [[304, 100, 0.85], [404, 128, 1.0]]) {
    const w = ENV.asph.width, off = ((S * f) % w + w) % w;
    for (let x = -off; x < 960; x += w) ctx.drawImage(ENV.asph, 0, y0 - 300, w, h, Math.round(x), y0, w, h);
  }
  // bordures qui défilent
  for (let x = -((S * 0.85) % 48); x < 960; x += 48) { ctx.fillStyle = '#e6e6ee'; ctx.fillRect(Math.round(x), 300, 24, 4); ctx.fillStyle = '#c62f3a'; ctx.fillRect(Math.round(x + 24), 300, 24, 4); }
  for (let x = -((S * 1.1) % 64); x < 960; x += 64) { ctx.fillStyle = '#e6e6ee'; ctx.fillRect(Math.round(x), 532, 32, 8); ctx.fillStyle = '#c62f3a'; ctx.fillRect(Math.round(x + 32), 532, 32, 8); }
  // joints de dalles
  for (let x = -((S) % 220); x < 960; x += 220) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(Math.round(x), 456, 1, 76); ctx.fillRect(Math.round(x - 40), 306, 1, 146); }
  // éléments du monde : burnout box, ligne de départ, panneaux de distance, arrivée
  const wx = m => 390 + (m - dP) * PPM * 2;
  const bx0 = wx(-30), bx1 = wx(-2);
  if (bx1 > 0 && bx0 < 960) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(Math.round(bx0), 380, Math.round(bx1 - bx0), 26); ctx.fillRect(Math.round(bx0), 480, Math.round(bx1 - bx0), 26); }
  const rub = wx(0);
  if (rub < 1000) { const g = ctx.createLinearGradient(rub, 0, rub + 700, 0); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(Math.round(rub), 386, 700, 16); ctx.fillRect(Math.round(rub), 486, 700, 16); }
  const sl = wx(0); if (sl > -10 && sl < 970) { ctx.fillStyle = '#f4f4fa'; ctx.fillRect(Math.round(sl), 304, 6, 228); }
  for (const m of [18.3, 100, 200, 300]) {
    const x = wx(m); if (x < -60 || x > 1020) continue;
    ctx.fillStyle = '#1c1e2c'; ctx.fillRect(Math.round(x) - 2, 230, 4, 40);
    ctx.fillStyle = '#ffd34d'; roundRect(ctx, Math.round(x) - 28, 210, 56, 24, 4); ctx.fill();
    ctx.fillStyle = '#111'; ctx.font = `700 15px ${UIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(m === 18.3 ? '60 ft' : m + ' m', Math.round(x), 222);
  }
  const fx = wx(DIST);
  if (fx < 1000) {
    ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(fx), 304, 16, 228);
    ctx.fillStyle = '#111'; for (let y = 304; y < 532; y += 8) { ctx.fillRect(Math.round(fx), y, 8, 4); ctx.fillRect(Math.round(fx) + 8, y + 4, 8, 4); }
    ctx.fillStyle = '#2a2d3c'; ctx.fillRect(Math.round(fx) - 6, 150, 6, 154); ctx.fillRect(Math.round(fx) + 16, 150, 6, 154);
    ctx.fillStyle = '#c62f3a'; ctx.fillRect(Math.round(fx) - 6, 150, 28, 30);
    ctx.fillStyle = '#fff'; ctx.font = `700 14px ${UIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('402', Math.round(fx) + 8, 165);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

/* ---- ciel de crépuscule ---- */
function buildSky() {
  const c = mkCanvas(960, 300), x = c.getContext('2d');
  const stops = [[0, [12, 8, 36]], [0.3, [44, 22, 86]], [0.55, [120, 50, 124]], [0.75, [214, 96, 112]], [0.9, [250, 160, 112]], [1, [255, 204, 140]]];
  const col = t => { for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i], k = (t - a) / (b - a); return ca.map((v, j) => v + (cb[j] - v) * k); } return stops[stops.length - 1][1]; };
  const img = x.createImageData(960, 300);
  for (let yy = 0; yy < 300; yy++) for (let xx = 0; xx < 960; xx++) {
    const t = yy / 299 + bay(xx, yy) * 0.025, cc = col(clamp(t, 0, 1)), q = 6, i = (yy * 960 + xx) * 4;
    img.data[i] = Math.round(cc[0] / q) * q; img.data[i + 1] = Math.round(cc[1] / q) * q; img.data[i + 2] = Math.round(cc[2] / q) * q; img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const r = rng(3);
  for (let i = 0; i < 220; i++) { const yy = r() * 130; x.fillStyle = `rgba(255,255,255,${(0.2 + r() * 0.8) * (1 - yy / 130)})`; x.fillRect(Math.floor(r() * 960), Math.floor(yy), 1, 1); }
  const g = x.createRadialGradient(720, 250, 0, 720, 250, 220); g.addColorStop(0, 'rgba(255,236,170,0.95)'); g.addColorStop(0.2, 'rgba(255,180,120,0.45)'); g.addColorStop(1, 'rgba(255,120,120,0)');
  x.fillStyle = g; x.fillRect(480, 30, 480, 270);
  x.fillStyle = '#fff3d0'; x.beginPath(); x.arc(720, 254, 34, 0, Math.PI * 2); x.fill();
  // nuages stratifiés éclairés par dessous
  for (let i = 0; i < 16; i++) {
    const cx = r() * 960, cy = 60 + r() * 150, w = 120 + r() * 260, hh = 3 + r() * 5;
    x.fillStyle = `rgba(${cy > 140 ? '255,170,140' : '170,110,170'},${0.18 + r() * 0.2})`;
    x.fillRect(Math.floor(cx), Math.floor(cy), Math.floor(w), Math.floor(hh));
    x.fillStyle = 'rgba(255,210,170,0.25)'; x.fillRect(Math.floor(cx + 10), Math.floor(cy + hh), Math.floor(w * 0.7), 1);
  }
  return c;
}
/* ---- ville lointaine (2 plans, brume atmosphérique) ---- */
function buildCity() {
  const W2 = 1920, Hc = 200, c = mkCanvas(W2, Hc), x = c.getContext('2d'), r = rng(21);
  const rows = [{top: [64, 46, 104], bot: [112, 66, 120], hMin: 60, hMax: 175, win: 0.12, light: 0.45},
                {top: [26, 22, 52], bot: [40, 30, 66], hMin: 26, hMax: 120, win: 0.32, light: 0.9}];
  for (const R of rows) {
    let px = 0;
    while (px < W2) {
      const w = 22 + Math.floor(r() * 64), h = R.hMin + Math.floor(r() * (R.hMax - R.hMin)), y0 = Hc - h;
      for (const ox of [px, px - W2]) {
        const g = x.createLinearGradient(0, y0, 0, Hc); g.addColorStop(0, `rgb(${R.top})`); g.addColorStop(1, `rgb(${R.bot})`);
        x.fillStyle = g; x.fillRect(ox, y0, w, h);
        x.fillStyle = 'rgba(255,170,140,0.22)'; x.fillRect(ox + w - 2, y0, 2, h);           // liseré du couchant
        x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(ox, y0, 3, h);
      }
      if (r() < 0.35) { const ax = px + Math.floor(w / 2), ah = 8 + Math.floor(r() * 26); x.fillStyle = `rgb(${R.top})`; x.fillRect(ax, y0 - ah, 2, ah); x.fillStyle = '#ff3346'; x.fillRect(ax, y0 - ah - 2, 2, 2); }
      if (r() < 0.2) { x.fillStyle = `rgb(${R.top})`; x.fillRect(px + 4, y0 - 6, 10, 6); }
      const cols = ['255,214,130', '255,236,190', '160,210,255', '255,190,120'];
      for (let wy = y0 + 5; wy < Hc - 4; wy += 6) for (let wx = px + 3; wx < px + w - 3; wx += 5) if (r() < R.win) {
        x.fillStyle = `rgba(${cols[Math.floor(r() * 4)]},${R.light * (0.5 + r() * 0.5)})`; x.fillRect(wx, wy, 2, 3);
      }
      px += w + Math.floor(r() * 5);
    }
  }
  const hz = x.createLinearGradient(0, 90, 0, Hc); hz.addColorStop(0, 'rgba(236,120,128,0)'); hz.addColorStop(1, 'rgba(236,120,128,0.38)');
  x.fillStyle = hz; x.fillRect(0, 90, W2, Hc - 90);
  return c;
}
/* ---- arbres et pylônes d'éclairage ---- */
function buildTrees() {
  const W2 = 1920, Hc = 170, c = mkCanvas(W2, Hc), x = c.getContext('2d'), r = rng(8);
  const pal = ['#0b1a1f', '#10252a', '#153033', '#1b3b3c'];
  for (let i = 0; i < 260; i++) {
    const cx = r() * W2, rad = 8 + r() * 26, cy = Hc - 6 - r() * 40 - rad * 0.4;
    for (const ox of [cx, cx - W2, cx + W2]) {
      for (let yy = -rad; yy <= rad; yy++) for (let xx = -rad; xx <= rad; xx++) {
        const d = (xx * xx + yy * yy) / (rad * rad); if (d > 1) continue;
        const px = Math.floor(ox + xx), py = Math.floor(cy + yy);
        if (d > 0.75 && (bay(px, py) + 0.5) < (d - 0.75) * 4) continue;
        const shade = clamp(Math.floor((1 - (yy + rad) / (2 * rad)) * 3 + (xx > 0 ? 0.6 : 0) + bay(px, py)), 0, 3);
        x.fillStyle = pal[shade]; x.fillRect(px, py, 1, 1);
      }
    }
  }
  x.fillStyle = '#0a161a'; x.fillRect(0, Hc - 10, W2, 10);
  ENV.towers = [];
  for (let tx = 160; tx < W2; tx += 480) {
    ENV.towers.push(tx);
    x.fillStyle = '#20232f'; x.fillRect(tx - 2, 18, 5, Hc - 18);
    for (let yy = 30; yy < Hc; yy += 12) { x.fillStyle = '#2d3140'; x.fillRect(tx - 4, yy, 9, 1); }
    x.fillStyle = '#2a2d3c'; x.fillRect(tx - 22, 4, 45, 18);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { x.fillStyle = '#fff7da'; x.fillRect(tx - 19 + i * 11, 7 + j * 8, 8, 5); }
  }
  return c;
}
/* ---- tribunes avec public ---- */
function buildStands() {
  const W2 = 1920, Hc = 96, c = mkCanvas(W2, Hc), x = c.getContext('2d'), r = rng(5);
  const shirts = ['#c63d4a', '#2f6fd0', '#e8e8f0', '#f2b233', '#2b2b33', '#38a85a', '#8a49c8', '#ef7a2f'], skin = ['#f1c7a3', '#d9a47b', '#a86e48', '#6d4630'];
  for (let sx = 40; sx < W2; sx += 640) {
    const w = 520;
    x.fillStyle = '#1d1f2c'; x.fillRect(sx, 14, w, Hc - 14);
    for (let row = 0; row < 9; row++) {
      const y = 22 + row * 8;
      x.fillStyle = row % 2 ? '#2a2d3d' : '#323648'; x.fillRect(sx + 6, y + 5, w - 12, 3);
      for (let px = sx + 8; px < sx + w - 8; px += 4) {
        if (r() < 0.72) {
          const sk = skin[Math.floor(r() * 4)], sh = shirts[Math.floor(r() * shirts.length)];
          const dim = 0.55 + row * 0.04;
          x.globalAlpha = dim; x.fillStyle = sh; x.fillRect(px, y + 2, 3, 3); x.fillStyle = sk; x.fillRect(px + 1, y, 2, 2);
          if (r() < 0.05) { x.fillStyle = '#fff'; x.fillRect(px + 1, y - 3, 1, 3); }   // bras levé / drapeau
          x.globalAlpha = 1;
        }
      }
    }
    x.fillStyle = '#121420'; x.fillRect(sx - 8, 6, w + 16, 8);                       // toit
    x.fillStyle = '#3a3e52'; x.fillRect(sx - 8, 6, w + 16, 1);
    for (let p = sx; p <= sx + w; p += 104) { x.fillStyle = '#121420'; x.fillRect(p, 14, 3, Hc - 14); }
    x.fillStyle = 'rgba(255,240,200,0.10)'; x.fillRect(sx, 14, w, 6);
    // écran géant
    x.fillStyle = '#0c0d14'; x.fillRect(sx + w / 2 - 50, 0, 100, 18);
    x.fillStyle = '#ff9a2e'; x.font = '700 11px "Chakra Petch", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TUNED TALES · 402 m', sx + w / 2, 9);
  }
  const hz = x.createLinearGradient(0, 0, 0, Hc); hz.addColorStop(0, 'rgba(120,70,120,0.25)'); hz.addColorStop(1, 'rgba(120,70,120,0)');
  x.fillStyle = hz; x.fillRect(0, 0, W2, Hc);
  return c;
}
/* ---- mur béton, grillage, panneaux sponsors ---- */
function buildWall() {
  const W2 = 1920, Hc = 46, c = mkCanvas(W2, Hc), x = c.getContext('2d'), r = rng(9);
  x.strokeStyle = 'rgba(160,170,200,0.35)'; x.lineWidth = 1;
  for (let px = 0; px < W2; px += 10) { x.beginPath(); x.moveTo(px + 0.5, 0); x.lineTo(px + 0.5, 22); x.stroke(); }
  for (let py = 2; py < 22; py += 6) { x.fillStyle = 'rgba(160,170,200,0.15)'; x.fillRect(0, py, W2, 1); }
  for (let px = 0; px < W2; px += 120) { x.fillStyle = '#4a4f63'; x.fillRect(px, 0, 3, 22); }
  const g = x.createLinearGradient(0, 22, 0, Hc); g.addColorStop(0, '#8d93a8'); g.addColorStop(0.15, '#6c7186'); g.addColorStop(1, '#3d4153');
  x.fillStyle = g; x.fillRect(0, 22, W2, Hc - 22);
  for (let i = 0; i < 2600; i++) { x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.06)'; x.fillRect(Math.floor(r() * W2), 22 + Math.floor(r() * 24), 1, 1); }
  for (let px = 0; px < W2; px += 80) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(px, 22, 1, 24); }
  const ads = [['TUNED TALES', '#ff9a2e', '#1a1020'], ['NITRO+', '#ffffff', '#1d4fc2'], ['DRAG CITY', '#111', '#ffd34d'], ['402 CLUB', '#fff', '#c62f3a'], ['TURBO FIX', '#0c1a20', '#3ee0ff'], ['GRIP MAX', '#fff', '#2b9a52']];
  ads.forEach((a, i) => {
    const ax = 30 + i * 320; x.fillStyle = a[2]; x.fillRect(ax, 26, 150, 16);
    x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(ax, 26, 150, 1);
    x.fillStyle = a[1]; x.font = '700 12px "Chakra Petch", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(a[0], ax + 75, 34);
  });
  return c;
}
/* ---- piste : dégradé de profondeur, gomme, marquages, reflets ---- */
function buildTrackBase() {
  const c = mkCanvas(960, 240), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 240); g.addColorStop(0, '#262735'); g.addColorStop(0.5, '#2f303f'); g.addColorStop(1, '#3a3b4b');
  x.fillStyle = g; x.fillRect(0, 0, 960, 240);
  // reflet chaud du couchant sur le bitume
  const s = x.createRadialGradient(720, 0, 0, 720, 0, 420); s.addColorStop(0, 'rgba(255,170,120,0.22)'); s.addColorStop(1, 'rgba(255,170,120,0)');
  x.fillStyle = s; x.fillRect(0, 0, 960, 240);
  // traces de gomme dans chaque voie
  for (const cy of [92, 192]) for (const off of [-8, 8]) {
    const gg = x.createLinearGradient(0, cy + off - 6, 0, cy + off + 6); gg.addColorStop(0, 'rgba(0,0,0,0)'); gg.addColorStop(0.5, 'rgba(0,0,0,0.28)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gg; x.fillRect(0, cy + off - 6, 960, 12);
  }
  // marquages
  x.fillStyle = '#d8dae6'; x.fillRect(0, 4, 960, 2); x.fillRect(0, 228, 960, 2);
  x.fillStyle = '#f2c94c'; x.fillRect(0, 152, 960, 3);
  x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(0, 155, 960, 1);
  return c;
}
function buildAsphalt() {
  const c = mkCanvas(512, 240), x = c.getContext('2d'), r = rng(99);
  for (let i = 0; i < 5200; i++) {
    const v = r();
    x.fillStyle = v < 0.5 ? 'rgba(0,0,0,0.2)' : v < 0.85 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.11)';
    x.fillRect(Math.floor(r() * 512), Math.floor(r() * 240), r() < 0.2 ? 2 : 1, 1);
  }
  for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(0,0,0,0.25)'; let px = r() * 512, py = r() * 240; for (let k = 0; k < 24; k++) { x.fillRect(Math.floor(px), Math.floor(py), 1, 1); px += r() * 3 - 0.4; py += r() * 2 - 1; } }
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(0,0,0,0.12)'; x.beginPath(); x.ellipse(r() * 512, r() * 240, 10 + r() * 20, 3 + r() * 4, 0, 0, Math.PI * 2); x.fill(); }
  return c;
}
