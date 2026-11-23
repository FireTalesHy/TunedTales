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
    if (CARS[cs.id].livery) return false;                 // livrée officielle verrouillée
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
  paint(color) { const cs = this.car(); if (CARS[cs.id].livery) return false; if (this.save.money < 50 && cs.color !== color) return false; if (cs.color !== color) this.save.money -= 50; cs.color = color; this.persist(); return true; },

  oppColor(i) { return ['#d04040', '#40a0d0', '#d0a030', '#50b060', '#a050d0', '#e0e0e0', '#e07030', '#3050c0', '#e050a0', '#30c0b0', '#c0c030', '#181820'][i % 12]; },
  ladderOpp(i) { const c = CLANS.find(k => k.boss === i || k.members.includes(i)); return Object.assign({}, OPPONENTS[i], {kind: 'ladder', idx: i, color: this.oppColor(i), look: randomLook(rng(i * 97 + 13), Math.min(1, i / 11)), clan: c && c.name, emblem: c && c.emblem, boss: !!c && c.boss === i, cond: 'night'}); },

  /* ---------------- CONTRATS ---------------- */
  baseReward(t400) { return 260 * Math.pow(18.5 / t400, 6.5); },
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
      const cond = pickCond(), reward = Math.max(60, Math.round(base * D.mult * rnd(0.9, 1.15) * (1 + condOf(cond).bonus) / 10) * 10);
      out.push({kind: 'contract', diff: D.k, diffLabel: D.label, skill: D.skill, car: best.car, engine: best.engine, parts: best.parts,
        color: pick(PAINTS), name: pick(RIVALS), tag: pick(RIVAL_TAGS), type: type.id, reward, cond,
        stake: type.id === 'bet' ? Math.round(reward * 0.6 / 10) * 10 : 0, est: best.t, look: randomLook(Math.random, D.k === 'hard' ? 0.8 : D.k === 'mid' ? 0.5 : 0.25)});
      if (type.id === 'pink') { const o = out[out.length - 1]; o.value = this.carValue(o); o.reward = Math.round(o.value * 0.7 / 10) * 10; o.myValue = this.carValue(this.car()); }
    }
    return out;
  },

  /* ---- entretien ---- */
  repairCost(cs) { cs = cs || this.car(); const w = cs.cond == null ? 100 : cs.cond; return Math.round((100 - w) * (8 + this.carValue(cs) * 0.0006) / 10) * 10; },
  repair() { const cs = this.car(), c = this.repairCost(cs); if (!c || this.save.money < c) return false; this.save.money -= c; cs.cond = 100; this.persist(); return true; },
  setSetup(k, v) { const cs = this.car(); cs.setup = Object.assign({}, cs.setup || {}); cs.setup[k] = v; this.persist(); },

  /* ---- tournoi hebdomadaire ---- */
  tour() {
    const s = this.save, week = Math.floor((Date.now() / 864e5 + 3) / 7);
    if (!s.tour || s.tour.week !== week) s.tour = {week, round: 0, done: false, opps: null, sig: null};
    s.tour.theme = TOUR_THEMES[week % TOUR_THEMES.length].id;
    return s.tour;
  },
  tourTheme() { return TOUR_THEMES.find(t => t.id === this.tour().theme); },
  tourPrize() { const me = estimateBest(specOf(this.car())).t400; return Math.round(this.baseReward(me) * 6 / 100) * 100; },
  tourOpp() {
    const T = this.tour();
    if (T.done || !this.tourTheme().ok(this.car())) return null;
    if (!T.opps || T.sig !== this.carSig() + this.save.current) {
      T.opps = TOUR_ROUNDS.map(R => Object.assign(this.genRivals([R], false)[0], {kind: 'tour', type: 'street', diffLabel: R.label})); T.sig = this.carSig() + this.save.current;
    }
    const o = T.opps[T.round]; o.round = T.round; return o;
  },

  /* ---- réputation (niveaux) ---- */
  level() { return this.save.level || 1; },
  xpNeed(l) { return Math.round(300 * Math.pow(l || this.level(), 1.4) / 10) * 10; },
  repBonus() { return Math.min(0.5, 0.02 * (this.level() - 1)); },
  addXP(n) {
    const s = this.save, ups = [];
    s.xp = (s.xp || 0) + n; s.level = s.level || 1;
    while (s.xp >= this.xpNeed(s.level)) { s.xp -= this.xpNeed(s.level); s.level++; const cash = Math.round(500 * Math.pow(s.level, 1.5) / 10) * 10; s.money += cash; ups.push({level: s.level, cash}); }
    return ups;
  },
  /* ---- défis ---- */
  chalValue(c) {
    if (c.id === 'garage') return Object.keys(this.save.cars).length;
    if (c.id === 'boss') return CLANS.filter(k => this.clanDefeated(k)).length;
    return (this.save.stats || {})[c.stat] || 0;
  },
  chalState(c) {
    const done = (this.save.chal || {})[c.id] || 0, v = this.chalValue(c), tier = c.tiers[done];
    const ok = tier != null && (c.lower ? v > 0 && v <= tier : v >= tier);
    return {done, v, tier, ok, max: tier == null};
  },
  chalReward(c, i) { return {cash: Math.round(c.cash * Math.pow(4, i) / 10) * 10, xp: 120 * (i + 1)}; },
  claimable() { return CHALLENGES.filter(c => this.chalState(c).ok).length; },
  claimChal(id) {
    const c = CHALLENGES.find(x => x.id === id), S = c && this.chalState(c);
    if (!S || !S.ok) return null;
    const r = this.chalReward(c, S.done); this.save.chal = this.save.chal || {}; this.save.chal[id] = S.done + 1;
    this.save.money += r.cash; const ups = this.addXP(r.xp); let cash = r.cash; for (const u of ups) cash += u.cash;
    this.persist(); return {cash, xp: r.xp, ups};
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
    } else if (opp.kind === 'tour') {
      const T = this.tour();
      if (res.win) {
        reward = opp.reward; lines.push([`🏆 ${TOUR_ROUNDS[T.round].label} gagnée`, reward]); T.round++;
        if (T.round >= TOUR_ROUNDS.length) {
          const prize = this.tourPrize(); reward += prize; T.done = true; res.champion = true;
          lines.push([`👑 CHAMPION · ${this.tourTheme().name}`, prize]);
          s.stats = s.stats || {}; s.stats.tourWins = (s.stats.tourWins || 0) + 1;
        }
      } else {
        reward = Math.round(opp.reward * 0.15); lines.push([`Éliminé en ${TOUR_ROUNDS[T.round].label.toLowerCase()} · tu peux retenter`, reward]);
        T.round = 0; T.opps = null;
      }
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
    // usure mécanique de la voiture utilisée (le rupteur, le cliquetis et la surchauffe des pneus usent plus)
    const cw = s.cars[s.current];
    if (cw && Race.plCar && cw.id === Race.plCar.id) {
      const loss = 1.5 + Math.min(6, res.limT * 2.5) + (res.knocked ? 6 : 0) + (res.burn === 'hot' ? 2 : 0) + (res.nitroUsed ? 1 : 0);
      cw.cond = Math.max(0, Math.round(((cw.cond == null ? 100 : cw.cond) - loss) * 10) / 10); res.wear = loss;
      if (cw.cond < 60) lines.push([`🔧 État mécanique ${Math.round(cw.cond)} % : passe au garage`, 0, 'info']);
    }
    // conditions difficiles : bonus sur les gains
    const C = condOf(opp.cond);
    if (res.win && reward > 0 && C.bonus && opp.kind !== 'ladder') { const b = Math.round(reward * C.bonus); reward += b; lines.push([`${C.icon} Bonus ${C.name}`, b]); }
    // réputation : bonus permanent selon le niveau
    const lv = this.level();
    if (reward > 0 && lv > 1) { const b = Math.round(reward * this.repBonus()); reward += b; lines.push([`⭐ Réputation niv. ${lv}`, b]); }
    // statistiques de pilote (pour les défis)
    const st = s.stats = s.stats || {}, inc = (k, n) => { st[k] = (st[k] || 0) + (n == null ? 1 : n); };
    if (res.win) inc('wins');
    if (res.launchQ > 0.95) inc('perfLaunch');
    inc('perfShift', res.perfect || 0);
    if (res.burn === 'perfect') inc('perfBurn');
    if (res.win && opp.cond === 'rain') inc('rainWins');
    if (res.win && opp.type === 'pink') inc('pinkWins');
    st.bestStreak = Math.max(st.bestStreak || 0, s.streak || 0);
    if (res.et && !res.fs) { st.bestET = st.bestET ? Math.min(st.bestET, res.et) : res.et; st.bestTrap = Math.max(st.bestTrap || 0, Math.round(res.speed)); }
    // expérience
    let xp = (res.win ? 100 : 35) + (res.launchQ > 0.95 ? 25 : 0) + (res.perfect || 0) * 8 + (res.burn === 'perfect' ? 15 : 0) + (res.lore ? 300 : 0);
    xp = Math.round(xp * (1 + C.bonus)); res.xp = xp;
    lines.push([`⭐ +${xp} XP de réputation`, 0, 'info']);
    for (const u of this.addXP(xp)) { reward += u.cash; lines.push([`🎖️ Niveau ${u.level} atteint !`, u.cash]); res.levelUp = u.level; }
    res.reward = reward; res.lines = lines; s.money = Math.max(0, s.money + reward);
    if (res.et && !res.fs) { const k = s.current; if (!s.best[k] || res.et < s.best[k]) { s.best[k] = res.et; res.record = true; } }
    this.persist();
    UI.refreshTop();
  }
};

