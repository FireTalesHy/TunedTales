/* ============ INTERFACE : écrans HTML par-dessus le canvas ============ */
const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('fr-FR');
const money = n => fmt(n) + ' €';

const UI = {
  screen: 'home', tuneSel: null, garageCar: null,

  refreshTop() {
    $('cash').textContent = money(Game.save.money);
    const cs = Game.car(), sp = specOf(cs), best = Game.save.best[cs.id];
    $('carname').textContent = CARS[cs.id].name;
    const wins = Object.keys(Game.save.wins).length;
    $('homecard').innerHTML = `<div class="hc-t">TA VOITURE</div><div class="hc-n">${CARS[cs.id].name}</div>
      <div class="muted">${ENGINES[cs.engine].name} · ${CARS[cs.id].drive}</div>
      <div class="hc-s"><span><b>${Math.round(sp.hp)} ch</b>puissance</span><span><b>${best ? best.toFixed(2) + ' s' : '—'}</b>record 400 m</span><span><b>${wins}/${OPPONENTS.length}</b>victoires</span></div>`;
  },

  go(name) {
    this.screen = name;
    const panel = $('panel');
    $('menu').classList.toggle('hidden', name !== 'home'); $('homecard').classList.toggle('hidden', name !== 'home');
    $('racebtns').classList.add('hidden'); $('result').classList.add('hidden');
    Race.stop();
    if (name === 'home') { panel.classList.add('hidden'); this.refreshTop(); return; }
    panel.classList.remove('hidden');
    this.render();
  },

  render() {
    this.refreshTop();
    const fn = {races: this.rRaces, garage: this.rGarage, tuning: this.rTuning, shop: this.rShop}[this.screen];
    const scroll = $('panelBody') ? $('panelBody').scrollTop : 0;
    $('panel').innerHTML = `<div class="phead"><button class="btn small" data-act="go" data-v="home">◀ ACCUEIL</button><h2>${this.title()}</h2></div><div id="panelBody">${fn.call(this)}</div>`;
    $('panelBody').scrollTop = scroll;
    paintThumbs();
    if (this.screen === 'tuning') this.drawChart();
  },
  title() { return {races: '🏁 COURSES DE DRAG', garage: '🔧 GARAGE & MOTEURS', tuning: '📈 TUNING', shop: '🚗 CONCESSION'}[this.screen]; },

  /* ---------------- COURSES ---------------- */
  rRaces() {
    const cs = Game.car(), spec = specOf(cs), est = estimateBest(spec);
    let h = `<div class="box info"><b>Comment jouer :</b> <b>Maintiens</b> (ESPACE / appui long) pour monter le régime dans le cadre vert, puis <b>relâche au feu vert</b>.
      Ensuite <b>appuie</b> pour passer la vitesse quand la jauge est dans la zone blanche (&gt;93%). <b>N</b> / bouton NITRO pour la nitro.</div>
      <div class="box you"><canvas class="thumb" data-car="${cs.id}" data-color="${cs.color}" width="300" height="116"></canvas>
      <div><b>${CARS[cs.id].name}</b><br>${ENGINES[cs.engine].name}<br>${Math.round(spec.hp)} ch · ${Math.round(spec.mass)} kg<br>
      Estimation 400 m : <b>${est.t400.toFixed(2)} s</b></div></div><div class="grid">`;
    OPPONENTS.forEach((o, i) => {
      const os = makeSpec(o.car, o.engine, o.parts), oe = estimateBest(os);
      const done = Game.save.wins[i], diff = est.t400 - oe.t400;
      const level = diff > 0.6 ? ['difficile', 'bad'] : diff > -0.4 ? ['équilibré', 'mid'] : ['facile', 'good'];
      const oc = Game.oppColor(i);
      h += `<div class="card ${done ? 'done' : ''}"><div class="ctitle">#${i + 1} ${o.name}${done ? ' ✔' : ''}</div>
        <canvas class="thumb" data-car="${o.car}" data-color="${oc}" width="300" height="116"></canvas>
        <div class="muted">${o.tag}</div>
        <div>${CARS[o.car].name}<br>${ENGINES[o.engine].name}</div>
        <div class="kv"><span>Puissance</span><b>${Math.round(os.hp)} ch</b></div>
        <div class="kv"><span>400 m (est.)</span><b>${oe.t400.toFixed(1)} s</b></div>
        <div class="kv"><span>Niveau</span><b class="${level[1]}">${level[0]}</b></div>
        <div class="kv"><span>Gain</span><b class="gold">${done ? money(o.reward * 0.4) : money(o.reward)}</b></div>
        <button class="btn" data-act="race" data-v="${i}">COURSE ▶</button></div>`;
    });
    return h + '</div>';
  },

  /* ---------------- CONCESSION ---------------- */
  rShop() {
    let h = '<div class="grid">';
    for (const id of CAR_IDS) {
      const c = CARS[id], own = Game.owns(id), sp = makeSpec(id, c.engine, {}), est = estimateBest(sp);
      h += `<div class="card ${own ? 'done' : ''}"><div class="ctitle">${c.name}</div>
        <canvas class="thumb" data-car="${id}" data-color="${c.color}" width="300" height="116"></canvas>
        <div class="muted">${c.hint} · ${c.year}</div>
        <div class="kv"><span>Moteur</span><b>${ENGINES[c.engine].name}</b></div>
        <div class="kv"><span>Puissance</span><b>${Math.round(sp.hp)} ch</b></div>
        <div class="kv"><span>Poids</span><b>${fmt(sp.mass - 75)} kg</b></div>
        <div class="kv"><span>Transmission</span><b>${c.drive}</b></div>
        <div class="kv"><span>0-100</span><b>${est.t100.toFixed(1)} s</b></div>
        <div class="kv"><span>400 m</span><b>${est.t400.toFixed(1)} s</b></div>
        ${own ? '<div class="own">DANS TON GARAGE ✔</div>' :
          `<button class="btn ${Game.save.money >= c.price ? '' : 'off'}" data-act="buycar" data-v="${id}">ACHETER · ${money(c.price)}</button>`}</div>`;
    }
    return h + '</div>';
  },

  /* ---------------- GARAGE ---------------- */
  rGarage() {
    const cs = Game.car(), sp = specOf(cs);
    let h = '<div class="cols"><div><h3>Mes voitures</h3><div class="grid one">';
    for (const id of CAR_IDS) {
      if (!Game.owns(id)) continue;
      const c = Game.save.cars[id], s2 = specOf(c);
      const best = Game.save.best[id];
      h += `<div class="card ${id === cs.id ? 'sel' : ''}"><div class="ctitle">${CARS[id].name}</div>
        <canvas class="thumb" data-car="${id}" data-color="${c.color}" width="300" height="116"></canvas>
        <div class="muted">${ENGINES[c.engine].name} · ${Math.round(s2.hp)} ch</div>
        ${best ? `<div class="muted">Record 400 m : <b>${best.toFixed(2)} s</b></div>` : ''}
        <button class="btn ${id === cs.id ? 'off' : ''}" data-act="selcar" data-v="${id}">${id === cs.id ? 'EN SERVICE' : 'CONDUIRE'}</button></div>`;
    }
    h += `</div><h3>Peinture (50 €)</h3><div class="paints">`;
    for (const p of PAINTS) h += `<button class="paint ${p === cs.color ? 'sel' : ''}" style="background:${p}" data-act="paint" data-v="${p}"></button>`;
    h += `</div></div><div><h3>Moteur : ${CARS[cs.id].name}</h3>`;
    h += this.engineCard(cs.engine, sp, true);
    h += `<h3>Moteurs en stock <small>(échange : ${money(ENGINE_SWAP_FEE)})</small></h3>`;
    if (!Game.save.engines.length) h += '<div class="muted">Aucun moteur en stock. Achète-en un ci-dessous.</div>';
    Game.save.engines.forEach(id => { h += this.engineCard(id, sp, false, 'swap'); });
    h += `<h3>Boutique de moteurs</h3>`;
    ENGINE_IDS.forEach(id => { if (id !== cs.engine) h += this.engineCard(id, sp, false, 'buyeng'); });
    h += `<div class="muted" style="margin-top:14px"><button class="btn small off" data-act="reset">Réinitialiser la sauvegarde</button></div></div></div>`;
    return h;
  },
  engineCard(id, curSpec, current, mode) {
    const e = ENGINES[id], cs = Game.car(), sp = makeSpec(cs.id, id, cs.parts), est = estimateBest(sp);
    const dh = Math.round(sp.hp - curSpec.hp);
    const d = (v, unit) => v === 0 ? '' : ` <i class="${v > 0 ? 'good' : 'bad'}">${v > 0 ? '+' : ''}${v}${unit}</i>`;
    const action = current ? '<span class="own">MONTÉ</span>' :
      mode === 'swap' ? `<button class="btn small ${Game.save.money >= ENGINE_SWAP_FEE ? '' : 'off'}" data-act="swap" data-v="${id}">MONTER</button>` :
      `<button class="btn small ${Game.save.money >= e.price ? '' : 'off'}" data-act="buyeng" data-v="${id}">${money(e.price)}</button>`;
    return `<div class="eng ${current ? 'sel' : ''}"><div><b>${e.name}</b> <span class="muted">${e.kind}</span><br>
      <span class="muted">${Math.round(sp.hp)} ch${current ? '' : d(dh, ' ch')} · ${Math.round(sp.tq)} Nm · zone rouge ${fmt(sp.red)} · ${e.mass} kg</span><br>
      <span class="muted">400 m avec tes pièces : <b>${est.t400.toFixed(2)} s</b></span></div>${action}</div>`;
  },

  /* ---------------- TUNING ---------------- */
  tuneData() {
    const cs = Game.car(), spec = specOf(cs), est = estimateBest(spec);
    let prev = null, prevEst = null;
    const sel = PARTS.find(p => p.id === this.tuneSel);
    if (sel && (cs.parts[sel.id] || 0) < sel.tiers.length) {
      const pp = Object.assign({}, cs.parts); pp[sel.id] = (pp[sel.id] || 0) + 1;
      prev = makeSpec(cs.id, cs.engine, pp); prevEst = estimateBest(prev);
    }
    return {cs, spec, est, prev, prevEst, sel};
  },
  rTuning() {
    const {cs, spec, est, prev, prevEst, sel} = this.tuneData();
    const stock = makeSpec(cs.id, cs.engine, {});
    const stats = [
      ['Puissance', spec.hp, prev && prev.hp, v => Math.round(v) + ' ch', 1, 700, `à ${fmt(spec.hpRpm)} tr/min`],
      ['Couple', spec.tq, prev && prev.tq, v => Math.round(v) + ' Nm', 1, 800, `à ${fmt(spec.tqPeakRpm)} tr/min`],
      ['Zone rouge', spec.red, prev && prev.red, v => fmt(v) + ' tr/min', 1, 9500, ''],
      ['Poids', spec.mass, prev && prev.mass, v => fmt(v) + ' kg', -1, 1900, ''],
      ['Rapport poids/puissance', spec.mass / spec.hp, prev && prev.mass / prev.hp, v => v.toFixed(2) + ' kg/ch', -1, 22, ''],
      ['Adhérence', spec.mu, prev && prev.mu, v => v.toFixed(2), 1, 1.8, CARS[cs.id].drive],
      ['0 → 100 km/h', est.t100, prevEst && prevEst.t100, v => v.toFixed(2) + ' s', -1, 13, ''],
      ['400 m départ arrêté', est.t400, prevEst && prevEst.t400, v => v.toFixed(2) + ' s', -1, 19, ''],
      ['Vitesse de passage 400 m', est.v400 * 3.6, prevEst && prevEst.v400 * 3.6, v => Math.round(v) + ' km/h', 1, 260, '']
    ];
    let h = `<div class="tunehead"><button class="btn small" data-act="tunecar" data-v="-1">◀</button>
      <b>${CARS[cs.id].name}</b> · ${ENGINES[cs.engine].name}
      <button class="btn small" data-act="tunecar" data-v="1">▶</button></div>
      <div class="cols tune"><div><div class="box"><canvas id="chart" width="560" height="300"></canvas>
      <div class="legend"><span><i style="background:#ff9a2e"></i>Puissance (ch)</span><span><i style="background:#3ec8ff"></i>Couple (Nm)</span>
      <span><i class="dash"></i>Aperçu amélioration</span><span><i class="dot"></i>Origine</span></div></div>
      <div class="box stats">`;
    for (const [label, val, pv, f, dir, max, sub] of stats) {
      let dTxt = '';
      if (pv != null) {
        const diff = pv - val, good = dir * diff > 0.0001, bad = dir * diff < -0.0001;
        if (good || bad) dTxt = `<i class="${good ? 'good' : 'bad'}">${diff > 0 ? '+' : '−'}${f(Math.abs(diff)).replace(/^−/, '')}</i>`;
      }
      const w = clamp(val / max * 100, 3, 100), pw = pv != null ? clamp(pv / max * 100, 3, 100) : null;
      h += `<div class="stat"><div class="sl"><span>${label}</span><span><b>${f(val)}</b> ${dTxt}</span></div>
        <div class="bar"><div style="width:${w}%"></div>${pw != null && pw !== w ? `<div class="ghost" style="left:${Math.min(w, pw)}%;width:${Math.abs(pw - w)}%;background:${(dir * (pv - val) > 0) ? '#4cd964' : '#ff5252'}"></div>` : ''}</div>
        ${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
    }
    h += `</div></div><div class="parts">`;
    for (const part of PARTS) {
      const lvl = cs.parts[part.id] || 0, max = part.tiers.length, isSel = sel && sel.id === part.id;
      let pips = '';
      for (let i = 0; i < max; i++) pips += `<span class="pip ${i < lvl ? 'on' : ''}"></span>`;
      let body = '';
      if (lvl >= max) body = '<div class="own">NIVEAU MAX ✔</div>';
      else {
        const price = Game.partPrice(cs, part, lvl);
        const pp = Object.assign({}, cs.parts); pp[part.id] = lvl + 1;
        const ps = makeSpec(cs.id, cs.engine, pp), pe = estimateBest(ps);
        const dhp = Math.round(ps.hp - spec.hp), dt = pe.t400 - est.t400;
        body = `<div class="tier">Niv. ${lvl + 1} : ${part.tiers[lvl].n}</div>
          <div class="prev"><span class="${dhp > 0 ? 'good' : dhp < 0 ? 'bad' : 'muted'}">${dhp >= 0 ? '+' : ''}${dhp} ch</span>
          <span class="${dt < -0.005 ? 'good' : dt > 0.005 ? 'bad' : 'muted'}">${dt >= 0 ? '+' : ''}${dt.toFixed(2)} s / 400 m</span>
          <span class="muted">${(ps.mass - spec.mass) ? (ps.mass - spec.mass) + ' kg' : ''}</span></div>
          <button class="btn small ${Game.save.money >= price ? '' : 'off'}" data-act="buypart" data-v="${part.id}">ACHETER · ${money(price)}</button>`;
      }
      h += `<div class="part ${isSel ? 'sel' : ''}" data-act="tune" data-v="${part.id}">
        <div class="ph"><span>${part.icon} <b>${part.name}</b></span><span class="pips">${pips}</span></div>
        <div class="muted pd">${part.desc}</div>${body}</div>`;
    }
    return h + '</div></div>';
  },
  drawChart() {
    const cv = $('chart'); if (!cv) return;
    const ctx = cv.getContext('2d'), {cs, spec, prev} = this.tuneData();
    const stock = makeSpec(cs.id, cs.engine, {});
    const Wc = cv.width, Hc = cv.height, L = 46, R = 46, T = 14, B = 34;
    const css = getComputedStyle(document.documentElement);
    ctx.clearRect(0, 0, Wc, Hc);
    const specs = [stock, spec].concat(prev ? [prev] : []);
    const rMax = Math.max(...specs.map(s => s.red)) + 300, rMin = 1000;
    const pts = specs.map(s => curvePoints(s));
    const hpMax = Math.max(...pts.flat().map(p => p.hp)) * 1.12, tqMax = Math.max(...pts.flat().map(p => p.tq)) * 1.12;
    const nice = v => { const m = Math.pow(10, Math.floor(Math.log10(v))); const f = v / m; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * m; };
    const hpA = Math.ceil(hpMax / 50) * 50, tqA = Math.ceil(tqMax / 50) * 50;
    const X = r => L + (r - rMin) / (rMax - rMin) * (Wc - L - R);
    const Yh = v => Hc - B - v / hpA * (Hc - T - B), Yt = v => Hc - B - v / tqA * (Hc - T - B);
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.strokeStyle = '#2a3150'; ctx.fillStyle = '#8b94b8'; ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = T + i * (Hc - T - B) / 5;
      ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(Wc - R, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillStyle = '#ff9a2e'; ctx.fillText(Math.round(hpA * (1 - i / 5)), L - 5, y + 3);
      ctx.textAlign = 'left'; ctx.fillStyle = '#3ec8ff'; ctx.fillText(Math.round(tqA * (1 - i / 5)), Wc - R + 5, y + 3);
    }
    ctx.fillStyle = '#8b94b8'; ctx.textAlign = 'center';
    for (let r = 2000; r <= rMax; r += 1000) { const x = X(r); ctx.strokeStyle = '#232a46'; ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, Hc - B); ctx.stroke(); ctx.fillText((r / 1000) + 'k', x, Hc - B + 14); }
    ctx.fillText('tr/min', Wc / 2, Hc - 6);
    // zone rouge
    const curP = specs[specs.length - 1];
    ctx.strokeStyle = '#ff4a4a'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(curP.red), T); ctx.lineTo(X(curP.red), Hc - B); ctx.stroke(); ctx.setLineDash([]);
    const line = (p, key, Y, col, w, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath();
      let started = false;
      p.forEach(pt => { if (pt.cut) return; const x = X(pt.r), y = Y(pt[key]); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
      ctx.stroke(); ctx.setLineDash([]);
    };
    // origine (pointillés fins gris), actuel (plein), aperçu (tirets clairs)
    line(pts[0], 'hp', Yh, '#7c6a52', 1, [2, 3]); line(pts[0], 'tq', Yt, '#4a6a7c', 1, [2, 3]);
    line(pts[1], 'hp', Yh, '#ff9a2e', 3); line(pts[1], 'tq', Yt, '#3ec8ff', 3);
    if (prev) { line(pts[2], 'hp', Yh, '#ffe0a8', 2, [6, 4]); line(pts[2], 'tq', Yt, '#c8f0ff', 2, [6, 4]); }
    ctx.lineWidth = 1;
    // marqueurs de pic
    ctx.fillStyle = '#ff9a2e'; ctx.textAlign = 'left';
    const pk = pts[pts.length - 1].reduce((a, b) => b.hp > a.hp ? b : a);
    ctx.fillRect(X(pk.r) - 3, Yh(pk.hp) - 3, 6, 6);
    ctx.fillText(Math.round(pk.hp) + ' ch', Math.min(X(pk.r) + 6, Wc - R - 70), Yh(pk.hp) - 8);
  },

  /* ---------------- COURSE ---------------- */
  raceStart() {
    this.screen = 'race';
    $('panel').classList.add('hidden'); $('menu').classList.add('hidden'); $('homecard').classList.add('hidden'); $('result').classList.add('hidden');
    $('racebtns').classList.remove('hidden');
    $('nitrobtn').classList.toggle('hidden', !Race.plSpec.nitro);
  },
  showResult(res) {
    const o = Race.opp, r = $('result');
    r.classList.remove('hidden'); $('racebtns').classList.add('hidden');
    r.innerHTML = `<div class="rbox ${res.win ? 'win' : 'lose'}"><h2>${res.win ? '🏆 VICTOIRE !' : '💥 DÉFAITE'}</h2>
      <div class="muted">face à ${o.name} (${CARS[o.car].name})</div>
      <div class="rgrid"><span>Ton temps</span><b>${res.plT < 90 ? res.plT.toFixed(2) + ' s' : '—'}</b>
      <span>Son temps</span><b>${res.aiT < 90 ? res.aiT.toFixed(2) + ' s' : '—'}</b>
      <span>Réflexe</span><b>${res.fs ? 'FAUX DÉPART' : res.rt != null ? res.rt.toFixed(3) + ' s' : '—'}</b>
      <span>0 → 100 km/h</span><b>${res.t100 ? res.t100.toFixed(2) + ' s' : '—'}</b>
      <span>Vitesse finale</span><b>${Math.round(res.speed)} km/h</b>
      <span>Passages parfaits</span><b>${res.perfect}/${res.shifts}</b></div>
      ${res.record ? '<div class="gold">⭐ NOUVEAU RECORD DE LA VOITURE !</div>' : ''}
      <div class="reward">+ ${money(res.reward)} ${res.win && !res.first ? '<small>(course déjà gagnée : 40%)</small>' : ''}</div>
      <div class="rbtns"><button class="btn" data-act="race" data-v="${Race.oppIdx}">REJOUER</button>
      <button class="btn" data-act="go" data-v="races">COURSES</button>
      <button class="btn" data-act="go" data-v="tuning">TUNING</button></div></div>`;
  }
};

function paintThumbs() {
  document.querySelectorAll('canvas.thumb').forEach(cv => {
    const ctx = cv.getContext('2d'), st = CARS[cv.dataset.car].style, p = PROFILES[st];
    ctx.clearRect(0, 0, cv.width, cv.height);
    const y = cv.height - 10, x = Math.round((cv.width - p.L) / 2);
    drawCar(ctx, st, cv.dataset.color, x, y, 1, {wheelAng: 0.4});
  });
}
