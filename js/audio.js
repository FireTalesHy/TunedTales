/* ============ SON : moteurs simulés physiquement + turbo, échappement, pneus ============
   Le cœur du son moteur est le générateur open source « engine-sound-generator » (Antonio-R1, MIT),
   basé sur Baldan et al. 2015 « Physically informed car engine sound synthesis » : cylindres,
   soupapes, guides d'ondes admission / collecteur / échappement / silencieux.
   Fichier : js/vendor/engine_sound_worklet.js. Si les AudioWorklets ne sont pas disponibles
   (ex. ouverture en file://), un synthé de secours à oscillateurs prend le relais.            */

// Timbre par moteur : nombre de cylindres et longueurs des guides d'ondes (en échantillons)
const ENGINE_SOUND = {
  d4f:   {cyl: 4, intake: 90,  exhaust: 90,  extractor: 80,  pipe: 150, ign: 0.016, gIn: 0.35, gBlock: 0.35, gOut: 1.0},
  k4m:   {cyl: 4, intake: 100, exhaust: 100, extractor: 95,  pipe: 140, ign: 0.016, gIn: 0.35, gBlock: 0.35, gOut: 1.0},
  bp:    {cyl: 4, intake: 105, exhaust: 110, extractor: 110, pipe: 120, ign: 0.017, gIn: 0.4,  gBlock: 0.3,  gOut: 1.1},
  f4r:   {cyl: 4, intake: 85,  exhaust: 80,  extractor: 70,  pipe: 100, ign: 0.015, gIn: 0.5,  gBlock: 0.3,  gOut: 1.1},
  ea113: {cyl: 4, intake: 100, exhaust: 100, extractor: 100, pipe: 160, ign: 0.016, gIn: 0.3,  gBlock: 0.35, gOut: 0.95},
  k20a:  {cyl: 4, intake: 70,  exhaust: 70,  extractor: 60,  pipe: 90,  ign: 0.014, gIn: 0.6,  gBlock: 0.25, gOut: 1.1, vtec: 5800},
  s54:   {cyl: 6, intake: 70,  exhaust: 70,  extractor: 70,  pipe: 100, ign: 0.014, gIn: 0.55, gBlock: 0.25, gOut: 1.0},
  rb26:  {cyl: 6, intake: 90,  exhaust: 90,  extractor: 90,  pipe: 120, ign: 0.015, gIn: 0.4,  gBlock: 0.3,  gOut: 1.0},
  jz:    {cyl: 6, intake: 100, exhaust: 100, extractor: 110, pipe: 130, ign: 0.016, gIn: 0.35, gBlock: 0.35, gOut: 1.0},
  sr20:  {cyl: 4, intake: 95,  exhaust: 95,  extractor: 90,  pipe: 150, ign: 0.016, gIn: 0.35, gBlock: 0.3,  gOut: 1.0},
  g63:   {cyl: 4, intake: 100, exhaust: 105, extractor: 100, pipe: 145, ign: 0.017, gIn: 0.35, gBlock: 0.35, gOut: 1.0},
  mezger:{cyl: 6, intake: 75,  exhaust: 80,  extractor: 85,  pipe: 110, ign: 0.015, gIn: 0.5,  gBlock: 0.3,  gOut: 1.0},
  vr38:  {cyl: 6, intake: 95,  exhaust: 100, extractor: 105, pipe: 150, ign: 0.016, gIn: 0.3,  gBlock: 0.35, gOut: 0.9},
  thp:   {cyl: 4, intake: 100, exhaust: 100, extractor: 95,  pipe: 160, ign: 0.016, gIn: 0.3,  gBlock: 0.35, gOut: 0.95},
  lr1:   {cyl: 10, intake: 60, exhaust: 60,  extractor: 55,  pipe: 90,  ign: 0.013, gIn: 0.5,  gBlock: 0.25, gOut: 0.55},
  zetec: {cyl: 4, intake: 100, exhaust: 100, extractor: 95,  pipe: 150, ign: 0.016, gIn: 0.35, gBlock: 0.35, gOut: 1.0},
  td27:  {cyl: 4, intake: 130, exhaust: 130, extractor: 140, pipe: 180, ign: 0.022, gIn: 0.2,  gBlock: 0.55, gOut: 0.9},
  r13b:  {cyl: 3, intake: 60,  exhaust: 55,  extractor: 50,  pipe: 90,  ign: 0.012, gIn: 0.5,  gBlock: 0.2,  gOut: 0.9},
  coyote:{cyl: 8, intake: 130, exhaust: 130, extractor: 140, pipe: 160, ign: 0.019, gIn: 0.25, gBlock: 0.3,  gOut: 0.4},
  ur2:   {cyl: 8, intake: 110, exhaust: 110, extractor: 120, pipe: 140, ign: 0.017, gIn: 0.3,  gBlock: 0.3,  gOut: 0.42},
  m840t: {cyl: 8, intake: 100, exhaust: 100, extractor: 110, pipe: 150, ign: 0.016, gIn: 0.3,  gBlock: 0.3,  gOut: 0.4},
  colombo:{cyl: 12, intake: 60, exhaust: 60, extractor: 55,  pipe: 90,  ign: 0.013, gIn: 0.5,  gBlock: 0.2,  gOut: 0.4},
  f1v6:  {cyl: 6, intake: 45,  exhaust: 45,  extractor: 40,  pipe: 70,  ign: 0.010, gIn: 0.6,  gBlock: 0.2,  gOut: 0.8},
  ls3:   {cyl: 8, intake: 140, exhaust: 140, extractor: 150, pipe: 170, ign: 0.02,  gIn: 0.25, gBlock: 0.3,  gOut: 0.38},
  xu9:   {cyl: 4, intake: 95,  exhaust: 95,  extractor: 85,  pipe: 130, ign: 0.016, gIn: 0.4,  gBlock: 0.35, gOut: 1.05},
  ej25:  {cyl: 4, intake: 120, exhaust: 125, extractor: 150, pipe: 160, ign: 0.019, gIn: 0.3,  gBlock: 0.4,  gOut: 0.95},
  v10l:  {cyl: 10, intake: 65, exhaust: 65,  extractor: 60,  pipe: 95,  ign: 0.013, gIn: 0.45, gBlock: 0.25, gOut: 0.55},
  lamp:  {cyl: 4, intake: 80,  exhaust: 75,  extractor: 65,  pipe: 100, ign: 0.015, gIn: 0.6,  gBlock: 0.3,  gOut: 1.1},
  gsx13: {cyl: 4, intake: 55,  exhaust: 55,  extractor: 50,  pipe: 80,  ign: 0.012, gIn: 0.5,  gBlock: 0.25, gOut: 1.1},
  viper8:{cyl: 10, intake: 150, exhaust: 150, extractor: 160, pipe: 180, ign: 0.021, gIn: 0.25, gBlock: 0.35, gOut: 0.45},
  m158:  {cyl: 12, intake: 110, exhaust: 110, extractor: 115, pipe: 150, ign: 0.017, gIn: 0.3,  gBlock: 0.3,  gOut: 0.38},
  rs25:  {cyl: 10, intake: 35,  exhaust: 35,  extractor: 30,  pipe: 60,  ign: 0.009, gIn: 0.6,  gBlock: 0.2,  gOut: 0.6},
  kr:    {cyl: 4, intake: 95,  exhaust: 95,  extractor: 90,  pipe: 140, ign: 0.016, gIn: 0.4,  gBlock: 0.35, gOut: 1.0},
  g4age: {cyl: 4, intake: 80,  exhaust: 80,  extractor: 70,  pipe: 110, ign: 0.015, gIn: 0.55, gBlock: 0.3,  gOut: 1.05},
  hemi:  {cyl: 8, intake: 160, exhaust: 160, extractor: 170, pipe: 190, ign: 0.022, gIn: 0.25, gBlock: 0.35, gOut: 0.4},
  c30a:  {cyl: 6, intake: 70,  exhaust: 75,  extractor: 70,  pipe: 100, ign: 0.014, gIn: 0.55, gBlock: 0.25, gOut: 1.0, vtec: 5800},
  lv12:  {cyl: 12, intake: 70, exhaust: 70,  extractor: 65,  pipe: 100, ign: 0.014, gIn: 0.45, gBlock: 0.25, gOut: 0.4},
  w16:   {cyl: 8, intake: 120, exhaust: 125, extractor: 130, pipe: 170, ign: 0.018, gIn: 0.3,  gBlock: 0.3,  gOut: 0.38}
};
// variantes de silencieux testées stables (action 0.1) : moins d'éléments = son plus libre
const MASTER_VOL = 0.8;
// niveau du tuyau de sortie par niveau d'échappement (le silencieux simulé ouvert est déjà bien plus fort)
const EX_OUT = [1, 0.75, 0.5, 0.32];
const MUFFLERS = [[10, 15, 20, 25], [10, 15, 20], [10, 15], [6, 9, 12, 15]];

