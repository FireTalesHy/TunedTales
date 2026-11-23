/* ============ PHYSIQUE : courbe moteur, simulation de drag ============ */

const G = 9.81, RHO = 1.2, IDLE = 900, DIST = 402.3, STEP = 1 / 120;
const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const UP = {
  intake:  [0, .03, .06, .09],
  exhaust: [0, .04, .08, .11],
  ecu:     [0, .05, .10, .15],
  cam:     [0, 1, 2, 3],
  turbo:   [0, .18, .34, .55],
  weight:  [0, 30, 70, 120],
  tires:   [0, .12, .25, .40],
  gearbox: [1, 1.04, 1.08, 1.12],
  clutch:  [0.32, 0.24, 0.18, 0.13],
  clutchEff: [0.84, 0.89, 0.93, 0.97],
  aero:    [1, .95, .90, .85],
  nitro:   [0, .25, .40]
};

/* forme de courbe d'un moteur : on cherche kd pour que le pic de puissance tombe à hpRpm */
function engineShape(e, r, kd) {
  if (r < e.tqRpm) {
    const d = clamp((e.tqRpm - r) / (e.tqRpm - IDLE), 0, 1.3);
    return e.turbo ? 0.30 + 0.70 * sm(1 - d) : 1 - 0.50 * Math.pow(d, 1.5);
  }
  const u = (r - e.tqRpm) / (e.red - e.tqRpm);
  return Math.max(0.15, 1 - kd * u * u);
}
function ensureCurve(e) {
  if (e._K) return;
  let best = 0.5, bestErr = 1e9;
  for (let kd = 0.05; kd <= 1.2; kd += 0.01) {
    let pk = 0, pr = 0;
    for (let r = e.tqRpm; r <= e.red + 600; r += 50) { const p = r * engineShape(e, r, kd); if (p > pk) { pk = p; pr = r; } }
    const err = Math.abs(pr - e.hpRpm);
    if (err < bestErr) { bestErr = err; best = kd; }
  }
  e._kd = best;
  let pk = 0;
  for (let r = IDLE; r <= e.red + 600; r += 50) pk = Math.max(pk, r * engineShape(e, r, best) / 7127);
  e._K = e.hp / pk;
}

