/* ============ ÉTAT DU JEU, ÉCONOMIE, SAUVEGARDE ============ */
const SAVE_KEY = 'tunedtales_save_v1';
const ENGINE_SWAP_FEE = 200;

const Game = {
  save: null,

  fresh() {
    return {money: 600, current: 'twingo',
      cars: {twingo: {id: 'twingo', engine: 'd4f', parts: {}, color: CARS.twingo.color}},
      engines: [], wins: {}, best: {}, races: 0};
  },
  load() {
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.cars && s.cars[s.current]) { this.save = s; return; } } catch (e) {}
    this.save = this.fresh();
  },
  persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); } catch (e) {} },
  reset() { this.save = this.fresh(); this.persist(); },

  car() { return this.save.cars[this.save.current]; },
  owns(id) { return !!this.save.cars[id]; },
  priceMult(cs) { return 0.5 + ENGINES[cs.engine].hp / 160; },
  partPrice(cs, part, tier) { return Math.round(part.tiers[tier].p * this.priceMult(cs) / 10) * 10; },

  buyCar(id) {
    const c = CARS[id];
    if (this.owns(id) || this.save.money < c.price) return false;
    this.save.money -= c.price;
    this.save.cars[id] = {id, engine: c.engine, parts: {}, color: c.color};
    this.save.current = id; this.persist(); return true;
  },
  buyPart(partId) {
    const cs = this.car(), part = PARTS.find(p => p.id === partId), lvl = cs.parts[partId] || 0;
    if (lvl >= part.tiers.length) return false;
    const price = this.partPrice(cs, part, lvl);
    if (this.save.money < price) return false;
    this.save.money -= price; cs.parts[partId] = lvl + 1; this.persist(); return true;
  },
  buyEngine(id) {
    const e = ENGINES[id];
    if (this.save.money < e.price) return false;
    this.save.money -= e.price; this.save.engines.push(id); this.persist(); return true;
  },
  swapEngine(id) {
    const cs = this.car(), i = this.save.engines.indexOf(id);
    if (i < 0 || this.save.money < ENGINE_SWAP_FEE) return false;
    this.save.money -= ENGINE_SWAP_FEE;
    this.save.engines.splice(i, 1, cs.engine);
    cs.engine = id; this.persist(); return true;
  },
  paint(color) { const cs = this.car(); if (this.save.money < 50 && cs.color !== color) return false; if (cs.color !== color) this.save.money -= 50; cs.color = color; this.persist(); return true; },

  oppColor(i) { return ['#d04040', '#40a0d0', '#d0a030', '#50b060', '#a050d0', '#e0e0e0', '#e07030', '#3050c0', '#e050a0', '#30c0b0', '#c0c030', '#181820'][i % 12]; },
  ladderOpp(i) { return Object.assign({}, OPPONENTS[i], {kind: 'ladder', idx: i, color: this.oppColor(i)}); },

  /* ---------------- CONTRATS ---------------- */
  baseReward(t400) { return 160 * Math.pow(18.5 / t400, 5.5); },
  contracts() {
    const s = this.save;
    if (!s.contracts || s.contracts.car !== s.current || s.contracts.sig !== this.carSig()) s.contracts = {car: s.current, sig: this.carSig(), list: this.genContracts()};
    return s.contracts.list;
  },
  carSig() { const c = this.car(); return c.engine + JSON.stringify(c.parts); },
  refreshContracts() {
    if (this.save.money < CONTRACT_REFRESH) return false;
    this.save.money -= CONTRACT_REFRESH; this.save.contracts = null; this.contracts(); this.persist(); return true;
  },
  genContracts() {
    const me = estimateBest(specOf(this.car())).t400, base = this.baseReward(me);
    const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
    const used = new Set(), out = [], types = CONTRACT_TYPES.slice().sort(() => Math.random() - 0.5);
    for (const D of CONTRACT_DIFFS) {
      let best = null, bestErr = 1e9;
      for (let k = 0; k < 220; k++) {
        const car = pick(CAR_IDS);
        let engine = CARS[car].engine;
        if (Math.random() < 0.45) engine = pick(ENGINE_IDS);
        const lvl = Math.random(), parts = {};
        for (const p of PARTS) { const m = p.tiers.length, r = Math.random(); if (r < lvl * 0.85) parts[p.id] = Math.min(m, 1 + Math.floor(Math.random() * m * lvl + 0.2)); }
        const sp = makeSpec(car, engine, parts), t = estimate(sp, 0.6).t400 + (1 - D.skill) * 2.2;   // temps réel attendu de l'IA
        const target = me + (D.d[0] + D.d[1]) / 2, err = Math.abs(t - target) + (used.has(car) ? 0.25 : 0);
        if (t - me >= D.d[0] && t - me <= D.d[1] && !used.has(car)) { best = {car, engine, parts, t}; break; }
        if (err < bestErr) { bestErr = err; best = {car, engine, parts, t}; }
      }
      used.add(best.car);
      const type = types[out.length];
      const reward = Math.max(60, Math.round(base * D.mult * rnd(0.9, 1.15) / 10) * 10);
      out.push({kind: 'contract', diff: D.k, diffLabel: D.label, skill: D.skill, car: best.car, engine: best.engine, parts: best.parts,
        color: pick(PAINTS), name: pick(RIVALS), tag: pick(RIVAL_TAGS), type: type.id, reward,
        stake: type.id === 'bet' ? Math.round(reward * 0.6 / 10) * 10 : 0, est: best.t});
    }
    return out;
  },

  raceDone(opp, res) {
    const s = this.save;
    s.races++;
    let reward = 0, lines = [];
    if (opp.kind === 'ladder') {
      const o = OPPONENTS[opp.idx];
      if (res.win) { const first = !s.wins[opp.idx]; reward = first ? o.reward : Math.round(o.reward * 0.4); s.wins[opp.idx] = true; res.first = first; lines.push([first ? 'Victoire (1re fois)' : 'Victoire (déjà gagnée : 40%)', reward]); }
      else { reward = Math.max(20, Math.round(o.reward * 0.1)); lines.push(['Prime de participation', reward]); }
    } else {
      if (res.win) {
        reward = opp.reward; lines.push(['Contrat rempli', opp.reward]);
        if (opp.type === 'bet') { reward += opp.stake; lines.push(['Mise remportée', opp.stake]); }
        if (opp.type === 'reflex' && !res.fs && res.rt != null && res.rt < 0.3) { const b = Math.round(opp.reward * 0.5); reward += b; lines.push(['Bonus réflexe < 0,30 s', b]); }
        if (opp.type === 'launch' && res.launchQ > 0.95) { const b = Math.round(opp.reward * 0.4); reward += b; lines.push(['Bonus départ parfait', b]); }
        if (opp.type === 'shifts' && res.shifts > 0 && res.perfect === res.shifts) { const b = Math.round(opp.reward * 0.4); reward += b; lines.push(['Bonus passages parfaits', b]); }
      } else if (opp.type === 'bet') { reward = -opp.stake; lines.push(['Mise perdue', -opp.stake]); }
      else { reward = Math.round(opp.reward * 0.1); lines.push(['Prime de participation', reward]); }
      s.contracts = null;                                 // nouveaux contrats après chaque course
    }
    res.reward = reward; res.lines = lines; s.money = Math.max(0, s.money + reward);
    if (res.et && !res.fs) { const k = s.current; if (!s.best[k] || res.et < s.best[k]) { s.best[k] = res.et; res.record = true; } }
    this.persist();
    UI.refreshTop();
  }
};