const Sound = {
  ctx: null, master: null, ready: false, worklet: false, muted: false, noiseBuf: null, voices: new Set(),

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.muted = localStorage.getItem('tt_muted') === '1'; } catch (e) {}
    this.ctx = new AC();
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -10; comp.knee.value = 10; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.2;
    this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : MASTER_VOL;
    this.master.connect(comp); comp.connect(this.ctx.destination);
    const n = this.ctx.sampleRate * 2, b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    this.noiseBuf = b;
    if (this.ctx.audioWorklet && window.isSecureContext) {
      this.ctx.audioWorklet.addModule('js/vendor/engine_sound_worklet.js')
        .then(() => { this.worklet = true; this.ready = true; })
        .catch(() => { this.ready = true; });
    } else this.ready = true;
  },
  resume() { this.init(); if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  toggleMute() {
    this.init(); this.muted = !this.muted;
    try { localStorage.setItem('tt_muted', this.muted ? '1' : '0'); } catch (e) {}
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER_VOL, this.ctx.currentTime, 0.05);
    return this.muted;
  },
  noise(loop) { const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = !!loop; return s; },

  /* ---- voix moteur ---- */
  engine(engineId, parts, opt) {
    if (!this.ctx || !this.ready) return null;
    opt = opt || {};
    const ctx = this.ctx, P = parts || {}, e = ENGINES[engineId], prof = ENGINE_SOUND[engineId] || ENGINE_SOUND.k4m;
    const ex = P.exhaust || 0, turboLvl = (e.turbo ? 1 : 0) + (P.turbo || 0);
    const v = {engineId, prof, ex, turboLvl, red: e.red, vol: opt.vol == null ? 1 : opt.vol, nodes: [], boost: 0, dead: false};
    const out = ctx.createGain(); out.gain.value = 0;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 5000 + ex * 2500; tone.Q.value = 0.7;
    if (opt.distant) tone.frequency.value = 1800;
    const shaper = ctx.createWaveShaper(); const k = 0.8 + ex * 0.5, curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; curve[i] = Math.tanh(k * x) / Math.tanh(k); }
    shaper.curve = curve; shaper.oversample = '2x';
    const pre = ctx.createGain();
    pre.connect(shaper); shaper.connect(tone); tone.connect(out); out.connect(this.master);
    v.out = out; v.tone = tone; v.pre = pre;

    if (this.worklet) {
      const node = new AudioWorkletNode(ctx, 'engine-sound-processor', {numberOfInputs: 0, numberOfOutputs: 3, processorOptions: {
        cylinders: prof.cyl, intakeWaveguideLength: prof.intake, exhaustWaveguideLength: prof.exhaust, extractorWaveguideLength: prof.extractor,
        intakeOpenReflectionFactor: 0.01, intakeClosedReflectionFactor: 0.95, exhaustOpenReflectionFactor: 0.01, exhaustClosedReflectionFactor: 0.95,
        ignitionTime: prof.ign, straightPipeWaveguideLength: prof.pipe, straightPipeReflectionFactor: 0.01,
        mufflerElementsLength: MUFFLERS[ex], action: 0.1, outletWaveguideLength: 5, outletReflectionFactor: 0.01}});
      const gi = ctx.createGain(), gb = ctx.createGain(), go = ctx.createGain();
      gi.gain.value = prof.gIn * (1 + (P.intake || 0) * 0.25); gb.gain.value = prof.gBlock; go.gain.value = prof.gOut * EX_OUT[ex];
      // les sorties du simulateur contiennent une forte composante continue (DC) : on la retire
      // avant tout traitement, sinon la distorsion sature d'un seul côté.
      const hp = [0, 1, 2].map(() => { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 35; f.Q.value = 0.7; return f; });
      node.connect(hp[0], 0); node.connect(hp[1], 1); node.connect(hp[2], 2);
      hp[0].connect(gi); hp[1].connect(gb); hp[2].connect(go);
      gi.connect(pre); gb.connect(pre); go.connect(pre);
      pre.gain.value = 0.22;
      v.nodes.push(...hp);
      v.node = node; v.rpmP = node.parameters.get('rpm'); v.thrP = node.parameters.get('throttle');
      v.nodes.push(node, gi, gb, go);
    } else {
      // synthé de secours : fréquence d'allumage + harmoniques
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator();
      o1.type = 'sawtooth'; o2.type = 'square'; o3.type = 'sawtooth';
      const g1 = ctx.createGain(), g2 = ctx.createGain(), g3 = ctx.createGain();
      g1.gain.value = 0.5; g2.gain.value = prof.cyl === 8 ? 0.45 : 0.2; g3.gain.value = 0.2 + ex * 0.08;
      o1.connect(g1); o2.connect(g2); o3.connect(g3); g1.connect(pre); g2.connect(pre); g3.connect(pre);
      pre.gain.value = 0.25;
      o1.start(); o2.start(); o3.start();
      v.osc = [o1, o2, o3]; v.nodes.push(o1, o2, o3, g1, g2, g3);
    }
    // turbo : sifflement + souffle
    if (turboLvl > 0) {
      const w = ctx.createOscillator(); w.type = 'sine'; w.frequency.value = 2000;
      const wg = ctx.createGain(); wg.gain.value = 0;
      const hn = this.noise(true), hf = ctx.createBiquadFilter(); hf.type = 'bandpass'; hf.frequency.value = 4200; hf.Q.value = 1.2;
      const hg = ctx.createGain(); hg.gain.value = 0;
      w.connect(wg); wg.connect(this.master); hn.connect(hf); hf.connect(hg); hg.connect(this.master);
      w.start(); hn.start();
      v.whistle = w; v.whistleG = wg; v.hissG = hg; v.nodes.push(w, wg, hn, hf, hg);
    }
    // pneus
    const sn = this.noise(true), sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 1100; sf.Q.value = 3;
    const sg = ctx.createGain(); sg.gain.value = 0;
    sn.connect(sf); sf.connect(sg); sg.connect(this.master); sn.start();
    v.screechG = sg; v.nodes.push(sn, sf, sg);
    this.voices.add(v);
    return v;
  },

  /* rpm, charge (0-1), patinage, rupteur */
  update(v, rpm, load, spin, limiter, spool) {
    if (!v || v.dead) return;
    const t = this.ctx.currentTime, p = v.prof;
    rpm = Math.max(700, rpm);
    if (v.node) { v.rpmP.setTargetAtTime(rpm, t, 0.02); v.thrP.setTargetAtTime(load, t, 0.02); }
    else {
      const f = rpm / 60 * p.cyl / 2;
      v.osc[0].frequency.setTargetAtTime(f, t, 0.015); v.osc[1].frequency.setTargetAtTime(f / 2, t, 0.015); v.osc[2].frequency.setTargetAtTime(f * 2.01, t, 0.015);
    }
    // VTEC : le son s'ouvre au-dessus du seuil
    let bright = (v.ex ? 1 + v.ex * 0.15 : 1);
    if (p.vtec && rpm > p.vtec) bright *= 1.5;
    if (!v.node) v.tone.frequency.setTargetAtTime((500 + rpm * 0.45 * (0.5 + load)) * bright, t, 0.03);
    let g = 0.55 * v.vol * (0.35 + 0.65 * load) * (1 + v.ex * 0.15);
    if (limiter) g *= (Math.floor(performance.now() / 35) % 2) ? 1 : 0.25;
    v.out.gain.setTargetAtTime(g, t, 0.02);
    // turbo
    if (v.whistleG) {
      const target = load > 0.5 ? clamp((rpm - 2200) / 3200, 0, 1) * (spool == null ? 1 : spool) : 0;
      v.boost += (target - v.boost) * (target > v.boost ? (spool == null ? 0.04 : 0.25) : 0.25);
      v.whistle.frequency.setTargetAtTime(1600 + v.boost * 5200, t, 0.05);
      v.whistleG.gain.setTargetAtTime(v.vol * v.boost * 0.04 * Math.min(2, v.turboLvl), t, 0.05);
      v.hissG.gain.setTargetAtTime(v.vol * v.boost * 0.05 * Math.min(2, v.turboLvl), t, 0.05);
    }
    v.screechG.gain.setTargetAtTime(spin ? v.vol * 0.12 : 0, t, 0.04);
  },

  /* passage de vitesse : dump valve si turbo, pétarades si échappement */
  shift(v) {
    if (!v || v.dead) return;
    if (v.whistleG && v.boost > 0.35) { this.blowoff(v.vol * v.boost); v.boost = 0.1; }
    if (v.ex > 0) this.pops(v.vol, 2 + v.ex * 2);
  },
  blowoff(amt) {
    const ctx = this.ctx, t = ctx.currentTime, n = this.noise(false), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(700, t + 0.45);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35 * amt + 0.001, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    n.connect(f); f.connect(g); g.connect(this.master); n.start(t); n.stop(t + 0.55);
  },
  pops(vol, count) {
    const ctx = this.ctx;
    let t = ctx.currentTime + 0.03;
    for (let i = 0; i < count; i++) {
      const n = this.noise(false), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'lowpass'; f.frequency.value = 500 + Math.random() * 700;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5 * vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      n.connect(f); f.connect(g); g.connect(this.master); n.start(t, Math.random()); n.stop(t + 0.07);
      t += 0.04 + Math.random() * 0.09;
    }
  },
  stop(v, fade) {
    if (!v || v.dead) return;
    v.dead = true;
    const t = this.ctx.currentTime, f = fade || 0.3;
    v.out.gain.setTargetAtTime(0, t, f / 3);
    if (v.whistleG) { v.whistleG.gain.setTargetAtTime(0, t, 0.05); v.hissG.gain.setTargetAtTime(0, t, 0.05); }
    v.screechG.gain.setTargetAtTime(0, t, 0.05);
    setTimeout(() => {
      for (const n of v.nodes) { try { if (n.stop) n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} }
      try { v.out.disconnect(); } catch (e) {}
      if (v.node) v.node.port.close && v.node.port.close();
      this.voices.delete(v);
    }, f * 1000 + 200);
  },
  /* souffle du vent : bruit filtré qui monte avec la vitesse (m/s) */
  wind(v) {
    if (!this.ctx || !this.noiseBuf) return;
    if (!this._wind) {
      const n = this.noise(true), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      f.type = 'bandpass'; f.Q.value = 0.6; f.frequency.value = 500; g.gain.value = 0;
      n.connect(f); f.connect(g); g.connect(this.master); n.start();
      this._wind = {f, g};
    }
    const k = Math.min(1, Math.max(0, v / 70)), t = this.ctx.currentTime;
    this._wind.g.gain.setTargetAtTime(k * k * 0.22, t, 0.15);
    this._wind.f.frequency.setTargetAtTime(400 + k * 1400, t, 0.15);
  },
  stopAll() { for (const v of [...this.voices]) this.stop(v, 0.2); },

  /* démonstration : ralenti → coup de gaz jusqu'au rupteur → lâcher */
  demo(engineId, parts) {
    this.resume();
    if (!this.ready) { setTimeout(() => this.demo(engineId, parts), 300); return; }
    if (this._demo) this.stop(this._demo, 0.1);
    const v = this.engine(engineId, parts, {vol: 1}); if (!v) return;
    this._demo = v;
    const red = ENGINES[engineId].red, t0 = performance.now();
    let shifted = false;
    const tick = () => {
      if (v.dead) return;
      const s = (performance.now() - t0) / 1000;
      let rpm, load = 1, lim = false;
      if (s < 0.6) { rpm = 900; load = 0.15; }
      else if (s < 1.9) rpm = 900 + (red - 900) * Math.pow((s - 0.6) / 1.3, 1.3);
      else if (s < 2.4) { rpm = red; lim = true; }
      else if (s < 4.0) { rpm = red - (red - 900) * Math.min(1, (s - 2.4) / 1.2); load = 0.05; if (!shifted) { shifted = true; this.shift(v); } }
      else { this.stop(v, 0.4); return; }
      this.update(v, rpm, load, false, lim);
      requestAnimationFrame(tick);
    };
    tick();
  }
};
