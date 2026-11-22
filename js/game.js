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
  /* bonus de connexion quotidien (série de jours consécutifs, jusqu'à 7) */
  daily() {
    const today = new Date().toDateString(), yest = new Date(Date.now() - 864e5).toDateString(), d = this.save.daily || {};
    if (d.day === today) return null;
    const streak = d.day === yest ? Math.min(7, (d.streak || 0) + 1) : 1;
    let base = 300; try { base = Math.max(300, this.baseReward(estimateBest(specOf(this.car())).t400) * 2); } catch (e) {}
    const amount = Math.round(base * (1 + 0.25 * (streak - 1)) / 10) * 10;
    this.save.daily = {day: today, streak}; this.save.money += amount; this.persist(); UI.refreshTop();
    return {amount, streak};
  },
  /* ---- personnalisation visuelle ---- */
  look(cs) { return lookOf(cs || this.car()); },
  lookOwned(cs, id, v) { const o = VISUAL.find(x => x.id === id).opts.find(x => x.v === v); return !o.p || (cs.owned || []).includes(id + ':' + v); },
  lookPrice(cs, id, v) { return this.lookOwned(cs, id, v) ? 0 : VISUAL.find(x => x.id === id).opts.find(x => x.v === v).p; },
  applyLook(changes) {
    const cs = this.car(); let total = 0;
    for (const [id, v] of Object.entries(changes)) total += this.lookPrice(cs, id, v);
    if (this.save.money < total) return false;
    this.save.money -= total; cs.owned = cs.owned || []; cs.look = Object.assign(lookOf(cs), changes);
    for (const [id, v] of Object.entries(changes)) if (!cs.owned.includes(id + ':' + v)) cs.owned.push(id + ':' + v);
    this.persist(); return true;
  },
  owns(id) { return !!this.save.cars[id]; },
  priceMult(cs) { return 0.5 + ENGINES[cs.engine].hp / 160; },
  partPrice(cs, part, tier) { return Math.round(part.tiers[tier].p * this.priceMult(cs) * (1 - this.perk('parts')) / 10) * 10; },

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
  ladderOpp(i) { const c = CLANS.find(k => k.boss === i || k.members.includes(i)); return Object.assign({}, OPPONENTS[i], {kind: 'ladder', idx: i, color: this.oppColor(i), look: randomLook(rng(i * 97 + 13), Math.min(1, i / 11)), clan: c && c.name, emblem: c && c.emblem, boss: !!c && c.boss === i}); },

  /* ---------------- CONTRATS ---------------- */
  baseReward(t400) { return 160 * Math.pow(18.5 / t400, 6.5); },
  streakMult(n) { return Math.min(2.5 + this.perk('streak'), 1 + 0.2 * (n || 0)); },
  /* ---------------- CLANS ---------------- */
  crew() { return Object.assign({name: 'Tuned Tales', color: '#19e6ff'}, this.save.crew || {}); },
  setCrew(name, color) { this.save.crew = {name: (name || '').trim().slice(0, 24) || 'Tuned Tales', color: color || this.crew().color}; this.persist(); },
  clanOf(idx) { return CLANS.find(c => c.boss === idx || c.members.includes(idx)); },
  clanDefeated(c) { return !!this.save.wins[c.boss]; },
  clanUnlocked(i) { return i === 0 || this.clanDefeated(CLANS[i - 1]); },
  bossUnlocked(c) { return c.members.every(m => this.save.wins[m]); },
  /* ---- territoires : revenus passifs ---- */
  turf(id) {
    const c = CLANS.find(k => k.id === id); if (!c || !this.clanDefeated(c)) return null;
    this.save.turf = this.save.turf || {};
    if (!this.save.turf[id]) this.save.turf[id] = {lvl: 1, last: Date.now()};
    return this.save.turf[id];
  },
  turfRate(id) { const t = this.turf(id); return t ? Math.round(TURF[id].base * (1 + 0.6 * (t.lvl - 1))) : 0; },
  turfCap(id) { const t = this.turf(id); return t ? 6 + 3 * (t.lvl - 1) : 0; },          // heures accumulables
  turfPending(id) { const t = this.turf(id); if (!t) return 0; const h = Math.min(this.turfCap(id), (Date.now() - t.last) / 3600000); return Math.floor(h * this.turfRate(id)); },
  turfUpCost(id) { const t = this.turf(id); return t && t.lvl < 5 ? Math.round(TURF[id].base * 10 * t.lvl * t.lvl / 10) * 10 : 0; },
  totalTurfRate() { return CLANS.reduce((a, c) => a + this.turfRate(c.id), 0); },
  totalPending() { return CLANS.reduce((a, c) => a + this.turfPending(c.id), 0); },
  collectTurf(id) {
    let g = 0;
    for (const c of CLANS) if (!id || c.id === id) { const p = this.turfPending(c.id); if (p > 0) { g += p; this.save.turf[c.id].last = Date.now(); } }
    if (g) { this.save.money += g; this.persist(); UI.refreshTop(); }
    return g;
  },
  upgradeTurf(id) {
    const t = this.turf(id), cost = this.turfUpCost(id);
    if (!t || !cost || this.save.money < cost) return false;
    this.collectTurf(id); this.save.money -= cost; t.lvl++; this.persist(); return true;
  },
  perk(type) { let v = 0; if (this.save) for (const c of CLANS) if (c.perk.type === type && this.clanDefeated(c)) v += c.perk.v; return v; },
  /* valeur d'une voiture : prix catalogue + moteur swappé + 60 % des pièces */
  carValue(c) {
    const id = c.id || c.car, e = ENGINES[c.engine], base = Math.max(3000, CARS[id].price);
    let parts = 0;
    for (const p of PARTS) for (let t = 0; t < (c.parts && c.parts[p.id] || 0); t++) parts += Math.round(p.tiers[t].p * (0.5 + e.hp / 160));
    return Math.round((base + (c.engine !== CARS[id].engine ? e.price * 0.6 : 0) + parts * 0.6) / 10) * 10;
  },
  sellCar(id) {
    const s = this.save, ids = Object.keys(s.cars);
    if (ids.length < 2 || !s.cars[id]) return false;
    s.money += Math.round(this.carValue(s.cars[id]) * 0.6 / 10) * 10;
    delete s.cars[id];
    if (s.current === id) s.current = Object.keys(s.cars)[0];
    s.contracts = null; this.persist(); return true;
  },
  contracts() {
    const s = this.save;
    if (!s.contracts || s.contracts.car !== s.current || s.contracts.sig !== this.carSig()) s.contracts = {car: s.current, sig: this.carSig(), list: this.genContracts()};
    return s.contracts.list;
  },
  pinkSlips() {
    const s = this.save;
    if (Object.keys(s.cars).length < 2) return [];
    if (!s.pinks || s.pinks.car !== s.current || s.pinks.sig !== this.carSig()) s.pinks = {car: s.current, sig: this.carSig(), list: this.genRivals(PINK_DIFFS, true)};
    return s.pinks.list;
  },
  carSig() { const c = this.car(); return c.engine + JSON.stringify(c.parts); },
  refreshContracts() {
    if (this.save.money < CONTRACT_REFRESH) return false;
    this.save.money -= CONTRACT_REFRESH; this.save.contracts = null; this.contracts(); this.persist(); return true;
  },
  genContracts() {
    return this.genRivals(CONTRACT_DIFFS, false);
  },
  genRivals(DIFFS, pink) {
    const me = estimateBest(specOf(this.car())).t400, base = this.baseReward(me);
    const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
    const used = new Set(), out = [], types = CONTRACT_TYPES.filter(t => t.id !== 'pink').sort(() => Math.random() - 0.5);
    for (const D of DIFFS) {
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
      const type = pink ? CONTRACT_TYPES.find(t => t.id === 'pink') : types[out.length];
      const reward = Math.max(60, Math.round(base * D.mult * rnd(0.9, 1.15) / 10) * 10);
      out.push({kind: 'contract', diff: D.k, diffLabel: D.label, skill: D.skill, car: best.car, engine: best.engine, parts: best.parts,
        color: pick(PAINTS), name: pick(RIVALS), tag: pick(RIVAL_TAGS), type: type.id, reward,
        stake: type.id === 'bet' ? Math.round(reward * 0.6 / 10) * 10 : 0, est: best.t, look: randomLook(Math.random, D.k === 'hard' ? 0.8 : D.k === 'mid' ? 0.5 : 0.25)});
      if (type.id === 'pink') { const o = out[out.length - 1]; o.value = this.carValue(o); o.reward = Math.round(o.value * 0.7 / 10) * 10; o.myValue = this.carValue(this.car()); }
    }
    return out;
  },

  raceDone(opp, res) {
    const s = this.save;
    s.races++;
    let reward = 0, lines = [];
    if (opp.kind === 'ladder') {
      const o = OPPONENTS[opp.idx];
      if (res.win) {
        const first = !s.wins[opp.idx]; reward = first ? o.reward : Math.round(o.reward * 0.4); s.wins[opp.idx] = true; res.first = first;
        lines.push([first ? 'Victoire (1re fois)' : 'Revanche (40 %)', reward]);
        const clan = this.clanOf(opp.idx);
        if (first && clan && clan.boss === opp.idx) {
          res.lore = clan.id; lines.push([`${clan.emblem} ${clan.name} rejoint ${this.crew().name} · ${clan.perk.label}`, 0, 'info']);
          if (clan.id === 'cercle' && !this.owns('tr250')) { s.cars.tr250 = {id: 'tr250', engine: 'colombo', parts: {}, color: CARS.tr250.color, owned: []}; lines.push(['🏎️ Ferrari 250 Testa Rossa du Fantôme', 0, 'car']); }
        }
      }
      else { reward = Math.max(20, Math.round(o.reward * 0.1)); lines.push(['Prime de participation', reward]); }
    } else {
      if (opp.type === 'pink') {
        if (res.win) {
          if (!this.owns(opp.car)) { s.cars[opp.car] = {id: opp.car, engine: opp.engine, parts: Object.assign({}, opp.parts), color: opp.color, look: opp.look, owned: []}; lines.push([`🚗 ${CARS[opp.car].name} gagnée`, 0, 'car']); }
          else { reward = opp.reward; lines.push([`Titre revendu (${CARS[opp.car].name} déjà au garage)`, reward]); }
        } else {
          const lost = s.current; delete s.cars[lost]; s.current = Object.keys(s.cars)[0];
          lines.push([`💀 ${CARS[lost].name} perdue`, 0, 'lost']);
        }
      } else if (res.win) {
        reward = opp.reward; lines.push(['Contrat rempli', opp.reward]);
        if (this.perk('contracts')) { const b = Math.round(opp.reward * this.perk('contracts')); reward += b; lines.push(['🌙 Bonus Nuit Blanche', b]); }
        if (opp.type === 'bet') { reward += opp.stake; lines.push(['Mise remportée', opp.stake]); }
        if (opp.type === 'reflex' && res.zone >= 0.9) { const b = Math.round(opp.reward * 0.5); reward += b; lines.push(['Bonus maîtrise du régime', b]); }
        if (opp.type === 'launch' && res.launchQ > 0.95) { const b = Math.round(opp.reward * 0.4); reward += b; lines.push(['Bonus départ parfait', b]); }
        if (opp.type === 'shifts' && res.shifts > 0 && res.perfect === res.shifts) { const b = Math.round(opp.reward * 0.4); reward += b; lines.push(['Bonus passages parfaits', b]); }
      } else if (opp.type === 'bet') { reward = -opp.stake; lines.push(['Mise perdue', -opp.stake]); }
      else { reward = Math.round(opp.reward * 0.1); lines.push(['Prime de participation', reward]); }
      if (opp.type === 'pink') s.pinks = null; else s.contracts = null;   // nouvelles propositions après chaque course
    }
    // série de victoires : multiplicateur sur les gains, remise à zéro en cas de défaite
    if (res.win) {
      const m = this.streakMult(s.streak);
      if (m > 1 && reward > 0) { const b = Math.round(reward * (m - 1)); reward += b; lines.push([`🔥 Série de ${s.streak} victoires ×${m.toFixed(1)}`, b]); }
      s.streak = (s.streak || 0) + 1;
    } else { if (s.streak >= 2) lines.push([`Série de ${s.streak} victoires terminée`, 0, 'info']); s.streak = 0; }
    res.streak = s.streak;
    if (reward > 0 && this.perk('all')) { const b = Math.round(reward * this.perk('all')); reward += b; lines.push(['⭕ Bonus du Cercle', b]); }
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
const PINK_DIFFS = [
  {k: 'mid',  label: 'Serré',     d: [-0.3, 0.2],   skill: 0.90, mult: 1},
  {k: 'hard', label: 'Difficile', d: [-0.8, -0.3],  skill: 0.93, mult: 1},
  {k: 'hard', label: 'Extrême',   d: [-1.5, -0.8],  skill: 0.95, mult: 1}
];
const CONTRACT_TYPES = [
  {id: 'street', label: 'Course de rue', icon: '🏁', desc: () => 'Bats ton adversaire sur 402 m.'},
  {id: 'bet',    label: 'Pari',          icon: '💰', desc: o => `Mise de ${fmt(o.stake)} € : gagne et tu la doubles, perds et elle est à lui.`},
  {id: 'reflex', label: 'Pied de velours', icon: '🎚️', desc: () => 'Bonus +50 % si l\'aiguille reste dans le vert pendant 90 % du compte à rebours.'},
  {id: 'launch', label: 'Départ canon',  icon: '🚀', desc: () => 'Bonus +40 % pour un départ parfait (cadre vert).'},
  {id: 'shifts', label: 'Boîte parfaite', icon: '🎯', desc: () => 'Bonus +40 % si tous tes passages sont parfaits.'},
  {id: 'pink',   label: 'Titre de propriété', icon: '🏴', desc: o => `Course au titre : le gagnant repart avec la voiture de l\'autre. Tu mets en jeu ta voiture actuelle (valeur ${fmt(o.myValue)} €).`}
];
const RIVALS = ['Lucas', 'Inès', 'Nico', 'Mehdi', 'Chloé', 'Karim', 'Jess', 'Théo', 'Sami', 'Lina', 'Bastien', 'Yuki', 'Enzo', 'Manon', 'Rayan', 'Léo', 'Sacha', 'Nora', 'Hugo', 'Maëlle', 'Diego', 'Ana'];
const RIVAL_TAGS = ['Street racer', 'Préparateur du dimanche', 'Fils à papa', 'Ancien pilote', 'Youtubeur auto', 'Livreur pressé', 'Roi du parking', 'Mécano de nuit', 'Collectionneur', 'Team JDM', 'Fan de stance', 'Chasseur de chronos'];

/* revenus de base des territoires (€ / heure de temps réel, même jeu fermé) */
const TURF = {cles: {base: 250, name: 'Garage de la zone industrielle'}, nuit: {base: 700, name: 'Paris clandestins des quais'},
              twin: {base: 1800, name: 'Atelier moteurs du port'}, kings: {base: 4500, name: 'Péage de l\'autoroute'}, cercle: {base: 12000, name: 'Circuit privé du Cercle'}};