/* Construit les caractéristiques complètes d'une voiture (moteur + pièces) */
const SPLITS = [18.288, 100.584, 201.168, 304.8];            // 60 ft, 330 ft, 1/8 mile, 1000 ft
const ECU_DEFAULT = {timing: 0, lean: 0, boost: 1, revlim: 0, tq1: 1, flat: false, alag: false};
function makeSpec(carId, engineId, parts, ecuMap) {
  const c = CARS[carId], e = ENGINES[engineId]; ensureCurve(e);
  const P = parts || {}, t = id => P[id] || 0;
  // cartographie ECU : chaque réglage n'est actif que si le niveau de reprog le permet
  const lvl = t('ecu'), M = Object.assign({}, ECU_DEFAULT, ecuMap || {});
  if (lvl < 1) { M.timing = 0; M.lean = 0; }
  if (lvl < 2) { M.boost = 1; M.revlim = 0; M.tq1 = 1; }
  if (lvl < 3) { M.flat = false; M.alag = false; }
  const hasTurbo = e.turbo || t('turbo') > 0;
  if (!hasTurbo) { M.boost = 1; M.alag = false; }
  const red = e.red + 250 * UP.cam[t('cam')] + M.revlim;
  const boostK = e.turbo ? 0.7 : 1;
  const spec = {
    carId, engineId, parts: P,
    mass: c.body + e.mass - UP.weight[t('weight')] + 75,
    mu: c.mu + UP.tires[t('tires')], frac: c.frac, eff: c.eff, r: c.r,
    cd: c.cd * UP.aero[t('aero')], A: c.A, drive: c.drive,
    gears: c.gears.map(g => g * UP.gearbox[t('gearbox')]), final: c.final,
    red, idle: IDLE, shiftTime: UP.clutch[t('clutch')] * (M.flat ? 0.6 : 1), clutchEff: UP.clutchEff[t('clutch')],
    nitro: t('nitro') > 0 ? {dur: 4, boost: UP.nitro[t('nitro')]} : null, tqRpm: e.tqRpm,
    turbo: hasTurbo, map: M, tq1: M.tq1, alag: M.alag, knockMul: 1,
    risk: clamp((Math.max(0, M.timing - 2) * 9 + M.lean * 28 + Math.max(0, M.boost - 1.15) * 120 + M.revlim / 25) / 100, 0, 1),
    spoolTime: 0.3 + 0.14 * t('turbo') + (e.turbo ? 0.1 : 0)       // temps de remontée en pression après un passage
  };
  const gI = 1 + UP.intake[t('intake')], gE = 1 + UP.exhaust[t('exhaust')], gC = 1 + UP.ecu[t('ecu')];
  const camT = UP.cam[t('cam')], boost = UP.turbo[t('turbo')] * boostK;
  spec.torque = (r, nitroOn, spool) => {
    const sp = spool == null ? 1 : spool;
    r = Math.max(r, 500);
    let T = e._K * engineShape(e, r, e._kd);
    T *= gI * gE * gC * (1 + 0.012 * M.timing) * (1 + 0.06 * M.lean);
    T *= 1 + 0.06 * camT * ((r / e.red - 0.55) / 0.45);
    T *= 1 + boost * M.boost * sm((r - 1800) / 1800) * sp;
    if (e.turbo) T *= (1 - 0.22 * (1 - sp) * sm((r - 1800) / 1800)) * (1 + 0.3 * (M.boost - 1) * sm((r - 1800) / 1800) * sp);
    if (nitroOn && spec.nitro) T *= 1 + spec.nitro.boost;
    return T;
  };
  let hp = 0, hpR = 0, tq = 0, tqR = 0;
  for (let r = 1000; r <= red; r += 50) {
    const T = spec.torque(r, false), p = T * r / 7127;
    if (p > hp) { hp = p; hpR = r; }
    if (T > tq) { tq = T; tqR = r; }
  }
  spec.hp = hp; spec.hpRpm = hpR; spec.tq = tq; spec.tqPeakRpm = tqR;
  return spec;
}
/* état mécanique (usure) et réglages de châssis : appliqués par-dessus la fiche technique */
function wearMul(cs) { const w = cs.cond == null ? 100 : cs.cond; return 0.85 + 0.15 * w / 100; }
function specOf(carState) {
  const sp = makeSpec(carState.id, carState.engine, carState.parts, carState.map), S = carState.setup || {};
  const tp = clamp(S.tire || 0, -1, 1), fd = clamp(S.final || 0, -1, 1), wm = wearMul(carState);
  sp.mu *= 1 - 0.06 * tp; sp.roll = 0.015 * (1 - 0.6 * tp);                // pression basse : + d'adhérence, + de résistance au roulement
  sp.final *= 1 + 0.12 * fd;                                                 // pont court : + d'accélération, − de vitesse de pointe
  if (wm < 1) { const t0 = sp.torque; sp.torque = (r, n, s) => t0(r, n, s) * wm; sp.hp *= wm; sp.tq *= wm; }
  sp.wear = wm;
  return sp;
}