/* conditions de piste : adhérence, puissance (air chaud / froid) et bonus de gains */
const TRACK_CONDS = [
  {id: 'dry',   name: 'Piste sèche',        icon: '☀️', mu: 1,    hp: 1,    bonus: 0,    w: 5},
  {id: 'night', name: 'Nuit fraîche',       icon: '🌙', mu: 1.03, hp: 1.04, bonus: 0,    w: 3},
  {id: 'prep',  name: 'Piste préparée',     icon: '🧪', mu: 1.12, hp: 1,    bonus: 0,    w: 2},
  {id: 'hot',   name: 'Bitume brûlant',     icon: '🔥', mu: 0.93, hp: 0.96, bonus: 0.15, w: 2},
  {id: 'rain',  name: 'Pluie',              icon: '🌧️', mu: 0.70, hp: 1,    bonus: 0.4,  w: 2}
];
function pickCond() { let t = Math.random() * TRACK_CONDS.reduce((a, c) => a + c.w, 0); for (const c of TRACK_CONDS) { t -= c.w; if (t <= 0) return c.id; } return 'dry'; }
const condOf = id => TRACK_CONDS.find(c => c.id === id) || TRACK_CONDS[0];

/* défis : paliers de plus en plus durs, récompenses en cash + réputation */
const CHALLENGES = [
  {id: 'wins',   icon: '🏆', name: 'Vainqueur',          stat: 'wins',       tiers: [5, 25, 100, 300],     cash: 600,  d: n => `Gagner ${n} courses`},
  {id: 'launch', icon: '🚀', name: 'Canonnier',          stat: 'perfLaunch', tiers: [5, 25, 100, 250],     cash: 500,  d: n => `Réussir ${n} départs parfaits`},
  {id: 'shift',  icon: '🎯', name: 'Boîte d\'orfèvre',   stat: 'perfShift',  tiers: [20, 100, 400, 1500],  cash: 500,  d: n => `Enchaîner ${n} passages parfaits`},
  {id: 'burn',   icon: '🔥', name: 'Gomme brûlée',       stat: 'perfBurn',   tiers: [3, 20, 80, 250],      cash: 400,  d: n => `Réussir ${n} burnouts parfaits`},
  {id: 'et',     icon: '⏱️', name: 'Chronomètre',        stat: 'bestET', lower: true, tiers: [16, 14, 12, 10.5, 9], cash: 700, d: n => `Descendre sous ${String(n).replace('.', ',')} s au 400 m`},
  {id: 'trap',   icon: '💨', name: 'Vitesse de pointe',  stat: 'bestTrap',   tiers: [150, 200, 250, 300],  cash: 700,  d: n => `Passer la ligne à ${n} km/h`},
  {id: 'streak', icon: '⚡', name: 'Intouchable',        stat: 'bestStreak', tiers: [3, 8, 15, 30],        cash: 800,  d: n => `Enchaîner ${n} victoires`},
  {id: 'rain',   icon: '🌧️', name: 'Roi de la pluie',    stat: 'rainWins',   tiers: [1, 5, 20, 60],        cash: 700,  d: n => `Gagner ${n} course${n > 1 ? 's' : ''} sous la pluie`},
  {id: 'pink',   icon: '🏴', name: 'Chasseur de titres', stat: 'pinkWins',   tiers: [1, 5, 15, 40],        cash: 1500, d: n => `Gagner ${n} titre${n > 1 ? 's' : ''} de propriété`},
  {id: 'garage', icon: '🚗', name: 'Collectionneur',                         tiers: [3, 6, 12, 20, 35],    cash: 800,  d: n => `Posséder ${n} véhicules`},
  {id: 'boss',   icon: '⚔️', name: 'Fléau des clans',                        tiers: [1, 3, 5],             cash: 2000, d: n => `Battre ${n} boss de clan`},
  {id: 'tour',   icon: '👑', name: 'Champion',           stat: 'tourWins',   tiers: [1, 3, 10, 25],        cash: 2500, d: n => `Remporter ${n} tournoi${n > 1 ? 's' : ''} hebdomadaire${n > 1 ? 's' : ''}`}
];

