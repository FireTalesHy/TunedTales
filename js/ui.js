/* ============ INTERFACE : écrans HTML par-dessus le canvas ============ */
const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('fr-FR');
const money = n => fmt(n) + ' €';

const UI = {
  screen: 'home', tuneSel: null, garageCar: null,

  refreshTop() {
    this.animCash(Game.save.money);
    const rep = $('rep'); if (rep) { const s = Game.save, n = Game.xpNeed(); rep.innerHTML = `<b>NIV ${Game.level()}</b><i><u style="width:${clamp((s.xp || 0) / n * 100, 0, 100)}%"></u></i>${Game.claimable() ? `<em>${Game.claimable()}</em>` : ''}`; rep.title = `Réputation : ${s.xp || 0} / ${n} XP · bonus +${Math.round(Game.repBonus() * 100)} % sur les gains`; }
    const cs = Game.car(), sp = specOf(cs), best = Game.save.best[cs.id];
    $('carname').textContent = CARS[cs.id].name;
    const wins = Object.keys(Game.save.wins).length;
    $('homecard').innerHTML = `<div class="hc-t">${Game.crew().name.toUpperCase()} · TA VOITURE</div><div class="hc-n">${CARS[cs.id].name}</div>
      <div class="muted">${ENGINES[cs.engine].name} · ${CARS[cs.id].drive}</div>
      ${Game.totalTurfRate() ? `<div class="hc-inc">💰 ${money(Game.totalPending())} à encaisser · ${money(Game.totalTurfRate())}/h</div>` : ''}
      <div class="hc-s"><span><b>${Math.round(sp.hp)} ch</b>puissance</span><span><b>${best ? best.toFixed(2) + ' s' : '—'}</b>record 400 m</span><span><b>${wins}/${OPPONENTS.length}</b>victoires</span></div>`;
  },

  go(name) {
    this.screen = name;
    const panel = $('panel');
    $('menu').classList.toggle('hidden', name !== 'home'); $('homecard').classList.toggle('hidden', name !== 'home'); $('racego').classList.toggle('hidden', name !== 'home');
    $('racebtns').classList.add('hidden'); $('result').classList.add('hidden');
    Race.stop(); Jobs.stop();
    if (name === 'home') { panel.classList.add('hidden'); this._lastScreen = null; this.refreshTop(); return; }
    panel.classList.remove('hidden');
    this.render();
  },

  /* compteur d'argent qui défile vers sa nouvelle valeur */
  animCash(target) {
    const el = $('cash'); if (this._cash == null) { this._cash = target; el.textContent = money(target); return; }
    if (target === this._cash) return;
    const from = this._cash, t0 = performance.now(), d = Math.min(1200, 300 + Math.abs(target - from) / 50);
    el.classList.remove('up', 'down'); void el.offsetWidth; el.classList.add(target > from ? 'up' : 'down');
    this._cash = target; cancelAnimationFrame(this._cashRaf);
    const step = now => { const u = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - u, 3); el.textContent = money(from + (target - from) * e); if (u < 1) this._cashRaf = requestAnimationFrame(step); };
    this._cashRaf = requestAnimationFrame(step);
  },
  cashPing() { const el = $('cash'); el.classList.remove('ping'); void el.offsetWidth; el.classList.add('ping'); },
  render() {
    this.refreshTop();
    const fn = {body: this.rBody, jobs: this.rJobs, races: this.rRaces, garage: this.rGarage, tuning: this.rTuning, shop: this.rShop}[this.screen];
    const scroll = $('panelBody') ? $('panelBody').scrollTop : 0;
    $('panel').innerHTML = `<div class="phead"><button class="btn small" data-act="go" data-v="home">◀ ACCUEIL</button><h2>${this.title()}</h2></div><div id="panelBody">${fn.call(this)}</div>`;
    $('panelBody').scrollTop = scroll;
    if (this._lastScreen !== this.screen) { $('panelBody').classList.add('enter'); this._lastScreen = this.screen; $('panelBody').scrollTop = 0; }
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
      <div class="you2"><canvas class="thumb" data-car="${cs.id}" data-color="${cs.color}" data-look='${JSON.stringify(lookOf(cs))}' width="600" height="232"></canvas>
        <div><div class="eyebrow">TA VOITURE</div><div class="big">${CARS[cs.id].name}</div>
        <div class="chips"><span class="chip">${ENGINES[cs.engine].name}</span><span class="chip">${Math.round(spec.hp)} ch</span><span class="chip">${fmt(spec.mass)} kg</span><span class="chip hl">400 m ≈ ${est.t400.toFixed(2)} s</span></div></div></div>
      <div class="howto"><b>Départ :</b> <span class="kb">maintiens / relâche <kbd>ESPACE</kbd></span><span class="tc">pose / lève le doigt sur l'écran</span> pour <b>garder l'aiguille dans le vert</b> jusqu'au feu vert : la voiture part toute seule.<br>
      <b>Burnout :</b> avant le départ, maintiens pour chauffer les pneus et relâche dans le vert (+10 % d'adhérence).<br>
      <b>Vitesses :</b> <span class="kb">appuie</span><span class="tc">touche l'écran</span> quand l'aiguille entre dans la zone blanche · <span class="kb"><kbd>N</kbd> nitro</span><span class="tc">bouton NITRO en bas à droite</span>.</div></div>
      <div class="tabs"><button class="tab ${tab === 'contracts' ? 'on' : ''}" data-act="tab" data-v="contracts">📜 Contrats du jour</button>
      <button class="tab ${tab === 'pink' ? 'on' : ''}" data-act="tab" data-v="pink">🏴 Courses au titre</button>
      <button class="tab ${tab === 'legends' ? 'on' : ''}" data-act="tab" data-v="legends">⚔️ Clans <small>${CLANS.filter(c => Game.clanDefeated(c)).length}/${CLANS.length}</small></button>
      <button class="tab ${tab === 'tour' ? 'on' : ''}" data-act="tab" data-v="tour">👑 Tournoi</button>
      <button class="tab ${tab === 'chal' ? 'on' : ''}" data-act="tab" data-v="chal">🎯 Défis ${Game.claimable() ? `<small class="new">${Game.claimable()}</small>` : ''}</button></div>`;
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
    } else if (tab === 'tour') {
      h += this.rTour(spec, est);
    } else if (tab === 'chal') {
      h += this.rChallenges();
    } else {
      h += this.rClans();
    }
    return h;
  },
  rTour(spec, est) {
    const T = Game.tour(), th = Game.tourTheme(), ok = th.ok(Game.car()), days = 7 - Math.floor((Date.now() / 864e5 + 3) % 7);
    const eligible = Object.keys(Game.save.cars).filter(id => th.ok(Game.save.cars[id]));
    let h = `<div class="tourhead"><div class="tour-ic">${th.icon}</div><div><div class="eyebrow">TOURNOI DE LA SEMAINE · encore ${days} jour${days > 1 ? 's' : ''}</div>
      <b>${th.name}</b><span class="muted">${th.desc} · 3 tours à élimination directe · prime du champion <b class="gold">${money(Game.tourPrize())}</b></span></div></div>
      <div class="bracket">${TOUR_ROUNDS.map((R, i) => `<div class="br ${T.done || i < T.round ? 'won' : i === T.round ? 'cur' : ''}"><small>${R.label}</small><b>${T.done || i < T.round ? '✔' : i === T.round ? '▶' : '·'}</b></div>`).join('<i></i>')}<i></i><div class="br final ${T.done ? 'won' : ''}"><small>Champion</small><b>👑</b></div></div>`;
    if (T.done) h += `<div class="box champ">👑 <b>Tu as remporté le tournoi de la semaine !</b> Reviens la semaine prochaine pour un nouveau thème.</div>`;
    else if (!ok) h += `<div class="box">🔒 Ta <b>${CARS[Game.car().id].name}</b> n'est pas admise (${th.desc.toLowerCase()}). ${eligible.length ? `Dans ton garage, tu peux engager : <b>${eligible.map(id => CARS[id].name).join(', ')}</b>.` : 'Aucune voiture de ton garage n\'est admise : passe à la concession !'}</div>`;
    else { const o = Game.tourOpp(); Game.persist(); h += `<div class="contracts tour1">${this.contractCard(o, 0, spec, est, 't')}</div>`; }
    return h;
  },
  rChallenges() {
    const s = Game.save, n = Game.xpNeed(), st = s.stats || {};
    let h = `<div class="replv"><div class="replv-n"><small>RÉPUTATION</small><b>${Game.level()}</b></div>
      <div class="replv-b"><div class="xpbar"><i style="width:${clamp((s.xp || 0) / n * 100, 0, 100)}%"></i></div>
      <span>${fmt(s.xp || 0)} / ${fmt(n)} XP · bonus permanent <b class="gold">+${Math.round(Game.repBonus() * 100)} %</b> sur les gains de course · niveau suivant : <b class="gold">${money(Math.round(500 * Math.pow(Game.level() + 1, 1.5) / 10) * 10)}</b></span></div>
      <div class="replv-s"><span><b>${st.wins || 0}</b>victoires</span><span><b>${st.bestET ? st.bestET.toFixed(2) + ' s' : '—'}</b>meilleur 400 m</span><span><b>${st.bestTrap ? st.bestTrap + ' km/h' : '—'}</b>vitesse max</span><span><b>${st.perfLaunch || 0}</b>départs parfaits</span></div></div>
      <div class="chals">`;
    for (const c of CHALLENGES) {
      const S = Game.chalState(c), R = S.max ? null : Game.chalReward(c, S.done);
      const prog = S.max ? 100 : c.lower ? (S.v ? clamp((c.tiers[0] * 1.15 - S.v) / (c.tiers[0] * 1.15 - S.tier) * 100, 0, 100) : 0) : clamp(S.v / S.tier * 100, 0, 100);
      const cur = c.lower ? (S.v ? S.v.toFixed(2) + ' s' : '—') : fmt(Math.round(S.v)) + (S.max ? '' : ' / ' + fmt(S.tier));
      h += `<div class="chal ${S.ok ? 'ready' : ''} ${S.max ? 'max' : ''}"><div class="chal-i">${c.icon}</div><div class="chal-m">
        <div class="chal-h"><b>${c.name}</b><span class="pips">${c.tiers.map((_, i) => `<i class="${i < S.done ? 'on' : ''}"></i>`).join('')}</span></div>
        <div class="muted">${S.max ? 'Tous les paliers sont terminés !' : c.d(S.tier)}</div>
        <div class="xpbar sm"><i style="width:${prog}%"></i></div><div class="chal-f"><span class="muted">${cur}</span>
        ${S.max ? '<b class="good">✔ MAÎTRISÉ</b>' : S.ok ? `<button class="btn small" data-act="claim" data-v="${c.id}">RÉCUPÉRER · ${money(R.cash)}</button>` : `<span class="gold">${money(R.cash)} · +${R.xp} XP</span>`}</div></div></div>`;
    }
    return h + '</div>';
  },
  /* ---------------- CLANS ---------------- */
  rClans() {
    const crew = Game.crew(), joined = CLANS.filter(c => Game.clanDefeated(c));
    let h = `<div class="crew" style="--cc:${crew.color}"><div class="crew-emb">${crew.name.slice(0, 2).toUpperCase()}</div>
      <div class="crew-main"><div class="eyebrow">TON CLAN</div>
        <div class="crew-edit"><input id="crewname" maxlength="24" value="${crew.name.replace(/"/g, '&quot;')}" aria-label="Nom de ton clan">
        <div class="crew-cols">${['#19e6ff', '#ff2bd6', '#ffd23f', '#3dff7a', '#ff7a1a', '#9b6bff', '#ff3b5c', '#f4f4f8'].map(c => `<button class="crew-col ${c === crew.color ? 'sel' : ''}" style="background:${c}" data-act="crewcol" data-v="${c}" aria-label="Couleur"></button>`).join('')}</div>
        <button class="btn small" data-act="crewsave">ENREGISTRER</button></div>
        <div class="crew-joined">${joined.length ? joined.map(c => `<span class="chip" style="border-color:${c.color}">${c.emblem} ${c.name} · <b>${c.perk.label}</b></span>`).join('') : '<span class="muted">Aucun clan rallié pour l\'instant. Bats un boss pour qu\'il rejoigne ton clan et t\'offre un bonus permanent.</span>'}</div>
      </div></div>`;
    const rate = Game.totalTurfRate(), pend = Game.totalPending();
    h += `<div class="income"><div><div class="eyebrow">REVENUS DU CLAN</div><b class="inc-rate">${money(rate)} / h</b>
        <span class="muted">${rate ? 'Tes territoires rapportent même quand le jeu est fermé (plafond d\'heures par territoire).' : 'Bats le chef d\'un clan pour prendre son territoire et toucher des revenus passifs.'}</span></div>
      <div class="inc-pend"><span class="muted">À encaisser</span><b class="gold">${money(pend)}</b>
      <button class="btn ${pend ? '' : 'off'}" data-act="collect" data-v="all">💰 ENCAISSER TOUT</button></div></div>`;
    CLANS.forEach((c, ci) => {
      const open = Game.clanUnlocked(ci), done = Game.clanDefeated(c), bossOpen = Game.bossUnlocked(c);
      const respect = c.members.filter(m => Game.save.wins[m]).length + (done ? 1 : 0);
      h += `<section class="clan ${open ? '' : 'locked'} ${done ? 'won' : ''}" style="--cc:${c.color}">
        <header class="clan-head"><span class="clan-emb">${c.emblem}</span><div><b>${c.name}</b><span class="muted"> · ${c.turf}</span>
          <div class="clan-perk">Bonus si vaincu : <b>${c.perk.label}</b></div></div>
          <div class="clan-resp"><span>RESPECT</span><div class="rbar"><div style="width:${respect / 3 * 100}%"></div></div></div>
          ${done ? `<button class="btn small ghostbtn" data-act="lore" data-v="${c.id}">📖 ${LORE[c.id].title.split(' — ')[0]}</button>` : ''}</header>`;
      if (done) {
        const t = Game.turf(c.id), cost = Game.turfUpCost(c.id), pc = Game.turfPending(c.id);
        h += `<div class="turf"><span>🏴 Territoire : <b>${TURF[c.id].name}</b> · niv. ${t.lvl}/5</span><span>${money(Game.turfRate(c.id))} / h · plafond ${Game.turfCap(c.id)} h</span>
          <span class="gold">${money(pc)} en attente</span>
          <button class="btn small ${pc ? '' : 'off'}" data-act="collect" data-v="${c.id}">ENCAISSER</button>
          ${cost ? `<button class="btn small ghostbtn ${Game.save.money >= cost ? '' : 'off'}" data-act="turfup" data-v="${c.id}">⬆ DÉVELOPPER · ${money(cost)}</button>` : '<span class="good">NIVEAU MAX</span>'}</div>`;
      }
      if (!open) { h += `<div class="clan-lock">🔒 Bats d'abord le chef de « ${CLANS[ci - 1].name} » pour être pris au sérieux sur ce territoire.</div></section>`; return; }
      h += '<div class="clan-row">';
      for (const idx of [...c.members, c.boss]) {
        const o = OPPONENTS[idx], isBoss = idx === c.boss, won = Game.save.wins[idx], lockB = isBoss && !bossOpen;
        const lo = Game.ladderOpp(idx), os = makeSpec(o.car, o.engine, o.parts), oe = estimateBest(os);
        h += `<div class="card ${isBoss ? 'boss' : ''} ${won ? 'done' : ''}">
          <div class="ctop">${isBoss ? '<span class="pill d-hard">👑 BOSS</span>' : '<span class="pill type">Membre</span>'}${won ? '<span class="good">✔ battu</span>' : ''}</div>
          <canvas class="thumb" data-car="${o.car}" data-color="${lo.color}" data-look='${JSON.stringify(lo.look)}' width="600" height="232"></canvas>
          <div class="ctitle">${o.name}</div><div class="muted">${o.tag}</div>
          <div class="kv"><span>Voiture</span><b>${CARS[o.car].name}</b></div>
          <div class="kv"><span>Puissance · 400 m</span><b>${Math.round(os.hp)} ch · ${oe.t400.toFixed(2)} s</b></div>
          <div class="rewardrow"><span class="muted">${won ? 'Revanche (40 %)' : 'Récompense'}</span><b class="gold">${money(won ? o.reward * 0.4 : o.reward)}</b></div>
          ${lockB ? '<button class="btn off" data-act="noop">🔒 BATS SES MEMBRES</button>' : `<button class="btn" data-act="race" data-v="l${idx}">${isBoss ? 'DÉFIER LE BOSS ▶' : 'DÉFIER ▶'}</button>`}</div>`;
      }
      h += '</div></section>';
    });
    return h;
  },
  /* ---- banc de puissance animé ---- */
  dyno() {
    this.dynoStop();
    const cs = Game.car(), sp = specOf(cs), c = CARS[cs.id], st = c.style, p = PROFILES[st], lk = lookOf(cs), r = $('result');
    const loss = c.drive === 'AWD' ? 0.80 : 0.85;
    r.classList.remove('hidden');
    r.innerHTML = `<div class="rbox dyno"><div class="eyebrow">BANC DE PUISSANCE · ${c.drive}</div><h2>${c.name}</h2>
      <canvas id="dynocv" width="1920" height="800"></canvas>
      <div class="rbtns"><button class="btn" data-act="dyno">↻ RELANCER</button><button class="btn ghostbtn" data-act="dyno-close">FERMER</button></div></div>`;
    const cv = $('dynocv'), ctx = cv.getContext('2d'), t0 = performance.now(), pts = [];
    const v = Sound.ready ? Sound.engine(cs.engine, cs.parts, {vol: 1}) : null; this._dynoV = v;
    const rMin = 1500, rMax = sp.red, hpMax = sp.hp * 1.15, tqMax = sp.tq * 1.2, s = Math.min(1.35, 430 / p.L);
    let ang = 0, last = t0, best = {hp: 0, r: 0, tq: 0, tr: 0};
    const frame = now => {
      if (!$('dynocv')) return this.dynoStop();
      const T = (now - t0) / 1000, dt = (now - last) / 1000; last = now; ctx.setTransform(HD, 0, 0, HD, 0, 0);
      let rpm, load = 1;
      if (T < 0.8) { rpm = 900; load = 0.1; } else if (T < 5.2) rpm = rMin + (rMax - rMin) * (T - 0.8) / 4.4; else if (T < 6.4) { rpm = rMax - (rMax - 900) * Math.min(1, (T - 5.2) / 1.2); load = 0.05; } else rpm = 900;
      if (v) Sound.update(v, rpm, load, false, false, sp.turbo ? Math.min(1, Math.max(0, (T - 1) / 1.2)) : null);
      if (T >= 0.8 && T < 5.2) {
        const tq = sp.torque(rpm, false) * loss, hp = tq * rpm / 7127;
        pts.push({rpm, hp, tq}); if (hp > best.hp) best = Object.assign(best, {hp, r: rpm}); if (tq > best.tq) best = Object.assign(best, {tq, tr: rpm});
      }
      // décor de l'atelier + rouleaux
      ctx.fillStyle = '#070b16'; ctx.fillRect(0, 0, 960, 400);
      const g = ctx.createRadialGradient(240, 120, 10, 240, 120, 340); g.addColorStop(0, 'rgba(25,230,255,0.16)'); g.addColorStop(1, 'rgba(25,230,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 400);
      ctx.fillStyle = '#121a2c'; ctx.fillRect(0, 312, 480, 88); ctx.fillStyle = '#19e6ff'; ctx.fillRect(0, 312, 480, 2);
      const x = Math.round(240 - p.L * s / 2), y = 306, dw = c.drive === 'FWD' ? [1] : c.drive === 'RWD' ? [0] : [0, 1];
      ang += (rpm / 1200) * dt * (load > 0.5 ? 6 : 2);
      for (const i of dw) { const rx = x + p.wheels[i] * s; ctx.fillStyle = '#2a3346'; ctx.beginPath(); ctx.arc(rx - 14, y + 12, 12, 0, Math.PI * 2); ctx.arc(rx + 14, y + 12, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#4a5878'; ctx.lineWidth = 2; for (const ox of [-14, 14]) { ctx.beginPath(); ctx.moveTo(rx + ox, y + 12); ctx.lineTo(rx + ox + Math.cos(ang * 3) * 10, y + 12 + Math.sin(ang * 3) * 10); ctx.stroke(); } }
      ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x, y - 20); ctx.stroke();      // sangle
      drawCar(ctx, st, cs.color, x, y, s, {wheelAng: ang, look: lk});
      if (load > 0.5 && T > 0.8 && T < 5.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const eg = ctx.createRadialGradient(x - 6, y - 12, 0, x - 6, y - 12, 30); eg.addColorStop(0, 'rgba(255,170,60,0.35)'); eg.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = eg; ctx.fillRect(x - 40, y - 42, 70, 60); ctx.restore(); }
      // graphique
      const gx = 520, gy = 30, gw = 410, gh = 290, X = rr => gx + (rr - rMin) / (rMax - rMin) * gw, Yh = h => gy + gh - h / hpMax * gh, Yt = q => gy + gh - q / tqMax * gh;
      ctx.strokeStyle = 'rgba(25,230,255,0.12)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(gx, gy + gh * i / 5); ctx.lineTo(gx + gw, gy + gh * i / 5); ctx.stroke(); }
      for (let rr = Math.ceil(rMin / 1000) * 1000; rr <= rMax; rr += 1000) { ctx.beginPath(); ctx.moveTo(X(rr), gy); ctx.lineTo(X(rr), gy + gh); ctx.stroke(); ctx.fillStyle = '#6f86a8'; ctx.font = '600 12px Rajdhani, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(rr / 1000 + 'k', X(rr), gy + gh + 16); }
      const line = (key, Y, col) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(X(q.rpm), Y(q[key])) : ctx.moveTo(X(q.rpm), Y(q[key]))); ctx.stroke(); ctx.shadowBlur = 0; };
      line('tq', Yt, '#3ee0ff'); line('hp', Yh, '#ff9a2e');
      const cur = pts[pts.length - 1] || {hp: 0, tq: 0};
      ctx.textAlign = 'left'; ctx.fillStyle = '#ff9a2e'; ctx.font = 'italic 600 46px Teko, sans-serif'; ctx.fillText(Math.round(T < 5.2 ? cur.hp : best.hp) + ' ch', gx + 6, gy + 40);
      ctx.fillStyle = '#3ee0ff'; ctx.font = 'italic 600 30px Teko, sans-serif'; ctx.fillText(Math.round(T < 5.2 ? cur.tq : best.tq) + ' Nm', gx + 6, gy + 72);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.font = 'italic 600 34px Teko, sans-serif'; ctx.fillText(Math.round(rpm) + ' tr/min', gx + gw, gy + 40);
      if (T >= 5.2) {
        ctx.fillStyle = 'rgba(4,6,12,0.75)'; ctx.fillRect(gx + 60, gy + 110, gw - 120, 92);
        ctx.textAlign = 'center'; ctx.fillStyle = '#ffd23f'; ctx.font = 'italic 600 30px Teko, sans-serif';
        ctx.fillText(`${Math.round(best.hp)} ch à la roue @ ${Math.round(best.r / 100) * 100} tr/min`, gx + gw / 2, gy + 146);
        ctx.fillStyle = '#c9d6f0'; ctx.font = '600 15px Rajdhani, sans-serif';
        ctx.fillText(`≈ ${Math.round(best.hp / loss)} ch moteur (pertes de transmission ${Math.round((1 - loss) * 100)} %) · ${Math.round(best.tq)} Nm à la roue`, gx + gw / 2, gy + 176);
      }
      if (T > 6.8 && v) { Sound.stop(v, 0.4); this._dynoV = null; }
      if (T < 8) this._dynoRaf = requestAnimationFrame(frame);
    };
    this._dynoRaf = requestAnimationFrame(frame);
  },
  dynoStop() { cancelAnimationFrame(this._dynoRaf); if (this._dynoV) { Sound.stop(this._dynoV, 0.2); this._dynoV = null; } },
  toast(msg) {
    let t = $('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), 1800);
  },
  showLore(id) {
    const L = LORE[id], c = CLANS.find(k => k.id === id), r = $('result');
    r.classList.remove('hidden'); $('racebtns').classList.add('hidden');
    r.innerHTML = `<div class="rbox lore" style="--cc:${c.color}"><div class="eyebrow">${c.emblem} ${c.name.toUpperCase()} · BOUGIE D'OR ${CLANS.indexOf(c) + 1}/5</div>
      <h2>${L.title}</h2><p class="lore-text">${L.text(Game.crew().name)}</p>
      <div class="rbtns"><button class="btn" data-act="lore-close">CONTINUER</button></div></div>`;
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
      <div class="ccond c-${o.cond || 'dry'}">${condOf(o.cond).icon} ${condOf(o.cond).name}${condOf(o.cond).bonus ? ` · <b>gains +${Math.round(condOf(o.cond).bonus * 100)} %</b>` : ''}<small>${{dry: 'adhérence normale', night: 'air frais : +4 % de puissance', prep: 'colle à la piste : +12 % d\'adhérence', hot: '−7 % d\'adhérence, −4 % de puissance', rain: '−30 % d\'adhérence : dose ton départ'}[o.cond || 'dry']}</small></div>
      <div class="cstage"><canvas class="thumb big" data-car="${o.car}" data-color="${o.color}" data-look='${JSON.stringify(o.look || null)}' width="600" height="232"></canvas></div>
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
      <button class="btn" data-act="race" data-v="${pre}${i}">${pink ? 'METTRE MA VOITURE EN JEU ▶' : pre === 't' ? 'ENTRER EN PISTE ▶' : 'ACCEPTER LE CONTRAT ▶'}</button></div>`;
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
    let h = `<div class="bs"><div class="bs-left"><div class="bs-stage"><canvas id="bsview" width="1800" height="740"></canvas>
      <div class="bs-title"><span class="eyebrow">ATELIER CARROSSERIE</span><b>${CARS[cs.id].name}</b></div>
      <div class="bs-nav"><button class="btn small ghostbtn" data-act="tunecar" data-v="-1">◀ Voiture préc.</button><button class="btn small ghostbtn" data-act="tunecar" data-v="1">Voiture suiv. ▶</button></div></div>
      %%CART%%</div>
      <div class="bs-side"><nav class="bs-cats">`;
    for (const c of cats) {
      const changed = c.id === 'color' ? this.lookDraft.color != null : this.lookDraft[c.id] != null;
      h += `<button class="bs-cat ${c.id === cat ? 'on' : ''}" data-act="bcat" data-v="${c.id}"><b>${c.name}</b><small>${c.sub}</small>${changed ? '<i class="dot"></i>' : ''}</button>`;
    }
    h += `</nav><div class="bs-opts">`;
    if (CARS[cs.id].livery) {
      h += `<div class="bs-locked">🔒 <b>LIVRÉE OFFICIELLE VERROUILLÉE</b><span>La ${CARS[cs.id].name} roule uniquement avec ses couleurs d'origine : ni peinture, ni kit, ni vinyle.</span></div>`;
    } else if (cat === 'color') {
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
  drawShowroom(t) {
    t = t || performance.now() / 1000;
    const cv = $('bsview'); if (!cv) return;
    const ctx = cv.getContext('2d'), cs = Game.car(), st = CARS[cs.id].style, p = PROFILES[st], lk = this.draftLook(), col = this.draftColor();
    ctx.setTransform(HD, 0, 0, HD, 0, 0); ctx.imageSmoothingEnabled = false;
    const g = ctx.createLinearGradient(0, 0, 0, 370); g.addColorStop(0, '#05070f'); g.addColorStop(0.61, '#0d1630'); g.addColorStop(0.62, '#0a0f1f'); g.addColorStop(1, '#03050b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 900, 370);
    // projecteurs et grille au sol
    for (const sx0 of [180, 450, 720]) { const sx = sx0 + Math.sin(t * 0.7 + sx0) * 60; const l = ctx.createRadialGradient(sx, 0, 0, sx, 0, 320); l.addColorStop(0, 'rgba(120,200,255,0.18)'); l.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = l; ctx.fillRect(sx - 320, 0, 640, 330); }
    ctx.strokeStyle = 'rgba(25,230,255,0.12)'; ctx.lineWidth = 1;
    for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(450 + i * 40, 230); ctx.lineTo(450 + i * 130, 370); ctx.stroke(); }
    for (const y of [238, 252, 274, 304, 344]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(900, y); ctx.stroke(); }
    const s = Math.min(2.5, 800 / p.L), x = Math.round(450 - p.L * s / 2), y = 344;
    ctx.save(); ctx.globalAlpha = 0.2; ctx.translate(0, y * 2 + 4); ctx.scale(1, -1); drawCar(ctx, st, col, x, y, s, {wheelAng: 0.3, look: lk}); ctx.restore();
    drawCar(ctx, st, col, x, y, s, {wheelAng: 0.3, look: lk});
    const ph = (t % 4) / 1.4; if (ph < 1) drawSheen(ctx, st, col, lk, x, y, s, ph, 0.6);
    drawCarLights(ctx, st, x, y, s, {neon: NEON_COLORS[lk.neon], look: lk});
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
    if (pay > 0) setTimeout(() => FX.coins(r.querySelector('.pl.total') || r, Math.min(30, 8 + Math.round(pay / 100))), 300);
  },

  /* ---------------- CONCESSION ---------------- */
  rShop() {
    let h = '<div class="grid">';
    for (const id of CAR_IDS) {
      const c = CARS[id], own = Game.owns(id), sp = makeSpec(id, c.engine, {}), est = estimateBest(sp);
      h += `<div class="card ${own ? 'done' : ''}"><div class="ctitle">${c.name}</div>
        <canvas class="thumb" data-car="${id}" data-color="${c.color}" width="600" height="232"></canvas>
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
        <canvas class="thumb" data-car="${id}" data-color="${c.color}" data-look='${JSON.stringify(lookOf(c))}' width="600" height="232"></canvas>
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
      prev = makeSpec(cs.id, cs.engine, pp, cs.map); prevEst = estimateBest(prev);
    }
    return {cs, spec, est, prev, prevEst, sel};
  },
  /* ---- cartographie ECU ---- */
  setupPanel(cs, spec) {
    const S = cs.setup || {}, w = cs.cond == null ? 100 : cs.cond, rc = Game.repairCost(cs), col = w > 75 ? '#3dff7a' : w > 45 ? '#ffd23f' : '#ff4a5a';
    const tp = S.tire || 0, fd = S.final || 0;
    const sl = (id, label, val, left, right, txt) => `<label class="ecu-row"><span class="ecu-l">${label}<small>${left} ◀ ▶ ${right}</small></span>
      <input type="range" min="-1" max="1" step="0.25" value="${val}" data-setup="${id}"><b class="ecu-v">${txt}</b></label>`;
    return `<div class="box setup"><div class="ecu-h"><b class="ecu-t">🛠️ ENTRETIEN & RÉGLAGES</b></div>
      <div class="wear"><span>État mécanique</span><div class="wearbar"><i style="width:${w}%;background:${col};box-shadow:0 0 10px ${col}"></i></div><b style="color:${col}">${Math.round(w)} %</b>
        ${rc ? `<button class="btn small ${Game.save.money >= rc ? '' : 'off'}" data-act="repair">🔧 RÉPARER · ${money(rc)}</button>` : '<span class="good small">✔ comme neuve</span>'}</div>
      <p class="muted small">Chaque course use un peu la mécanique (davantage si tu restes sur le rupteur, en cas de cliquetis ou de pneus surchauffés). Usée, la voiture perd jusqu'à 15 % de puissance.</p>
      ${sl('tire', 'Pression des pneus', tp, 'basse : + d\'adhérence', 'haute : + de vitesse', tp < 0 ? `${(2.2 + tp * 0.6).toFixed(1)} bar` : `${(2.2 + tp * 0.6).toFixed(1)} bar`)}
      ${sl('final', 'Rapport de pont', fd, 'long : + de vitesse max', 'court : + d\'accélération', (spec.final).toFixed(2))}
      <div class="setup-r"><span>400 m estimé avec ces réglages : <b class="gold">${estimateBest(spec).t400.toFixed(2)} s</b></span><button class="btn small ghostbtn" data-act="setupreset">Réglages d'origine</button></div></div>`;
  },
  ecuPanel(cs, spec) {
    const lvl = (cs.parts && cs.parts.ecu) || 0, M = Object.assign({}, ECU_DEFAULT, cs.map || {}), turbo = spec.turbo;
    if (!lvl) return `<div class="box ecu locked"><b class="ecu-t">🧠 CARTOGRAPHIE ECU</b><p class="muted">Achète la <b>Reprogrammation</b> (niveau 1 minimum) pour accéder aux réglages du calculateur : avance à l'allumage, richesse, pression de turbo, rupteur, antipatinage, flat shift, anti-lag…</p></div>`;
    const sl = (id, label, min, max, step, val, need, fmtv, hint) => {
      const off = lvl < need || (id === 'boost' && !turbo);
      return `<label class="ecu-row ${off ? 'off' : ''}"><span class="ecu-l">${label}<small>${off ? (id === 'boost' && !turbo ? 'Moteur atmosphérique' : 'Reprog niv. ' + need) : hint}</small></span>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-ecu="${id}" ${off ? 'disabled' : ''}><b class="ecu-v">${fmtv(val)}</b></label>`;
    };
    const ck = (id, label, need, hint) => {
      const off = lvl < need || (id === 'alag' && !turbo);
      return `<label class="ecu-ck ${off ? 'off' : ''}"><input type="checkbox" data-ecu="${id}" ${M[id] ? 'checked' : ''} ${off ? 'disabled' : ''}><span>${label}<small>${off ? (id === 'alag' && !turbo ? 'Turbo requis' : 'Reprog niv. ' + need) : hint}</small></span></label>`;
    };
    const risk = Math.round(spec.risk * 100), knock = Math.round(Math.max(0, (spec.risk - 0.35) * 1.2) * 100);
    const rc = risk < 35 ? 'var(--gd)' : risk < 60 ? 'var(--gold)' : 'var(--bad)';
    return `<div class="box ecu"><div class="ecu-h"><b class="ecu-t">🧠 CARTOGRAPHIE ECU</b><span class="muted">Reprog niv. ${lvl}/3</span>
        <button class="btn small ghostbtn" data-act="ecureset">Réinitialiser</button></div>
      ${sl('timing', 'Avance à l\'allumage', -2, 6, 1, M.timing, 1, v => (v > 0 ? '+' : '') + v + '°', '+1,2 % de puissance par degré')}
      ${sl('lean', 'Richesse du mélange', 0, 1, 0.1, M.lean, 1, v => v < 0.35 ? 'Riche' : v < 0.7 ? 'Neutre' : 'Pauvre', 'Pauvre = +6 % mais chauffe')}
      ${sl('boost', 'Pression de turbo', 0.7, 1.5, 0.05, M.boost, 2, v => '×' + (+v).toFixed(2), 'Plus de pression, plus de couple')}
      ${sl('revlim', 'Rupteur', 0, 800, 100, M.revlim, 2, v => '+' + v + ' tr/min', 'Tirer plus loin chaque rapport')}
      ${sl('tq1', 'Couple en 1re (antipatinage)', 0.6, 1, 0.05, M.tq1, 2, v => Math.round(v * 100) + ' %', 'Limite le patinage au départ')}
      <div class="ecu-cks">${ck('flat', 'Flat shift', 3, 'Passages 40 % plus rapides')}${ck('alag', 'Anti-lag / launch control', 3, 'Turbo gonflé au départ et entre les rapports')}</div>
      <div class="ecu-risk"><span>Contrainte moteur</span><div class="bar"><div style="width:${Math.max(3, risk)}%;background:${rc}"></div></div>
        <b style="color:${rc}">${risk} %</b><small class="muted">${knock ? `Risque de cliquetis en course : ${knock} % (−18 % de puissance)` : 'Aucun risque de cliquetis'}</small></div></div>`;
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
      <button class="btn small" data-act="dyno">📈 BANC DE PUISSANCE</button>
      <button class="btn small ghostbtn" data-act="listen" data-v="cur">🔊 Écouter le moteur</button>
      ${sel && (cs.parts[sel.id] || 0) < sel.tiers.length && ['exhaust', 'turbo', 'intake'].includes(sel.id) ? `<button class="btn small" data-act="listen" data-v="prev">🔊 Avec ${sel.name} niv. ${(cs.parts[sel.id] || 0) + 1}</button>` : ''}</div>
      <div class="cols tune"><div><div class="box"><canvas id="chart" width="560" height="300"></canvas>
      <div class="legend"><span><i style="background:#ff9a2e"></i>Puissance (ch)</span><span><i style="background:#3ec8ff"></i>Couple (Nm)</span>
      <span><i class="dash"></i>Aperçu amélioration</span><span><i class="dot"></i>Origine</span></div></div>
      ${this.setupPanel(cs, spec)}
      ${this.ecuPanel(cs, spec)}
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
        const ps = makeSpec(cs.id, cs.engine, pp, cs.map), pe = estimateBest(ps);
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
    const again = o.kind === 'ladder' ? `<button class="btn" data-act="race" data-v="l${o.idx}">REJOUER</button>` : o.kind === 'tour' ? `<button class="btn" data-act="tourgo">${res.champion ? 'TOURNOI' : res.win ? 'TOUR SUIVANT ▶' : 'RETENTER'}</button>` : `<button class="btn" data-act="go" data-v="races">NOUVEAUX CONTRATS</button>`;
    r.innerHTML = `<div class="rbox has-slip ${res.win ? 'win' : 'lose'}"><div class="rmain"><div class="eyebrow">${o.kind === 'ladder' ? 'LÉGENDE DE LA VILLE' : 'CONTRAT'}</div>
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
      ${res.lore ? `<div class="lore-unlock">🕯️ <b>Bougie d'or obtenue</b> — un nouveau chapitre de l'histoire est débloqué</div>` : ''}
      <div class="rbtns">${res.lore ? `<button class="btn" data-act="lore" data-v="${res.lore}">📖 LIRE LE CHAPITRE</button>` : ''}${again}<button class="btn ghostbtn" data-act="go" data-v="tuning">TUNING</button><button class="btn ghostbtn" data-act="go" data-v="home">GARAGE</button></div></div>
      ${res.slip ? this.timeSlip(res, o) : ''}</div>`;
    if (res.reward > 0) setTimeout(() => FX.coins(r.querySelector('.pl.total') || r, Math.min(30, 10 + Math.round(res.reward / 400))), 350);
    if (res.win || res.levelUp) { FX.confetti(res.lore || res.levelUp ? 240 : 140); }
    if (res.levelUp) setTimeout(() => this.toast(`🎖️ Niveau de réputation ${res.levelUp} !`), 900);
  },
  timeSlip(res, o) {
    const P = res.slip.pl, A = res.slip.ai, t = v => v == null ? '—' : v.toFixed(3), k = v => v ? v.toFixed(1) : '—';
    const rows = [['R/T (réaction)', res.fs ? 'F.D.' : '0.000', t(A.rt)], ['60 ft', t(P[18.288]), t(A[18.288])], ['330 ft', t(P[100.584]), t(A[100.584])],
      ['1/8 mile', t(P[201.168]), t(A[201.168])], ['km/h au 1/8', k(P.v660), k(A.v660)], ['1000 ft', t(P[304.8]), t(A[304.8])],
      ['1/4 mile (E.T.)', t(P.et), t(A.et)], ['Vitesse finale', k(P.trap), k(A.trap)]];
    const d = new Date();
    return `<div class="slip" aria-label="Ticket de chrono"><div class="slip-h"><b>TUNED TALES DRAGWAY</b><span>402 m · ${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span></div>
      <table><thead><tr><th></th><th>GAUCHE<br><small>${Game.crew().name}</small></th><th>DROITE<br><small>${o.name}</small></th></tr></thead>
      <tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>
      <div class="slip-w">${res.win ? '◀ VAINQUEUR' : 'VAINQUEUR ▶'}</div><div class="slip-bc"></div></div>`;
  }
};

function paintThumbs() {
  document.querySelectorAll('canvas.thumb').forEach(cv => {
    const ctx = cv.getContext('2d'), st = CARS[cv.dataset.car].style, p = PROFILES[st];
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    const W = cv.width / HD, H = cv.height / HD, s = Math.min(1, (W - 12) / p.L);       // vignette rendue en HD
    ctx.setTransform(HD, 0, 0, HD, 0, 0);
    const y = H - 10, x = Math.round((W - p.L * s) / 2);
    let look = null; try { look = cv.dataset.look ? JSON.parse(cv.dataset.look) : null; } catch (e) {}
    drawCar(ctx, st, cv.dataset.color, x, y, s, {wheelAng: 0.4, look});
  });
}