/* ---- Simulation ---- */
function createSim() {
  return {t: 0, x: 0, v: 0, gear: 0, rpm: IDLE, slip: false, slipRpm: 0, launchMult: 1, shiftT: 0,
          nitroOn: false, nitroLeft: -1, spool: 1, spin: false, launched: false, fin: false, tFin: 0,
          t100: 0, vmax: 0, limiter: false, accel: 0, splits: {}};
}
function launchQuality(rpm, best, red) {
  const d = Math.abs(rpm - best) / (0.45 * red);
  return Math.max(0.55, 1 - 1.5 * d * d);
}
function bestLaunchRpm(spec) {
  return Math.min(spec.red * 0.72, spec.tqRpm + 700);
}
function simLaunch(s, spec, rpm, q) {
  s.spool = spec.turbo ? (spec.alag ? 1 : 0.55) : 1;
  s.launched = true; s.slip = true; s.slipRpm = Math.max(rpm, spec.idle);
  s.launchMult = clamp(q, 0.4, 1) * spec.clutchEff / 0.96;
  s.nitroLeft = spec.nitro ? spec.nitro.dur : 0;
}
function simShift(s, spec, quality) {
  if (s.gear >= spec.gears.length - 1 || s.shiftT > 0) return false;
  s.gear++; s.slip = false;
  s.shiftT = spec.shiftTime * (quality >= 0.93 ? 0.85 : 1);
  if (spec.turbo) s.spool = spec.alag ? 0.65 : 0.25;                                   // la pression retombe à chaque passage
  return true;
}
function stepSim(s, spec, dt) {
  const g = spec.gears[s.gear] * spec.final;
  const wheelRpm = s.v / spec.r * g * 60 / (2 * Math.PI);
  let rpm = wheelRpm, slipMult = 1;
  if (s.slip) {
    if (wheelRpm >= s.slipRpm) s.slip = false;
    else { rpm = s.slipRpm; slipMult = s.launchMult; }
  }
  rpm = Math.max(rpm, spec.idle);
  s.rpm = rpm;
  let T = 0;
  s.limiter = rpm >= spec.red;
  if (s.shiftT > 0) s.shiftT -= dt;
  else {
    T = spec.torque(Math.min(rpm, spec.red), s.nitroOn && s.nitroLeft > 0, s.spool) * (s.limiter ? 0.12 : 1) * (s.gear === 0 ? (spec.tq1 || 1) : 1) * (spec.knockMul || 1);
    if (spec.turbo && s.spool < 1) s.spool = Math.min(1, s.spool + dt / spec.spoolTime);
  }
  if (s.nitroOn && s.nitroLeft > 0 && T > 0) s.nitroLeft -= dt;
  let Fw = T * g * spec.eff / spec.r * slipMult;
  const Ftr = spec.mu * spec.mass * G * spec.frac;
  s.spin = false;
  if (Fw > Ftr) { Fw = Ftr * 0.94; s.spin = true; }
  const drag = 0.5 * RHO * spec.cd * spec.A * s.v * s.v, roll = (spec.roll || 0.015) * spec.mass * G;
  const a = (Fw - drag - roll) / (spec.mass * 1.07);
  s.accel = a;
  const xPrev = s.x, tPrev = s.t;
  s.v = Math.max(0, s.v + a * dt); s.x += s.v * dt; s.t += dt;
  if (!s.t100 && s.v >= 27.78) s.t100 = s.t;
  if (s.v > s.vmax) s.vmax = s.v;
  for (const d of SPLITS) if (s.splits[d] == null && s.x >= d) { s.splits[d] = tPrev + dt * (d - xPrev) / (s.x - xPrev); if (d === 201.168) s.v660 = s.v; }
  if (!s.fin && s.x >= DIST) { s.fin = true; s.tFin = tPrev + dt * (DIST - xPrev) / (s.x - xPrev); }
}

/* Estimation : lancement idéal + passages au régime optimal */
function estimate(spec, launchFrac) {
  const s = createSim();
  const lr = launchFrac ? spec.red * launchFrac : bestLaunchRpm(spec);
  simLaunch(s, spec, lr, 1);
  s.nitroOn = false;
  let guard = 0;
  while (!s.fin && guard++ < 6000) {
    if (s.rpm >= spec.red * 0.975 && s.gear < spec.gears.length - 1) simShift(s, spec, 1);
    stepSim(s, spec, STEP);
  }
  return {t100: s.t100 || s.tFin, t400: s.tFin, v400: s.v, vmax: s.vmax};
}
function estimateBest(spec) {
  let best = null;
  for (const f of [0.4, 0.5, 0.6, 0.7, 0.8]) {
    const e = estimate(spec, f);
    if (!best || e.t400 < best.t400) { best = e; best.launchFrac = f; }
  }
  return best;
}
function curvePoints(spec, nitro) {
  const pts = [];
  for (let r = 1000; r <= spec.red + 300; r += 100) {
    const rr = Math.min(r, spec.red);
    const T = spec.torque(rr, nitro);
    pts.push({r, hp: T * rr / 7127, tq: T, cut: r > spec.red});
  }
  return pts;
}

if (typeof module !== 'undefined') module.exports = {makeSpec, estimate, estimateBest, createSim, stepSim, simLaunch, simShift, ENGINES, CARS, OPPONENTS: typeof OPPONENTS !== 'undefined' ? OPPONENTS : null};