/* tournoi hebdomadaire : un thème par semaine, trois tours à élimination directe */
const JDM = ['mx5', 'civic', 's15', 'supra', 'rx7', 'evo', 'skyline', 'r35', 'lfa', 'rcf', 'sti', 'ae86', 'nsx', 'busa', 'gryaris', 'z350', 'terrano'];
const TOUR_THEMES = [
  {id: 'jdm',    name: 'Coupe JDM',            icon: '🇯🇵', desc: 'Voitures japonaises uniquement',               ok: cs => JDM.includes(cs.id)},
  {id: 'city',   name: 'Coupe des citadines',  icon: '🏙️', desc: 'Voitures à moins de 15 000 € neuves',         ok: cs => CARS[cs.id].price < 15000},
  {id: 'awd',    name: 'Trophée 4 roues motrices', icon: '🌀', desc: 'Transmission intégrale obligatoire',       ok: cs => CARS[cs.id].drive === 'AWD'},
  {id: 'v8',     name: 'Nuit des gros cubes',  icon: '🔥', desc: 'Moteur de 8 cylindres ou plus',                ok: cs => (ENGINE_SOUND[cs.engine] || {}).cyl >= 8 || ['lr1', 'v10l', 'viper8', 'colombo', 'lv12', 'rs25'].includes(cs.engine)},
  {id: 'euro',   name: 'Euro Cup',             icon: '🇪🇺', desc: 'Voitures européennes uniquement',             ok: cs => !JDM.includes(cs.id) && !['mustang', 'viper', 'charger', 'gt40'].includes(cs.id)},
  {id: 'open',   name: 'Open toutes catégories', icon: '🏆', desc: 'Tout est permis',                           ok: () => true}
];
const TOUR_ROUNDS = [
  {k: 'mid',  label: 'Quart de finale', d: [-0.2, 0.3],  skill: 0.89, mult: 1.2},
  {k: 'hard', label: 'Demi-finale',     d: [-0.6, -0.1], skill: 0.92, mult: 1.8},
  {k: 'hard', label: 'Finale',          d: [-1.0, -0.4], skill: 0.95, mult: 2.8}
];

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
