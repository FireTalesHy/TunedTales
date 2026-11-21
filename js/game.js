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

  raceDone(idx, res) {
    const o = OPPONENTS[idx], s = this.save;
    s.races++;
    let reward;
    if (res.win) { const first = !s.wins[idx]; reward = first ? o.reward : Math.round(o.reward * 0.4); s.wins[idx] = true; res.first = first; }
    else reward = Math.max(20, Math.round(o.reward * 0.1));
    res.reward = reward; s.money += reward;
    if (res.et && !res.fs) { const k = s.current; if (!s.best[k] || res.et < s.best[k]) { s.best[k] = res.et; res.record = true; } }
    this.persist();
    UI.refreshTop();
  }
};