const CONTRACT_REFRESH = 100;
const CONTRACT_DIFFS = [
  {k: 'easy', label: 'Facile',    d: [0.3, 0.9],    skill: 0.84, mult: 0.75},
  {k: 'mid',  label: 'Serré',     d: [-0.25, 0.25], skill: 0.89, mult: 1.1},
  {k: 'hard', label: 'Difficile', d: [-0.9, -0.3],  skill: 0.93, mult: 1.6}
];
const CONTRACT_TYPES = [
  {id: 'street', label: 'Course de rue', icon: '🏁', desc: () => 'Bats ton adversaire sur 402 m.'},
  {id: 'bet',    label: 'Pari',          icon: '💰', desc: o => `Mise de ${fmt(o.stake)} € : gagne et tu la doubles, perds et elle est à lui.`},
  {id: 'reflex', label: 'Défi réflexe',  icon: '⚡', desc: () => 'Bonus +50 % si ton temps de réaction est sous 0,30 s.'},
  {id: 'launch', label: 'Départ canon',  icon: '🚀', desc: () => 'Bonus +40 % pour un départ parfait (cadre vert).'},
  {id: 'shifts', label: 'Boîte parfaite', icon: '🎯', desc: () => 'Bonus +40 % si tous tes passages sont parfaits.'}
];
const RIVALS = ['Lucas', 'Inès', 'Nico', 'Mehdi', 'Chloé', 'Karim', 'Jess', 'Théo', 'Sami', 'Lina', 'Bastien', 'Yuki', 'Enzo', 'Manon', 'Rayan', 'Léo', 'Sacha', 'Nora', 'Hugo', 'Maëlle', 'Diego', 'Ana'];
const RIVAL_TAGS = ['Street racer', 'Préparateur du dimanche', 'Fils à papa', 'Ancien pilote', 'Youtubeur auto', 'Livreur pressé', 'Roi du parking', 'Mécano de nuit', 'Collectionneur', 'Team JDM', 'Fan de stance', 'Chasseur de chronos'];
