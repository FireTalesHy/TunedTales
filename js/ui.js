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
    $('menu').classList.toggle('hidden', name !== 'home'); $('homecard').classList.toggle('hidden', name !== 'home'); $('racego').classList.toggle('hidden', name !== 'home');
    $('racebtns').classList.add('hidden'); $('result').classList.add('hidden');
    Race.stop(); Jobs.stop();
    if (name === 'home') { panel.classList.add('hidden'); this.refreshTop(); return; }
    panel.classList.remove('hidden');
    this.render();
  },

  render() {
    this.refreshTop();
    const fn = {body: this.rBody, jobs: this.rJobs, races: this.rRaces, garage: this.rGarage, tuning: this.rTuning, shop: this.rShop}[this.screen];
    const scroll = $('panelBody') ? $('panelBody').scrollTop : 0;
    $('panel').innerHTML = `<div class="phead"><button class="btn small" data-act="go" data-v="home">◀ ACCUEIL</button><h2>${this.title()}</h2></div><div id="panelBody">${fn.call(this)}</div>`;
    $('panelBody').scrollTop = scroll;
    paintThumbs();
    if (this.screen === 'tuning') this.drawChart();
    if (this.screen === 'body') this.drawShowroom();
  },
  title() { return {body: 'CARROSSERIE · Atelier visuel', jobs: 'PETITS BOULOTS · Arrondis tes fins de mois', races: '🏁 COURSES DE DRAG', garage: '🔧 GARAGE & MOTEURS', tuning: '📈 TUNING', shop: '🚗 CONCESSION'}[this.screen]; },

  /* ---------------- COURSES ---------------- */
  raceTab: 'contracts',
  rRaces() {
    const cs = Game.car(), spec = specOf(cs), est = estimateBest(spec);
    const tab = this.raceTab;
    let h = `<div class="racehead">
      <div class="you2"><canvas class="thumb" data-car="${cs.id}" data-color="${cs.color}" data-look='${JSON.stringify(lookOf(cs))}' width="300" height="116"></canvas>
        <div><div class="eyebrow">TA VOITURE</div><div class="big">${CARS[cs.id].name}</div>
        <div class="chips"><span class="chip">${ENGINES[cs.engine].name}</span><span class="chip">${Math.round(spec.hp)} ch</span><span class="chip">${fmt(spec.mass)} kg</span><span class="chip hl">400 m ≈ ${est.t400.toFixed(2)} s</span></div></div></div>
      <div class="howto"><b>Départ :</b> maintiens / relâche <kbd>ESPACE</kbd> (ou l'écran) pour <b>garder l'aiguille dans le vert</b> jusqu'au feu vert : la voiture part toute seule.<br>
      <b>Vitesses :</b> appuie quand l'aiguille entre dans la zone blanche · <kbd>N</kbd> nitro.</div></div>
      <div class="tabs"><button class="tab ${tab === 'contracts' ? 'on' : ''}" data-act="tab" data-v="contracts">📜 Contrats du jour</button>
      <button class="tab ${tab === 'pink' ? 'on' : ''}" data-act="tab" data-v="pink">🏴 Courses au titre</button>
      <button class="tab ${tab === 'legends' ? 'on' : ''}" data-act="tab" data-v="legends">👑 Légendes de la ville <small>${Object.keys(Game.save.wins).length}/${OPPONENTS.length}</small></button></div>`;
    if (tab === 'contracts') {
      const list = Game.contracts(); Game.persist();
      const st = Game.save.streak || 0, sm = Game.streakMult(st);
      h += `<div class="streak"><div class="flames">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<i class="${k < st ? 'on' : ''}"></i>`).join('')}</div>
        <div><b>SÉRIE : ${st} victoire${st > 1 ? 's' : ''}</b><span class="muted"> · prochaine victoire ×${sm.toFixed(1)} (max ×2,5) · une défaite remet à zéro</span></div></div>`;
      h += `<div class="sectionbar"><span class="muted">Trois propositions taillées pour ta voiture actuelle. Choisis-en une : les autres disparaissent après la course.</span>
        <button class="btn small ${Game.save.money >= CONTRACT_REFRESH ? 'ghostbtn' : 'off'}" data-act="refresh">↻ Nouveaux contrats · ${money(CONTRACT_REFRESH)}</button></div><div class="contracts">`;
      list.forEach((o, i) => { h += this.contractCard(o, i, spec, est); });
      h += '</div>';
    } else if (tab === 'pink') {
      const list = Game.pinkSlips(); Game.persist();
      h += `<div class="pinkhead"><b>COURSES AU TITRE DE PROPRIÉTÉ</b><span>Le gagnant repart avec la voiture de l'autre. Tu mets en jeu ta voiture actuelle : <b class="bad">${CARS[cs.id].name}</b> (valeur ${money(Game.carValue(cs))}). Si tu possèdes déjà le modèle gagné, son titre est revendu 70 % de sa valeur.</span></div>`;
      if (!list.length) h += `<div class="box">🔒 Il te faut <b>au moins 2 voitures</b> pour mettre un titre en jeu (sinon tu risquerais de te retrouver à pied). Passe à la concession !</div>`;
      else { h += '<div class="contracts">'; list.forEach((o, i) => { h += this.contractCard(o, i, spec, est, 'p'); }); h += '</div>'; }
    } else {
      h += '<div class="grid">';
      OPPONENTS.forEach((o, i) => {
        const os = makeSpec(o.car, o.engine, o.parts), oe = estimateBest(os);
        const done = Game.save.wins[i], diff = est.t400 - oe.t400;
        const level = diff > 0.6 ? ['Difficile', 'hard'] : diff > -0.4 ? ['Serré', 'mid'] : ['Facile', 'easy'];
        h += `<div class="card ${done ? 'done' : ''}"><div class="ctop"><span class="pill d-${level[1]}">${level[0]}</span><span class="muted">#${i + 1}</span></div>
          <canvas class="thumb" data-car="${o.car}" data-color="${Game.oppColor(i)}" data-look='${JSON.stringify(Game.ladderOpp(i).look)}' width="300" height="116"></canvas>
          <div class="ctitle">${o.name}${done ? ' <span class="good">✔</span>' : ''}</div><div class="muted">${o.tag}</div>
          <div class="kv"><span>Voiture</span><b>${CARS[o.car].name}</b></div>
          <div class="kv"><span>Moteur</span><b>${ENGINES[o.engine].name}</b></div>
          <div class="kv"><span>Puissance</span><b>${Math.round(os.hp)} ch</b></div>
          <div class="kv"><span>400 m (est.)</span><b>${oe.t400.toFixed(2)} s</b></div>
          <div class="rewardrow"><span class="muted">${done ? 'Revanche (40 %)' : 'Récompense'}</span><b class="gold">${money(done ? o.reward * 0.4 : o.reward)}</b></div>
          <button class="btn" data-act="race" data-v="l${i}">DÉFIER ▶</button></div>`;
      });
      h += '</div>';
    }
    return h;
  },
  contractCard(o, i, spec, est, pre) {
    pre = pre || 'c';
    const T = CONTRACT_TYPES.find(t => t.id === o.type), os = makeSpec(o.car, o.engine, o.parts);
    const mods = PARTS.filter(p => o.parts[p.id]).map(p => `<span class="chip sm">${p.icon} ${p.name} ${o.parts[p.id]}</span>`).join('') || '<span class="chip sm">100 % d\'origine</span>';
    const bar = (label, a, b, unit, lowBetter, dec) => {
      const mx = Math.max(a, b) * 1.08, f = v => (lowBetter ? (mx * 1.0 - v + Math.min(a, b) * 0.5) / (mx * 1.0 - Math.min(a, b) * 0.5) : v / mx) * 100;
      const better = lowBetter ? a <= b : a >= b;
      return `<div class="vsrow"><div class="vsl"><span>${label}</span><span><b class="${better ? 'good' : 'bad'}">${a.toFixed(dec)}</b> <i class="muted">vs</i> <b>${b.toFixed(dec)}</b> ${unit}</span></div>
        <div class="vsbars"><div class="vb me" style="width:${clamp(f(a), 4, 100)}%"></div><div class="vb him" style="width:${clamp(f(b), 4, 100)}%"></div></div></div>`;
    };
    const total = o.type === 'bet' ? o.reward + o.stake : o.reward, pink = o.type === 'pink';
    return `<div class="contract c-${o.diff} ${pink ? 'c-pink' : ''}">
      <div class="ctop"><span class="pill d-${o.diff}">${o.diffLabel}</span><span class="pill type">${T.icon} ${T.label}</span></div>
      <div class="cstage"><canvas class="thumb big" data-car="${o.car}" data-color="${o.color}" data-look='${JSON.stringify(o.look || null)}' width="300" height="116"></canvas></div>
      <div class="cname"><b>${o.name}</b><span class="muted">${o.tag}</span></div>
      <div class="ccar">${CARS[o.car].name} <span class="muted">· ${ENGINES[o.engine].name}</span></div>
      <div class="chips">${mods}</div>
      ${bar('Puissance', spec.hp, os.hp, 'ch', false, 0)}
      ${bar('400 m estimé', est.t400, o.est, 's', true, 2)}
      <div class="cond">${T.desc(o)}</div>
      ${pink ? `<div class="rewardrow"><span class="muted">Tu gagnes</span><b class="gold big">Sa ${CARS[o.car].name.split(' ').slice(1).join(' ')}</b></div>
        <div class="muted small">Valeur ${money(o.value)}${Game.owns(o.car) ? ` · déjà au garage : revendue ${money(o.reward)}` : ' · ajoutée à ton garage avec ses pièces'}</div>
        <div class="small bad">⚠ Défaite : tu perds ta ${CARS[Game.car().id].name}</div>` :
      `<div class="rewardrow"><span class="muted">${o.type === 'bet' ? 'Gain total' : 'Récompense'}</span><b class="gold big">${money(total)}</b></div>
      ${o.type === 'bet' ? `<div class="muted small">En cas de défaite : −${money(o.stake)}</div>` : '<div class="muted small">Défaite : prime de 10 %</div>'}`}
      <button class="btn" data-act="race" data-v="${pre}${i}">${pink ? 'METTRE MA VOITURE EN JEU ▶' : 'ACCEPTER LE CONTRAT ▶'}</button></div>`;
  },

  /* ---------------- CARROSSERIE (personnalisation visuelle) ---------------- */
  bodyCat: 'color', lookDraft: {},
  draftLook() { const cs = Game.car(); return Object.assign(lookOf(cs), this.lookDraft); },
  draftColor() { return this.lookDraft.color || Game.car().color; },
  draftCost() {
    const cs = Game.car(); let t = 0;
    for (const [id, v] of Object.entries(this.lookDraft)) t += id === 'color' ? (v !== cs.color ? 50 : 0) : Game.lookPrice(cs, id, v);
    return t;
  },
  rBody() {
    const cs = Game.car(), cur = lookOf(cs), dl = this.draftLook(), cat = this.bodyCat;
    const cats = [{id: 'color', name: 'Couleur', sub: 'Teinte de caisse'}].concat(VISUAL.map(v => ({id: v.id, name: v.name, sub: v.sub})));
    let h = `<div class="bs"><div class="bs-left"><div class="bs-stage"><canvas id="bsview" width="900" height="370"></canvas>
      <div class="bs-title"><span class="eyebrow">ATELIER CARROSSERIE</span><b>${CARS[cs.id].name}</b></div>
      <div class="bs-nav"><button class="btn small ghostbtn" data-act="tunecar" data-v="-1">◀ Voiture préc.</button><button class="btn small ghostbtn" data-act="tunecar" data-v="1">Voiture suiv. ▶</button></div></div>
      %%CART%%</div>
      <div class="bs-side"><nav class="bs-cats">`;
    for (const c of cats) {
      const changed = c.id === 'color' ? this.lookDraft.color != null : this.lookDraft[c.id] != null;
      h += `<button class="bs-cat ${c.id === cat ? 'on' : ''}" data-act="bcat" data-v="${c.id}"><b>${c.name}</b><small>${c.sub}</small>${changed ? '<i class="dot"></i>' : ''}</button>`;
    }
    h += `</nav><div class="bs-opts">`;
    if (cat === 'color') {
      for (const p of PAINTS) {
        const eq = p === cs.color, sel = p === this.draftColor();
        h += `<button class="bs-opt sw ${sel ? 'sel' : ''}" data-act="bopt" data-v="color|${p}"><span class="swatch" style="background:${p}"></span><span class="on">${eq ? 'ÉQUIPÉ' : '50 €'}</span></button>`;
      }
    } else {
      const V = VISUAL.find(v => v.id === cat);
      V.opts.forEach((o, i) => {
        const eq = cur[cat] === o.v, sel = dl[cat] === o.v, owned = Game.lookOwned(cs, cat, o.v);
        const tag = eq ? '<span class="on">ÉQUIPÉ</span>' : owned ? '<span class="own2">POSSÉDÉ</span>' : `<span class="pr">${money(o.p)}</span>`;
        const sw = V.colors ? `<span class="swatch" style="background:${o.v}"></span>` : cat === 'wheelColor' ? `<span class="swatch" style="background:${WHEEL_COLORS[o.v]}"></span>` : cat === 'neon' && o.v !== 'none' ? `<span class="swatch glow" style="background:rgb(${NEON_COLORS[o.v]});box-shadow:0 0 14px rgb(${NEON_COLORS[o.v]})"></span>` : '';
        h += `<button class="bs-opt ${sel ? 'sel' : ''} ${V.colors ? 'sw' : ''}" data-act="bopt" data-v="${cat}|${i}">${sw}<span class="nm">${o.n}</span>${o.d ? `<small>${o.d}</small>` : ''}${tag}</button>`;
      });
    }
    const cost = this.draftCost(), n = Object.keys(this.lookDraft).length;
    const cart = `<div class="bs-cart"><div><span class="muted">${n ? n + ' modification' + (n > 1 ? 's' : '') + ' en aperçu' : 'Choisis des éléments pour les essayer'}</span>
      <b class="gold">${n ? money(cost) : ''}</b></div>
      <div class="bs-actions"><button class="btn ghostbtn small" data-act="bcancel" ${n ? '' : 'disabled'}>Annuler</button>
      <button class="btn ${n && Game.save.money >= cost ? '' : 'off'}" data-act="bapply">${cost ? 'ACHETER & ÉQUIPER · ' + money(cost) : 'ÉQUIPER'}</button></div></div>`;
    h += '</div></div></div>';
    return h.replace('%%CART%%', cart);
  },
  drawShowroom() {
    const cv = $('bsview'); if (!cv) return;
    const ctx = cv.getContext('2d'), cs = Game.car(), st = CARS[cs.id].style, p = PROFILES[st], lk = this.draftLook(), col = this.draftColor();
    ctx.imageSmoothingEnabled = false;
    const g = ctx.createLinearGradient(0, 0, 0, 370); g.addColorStop(0, '#05070f'); g.addColorStop(0.61, '#0d1630'); g.addColorStop(0.62, '#0a0f1f'); g.addColorStop(1, '#03050b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 900, 370);
    // projecteurs et grille au sol
    for (const sx of [180, 450, 720]) { const l = ctx.createRadialGradient(sx, 0, 0, sx, 0, 320); l.addColorStop(0, 'rgba(120,200,255,0.18)'); l.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = l; ctx.fillRect(sx - 320, 0, 640, 330); }
    ctx.strokeStyle = 'rgba(25,230,255,0.12)'; ctx.lineWidth = 1;
    for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(450 + i * 40, 230); ctx.lineTo(450 + i * 130, 370); ctx.stroke(); }
    for (const y of [238, 252, 274, 304, 344]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(900, y); ctx.stroke(); }
    const s = Math.min(2.5, 800 / p.L), x = Math.round(450 - p.L * s / 2), y = 344;
    ctx.save(); ctx.globalAlpha = 0.2; ctx.translate(0, y * 2 + 4); ctx.scale(1, -1); drawCar(ctx, st, col, x, y, s, {wheelAng: 0.3, look: lk}); ctx.restore();
    drawCar(ctx, st, col, x, y, s, {wheelAng: 0.3, look: lk});
    drawCarLights(ctx, st, x, y, s, {neon: NEON_COLORS[lk.neon]});
  },

  /* ---------------- PETITS BOULOTS ---------------- */
  rJobs() {
    const best = Game.save.jobs || {};
    let h = `<div class="jobs-intro"><p>Trois mini-jeux pour te refaire quand les contrats tournent mal. Ton score est converti en euros : plus tu joues propre, plus tu es payé.</p>
      <div class="jobs-badges"><span class="jbadge">${JOB_SVG.clock} Rejouable à volonté</span><span class="jbadge">${JOB_SVG.trophy} Meilleurs scores sauvegardés</span></div></div>
      <div class="jobs-grid">`;
    for (const j of JOBS) {
      const T = JOB_THEME[j.id], sc = best[j.id] || 0, pct = clamp(sc / T.target * 100, 0, 100);
      h += `<article class="jobc" style="--jc:${T.color};--jbg:${T.bg};--jbd:${T.bd};--jlt:${T.light}">
        <div class="jobc-art">${JOB_SVG[j.id]}
          <span class="jtag l">${j.time ? j.time + ' s' : '10 écrous'}</span><span class="jtag r">${fmt(j.rate * 100)} € / 100 pts</span></div>
        <div class="jobc-body"><h2>${j.name}</h2><p>${T.desc}</p>
          <div class="jkeys">${T.keys}</div>
          <div class="jbest"><div class="jrow"><span class="jlab">MEILLEUR SCORE</span><span class="jval">${sc ? fmt(sc) + ' pts' : '—'}</span></div>
            <div class="jbar"><div style="width:${pct}%"></div></div>
            <div class="jrow small"><span>Paie correspondante</span><b class="gold">${sc ? money(sc * j.rate) : '—'}</b></div></div>
          <button class="btn jgo" data-act="job" data-v="${j.id}">COMMENCER</button></div></article>`;
    }
    return h + '</div>';
  },
  jobStart() {
    this.screen = 'job';
    $('panel').classList.add('hidden'); $('menu').classList.add('hidden'); $('homecard').classList.add('hidden'); $('racego').classList.add('hidden'); $('result').classList.add('hidden');
    $('racebtns').classList.remove('hidden'); $('nitrobtn').classList.add('hidden');
  },
  showJobResult(job, score, pay, record) {
    const r = $('result'); r.classList.remove('hidden'); $('racebtns').classList.add('hidden');
    r.innerHTML = `<div class="rbox win"><div class="eyebrow">PETIT BOULOT</div><h2>${job.icon} TERMINÉ</h2><div class="muted">${job.name}</div>
      <div class="payout"><div class="pl"><span>Score</span><b>${fmt(score)} pts</b></div>
      ${record ? '<div class="pl"><span class="gold">⭐ Nouveau meilleur score</span><b></b></div>' : ''}
      <div class="pl total"><span>Paie</span><b class="gold">+ ${money(pay)}</b></div></div>
      <div class="rbtns"><button class="btn" data-act="job" data-v="${job.id}">REJOUER</button><button class="btn ghostbtn" data-act="go" data-v="jobs">AUTRES BOULOTS</button><button class="btn ghostbtn" data-act="go" data-v="home">GARAGE</button></div></div>`;
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
        <canvas class="thumb" data-car="${id}" data-color="${c.color}" data-look='${JSON.stringify(lookOf(c))}' width="300" height="116"></canvas>
        <div class="muted">${ENGINES[c.engine].name} · ${Math.round(s2.hp)} ch</div>
        ${best ? `<div class="muted">Record 400 m : <b>${best.toFixed(2)} s</b></div>` : ''}
        <button class="btn ${id === cs.id ? 'off' : ''}" data-act="selcar" data-v="${id}">${id === cs.id ? 'EN SERVICE' : 'CONDUIRE'}</button>
        ${Object.keys(Game.save.cars).length > 1 ? `<button class="btn small ghostbtn" data-act="sellcar" data-v="${id}">VENDRE · ${money(Game.carValue(c) * 0.6)}</button>` : ''}</div>`;
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
    const listen = `<button class="btn small ghostbtn" data-act="listen" data-v="eng:${id}" title="Écouter">🔊</button>`;
    const action = listen + (current ? '<span class="own">MONTÉ</span>' :
      mode === 'swap' ? `<button class="btn small ${Game.save.money >= ENGINE_SWAP_FEE ? '' : 'off'}" data-act="swap" data-v="${id}">MONTER</button>` :
      `<button class="btn small ${Game.save.money >= e.price ? '' : 'off'}" data-act="buyeng" data-v="${id}">${money(e.price)}</button>`);
    return `<div class="eng ${current ? 'sel' : ''}"><div><b>${e.name}</b> <span class="muted">${e.kind}</span><br>
      <span class="muted">${Math.round(sp.hp)} ch${current ? '' : d(dh, ' ch')} · ${Math.round(sp.tq)} Nm · zone rouge ${fmt(sp.red)} · ${e.mass} kg</span><br>
      <span class="muted">400 m avec tes pièces : <b>${est.t400.toFixed(2)} s</b></span></div><div class="engact">${action}</div></div>`;
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
      <button class="btn small" data-act="tunecar" data-v="1">▶</button>
      <span class="spacer"></span>
      <button class="btn small ghostbtn" data-act="listen" data-v="cur">🔊 Écouter le moteur</button>
      ${sel && (cs.parts[sel.id] || 0) < sel.tiers.length && ['exhaust', 'turbo', 'intake'].includes(sel.id) ? `<button class="btn small" data-act="listen" data-v="prev">🔊 Avec ${sel.name} niv. ${(cs.parts[sel.id] || 0) + 1}</button>` : ''}</div>
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
    $('panel').classList.add('hidden'); $('menu').classList.add('hidden'); $('homecard').classList.add('hidden'); $('racego').classList.add('hidden'); $('result').classList.add('hidden');
    $('racebtns').classList.remove('hidden');
    $('nitrobtn').classList.toggle('hidden', !Race.plSpec.nitro);
  },
  showResult(res) {
    const o = Race.opp, r = $('result');
    r.classList.remove('hidden'); $('racebtns').classList.add('hidden');
    const lines = (res.lines || []).map(([l, v, k]) => k === 'car' ? `<div class="pl"><span class="good">${l}</span><b class="good">AU GARAGE</b></div>` :
      k === 'lost' ? `<div class="pl"><span class="bad">${l}</span><b class="bad">TITRE CÉDÉ</b></div>` : k === 'info' ? `<div class="pl"><span class="muted">${l}</span><b></b></div>` :
      `<div class="pl"><span>${l}</span><b class="${v >= 0 ? 'gold' : 'bad'}">${v >= 0 ? '+' : '−'} ${money(Math.abs(v))}</b></div>`).join('');
    const again = o.kind === 'ladder' ? `<button class="btn" data-act="race" data-v="l${o.idx}">REJOUER</button>` : `<button class="btn" data-act="go" data-v="races">NOUVEAUX CONTRATS</button>`;
    r.innerHTML = `<div class="rbox ${res.win ? 'win' : 'lose'}"><div class="eyebrow">${o.kind === 'ladder' ? 'LÉGENDE DE LA VILLE' : 'CONTRAT'}</div>
      <h2>${res.win ? 'VICTOIRE' : 'DÉFAITE'}</h2>
      <div class="muted">face à ${o.name} · ${CARS[o.car].name}</div>
      <div class="rgrid"><span>Ton temps</span><b>${res.plT < 90 ? res.plT.toFixed(3) + ' s' : '—'}</b>
      <span>Son temps</span><b>${res.aiT < 90 ? res.aiT.toFixed(3) + ' s' : '—'}</b>
      <span>Régime dans le vert</span><b class="${res.zone >= 0.9 ? 'good' : ''}">${Math.round((res.zone || 0) * 100)} %</b>
      <span>Qualité du départ</span><b>${Math.round((res.launchQ || 0) * 100)} %</b>
      <span>0 → 100 km/h</span><b>${res.t100 ? res.t100.toFixed(2) + ' s' : '—'}</b>
      <span>Vitesse de passage</span><b>${Math.round(res.speed)} km/h</b>
      <span>Passages parfaits</span><b>${res.perfect}/${res.shifts}</b></div>
      ${res.record ? '<div class="gold">⭐ NOUVEAU RECORD POUR CETTE VOITURE</div>' : ''}
      <div class="payout">${lines}<div class="pl total"><span>Total</span><b class="${res.reward >= 0 ? 'gold' : 'bad'}">${res.reward >= 0 ? '+' : '−'} ${money(Math.abs(res.reward))}</b></div></div>
      <div class="rbtns">${again}<button class="btn ghostbtn" data-act="go" data-v="tuning">TUNING</button><button class="btn ghostbtn" data-act="go" data-v="home">GARAGE</button></div></div>`;
  }
};

function paintThumbs() {
  document.querySelectorAll('canvas.thumb').forEach(cv => {
    const ctx = cv.getContext('2d'), st = CARS[cv.dataset.car].style, p = PROFILES[st];
    ctx.clearRect(0, 0, cv.width, cv.height);
    const y = cv.height - 10, x = Math.round((cv.width - p.L) / 2);
    let look = null; try { look = cv.dataset.look ? JSON.parse(cv.dataset.look) : null; } catch (e) {}
    drawCar(ctx, st, cv.dataset.color, x, y, 1, {wheelAng: 0.4, look});
  });
}
