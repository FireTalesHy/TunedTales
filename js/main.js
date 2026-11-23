/* ============ BOUCLE PRINCIPALE, SCÈNE DU GARAGE, ENTRÉES ============ */
const canvas = $('scene'), ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let garageBG = null;
/* Atelier en résolution native : mur en parpaings peints, néons, établi, servante, porte ouverte sur le couchant, sol époxy */
function buildGarageBG() {
  const c = mkCanvas(960, 540), x = c.getContext('2d'), r = rng(11);
  const FLOOR = 340;
  // mur : parpaings peints
  const wg = x.createLinearGradient(0, 0, 0, FLOOR); wg.addColorStop(0, '#2b2e3d'); wg.addColorStop(1, '#3a3d4f');
  x.fillStyle = wg; x.fillRect(0, 0, 960, FLOOR);
  for (let y = 0; y < FLOOR; y += 20) for (let bx = (y / 20) % 2 ? -24 : 0; bx < 960; bx += 48) {
    x.fillStyle = 'rgba(0,0,0,0.22)'; x.fillRect(bx, y, 48, 1); x.fillRect(bx, y, 1, 20);
    x.fillStyle = 'rgba(255,255,255,0.04)'; x.fillRect(bx + 1, y + 1, 46, 1);
  }
  for (let i = 0; i < 9000; i++) { x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.035)'; x.fillRect(Math.floor(r() * 960), Math.floor(r() * FLOOR), 1, 1); }
  // soubassement bicolore
  x.fillStyle = '#5a1e2a'; x.fillRect(0, 250, 960, 90); x.fillStyle = '#7a2a36'; x.fillRect(0, 250, 960, 3); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, 336, 960, 4);
  // porte sectionnelle ouverte sur le couchant
  const dx = 600, dw = 320, dy = 70;
  const sg = x.createLinearGradient(0, dy, 0, FLOOR); sg.addColorStop(0, '#3a1f5e'); sg.addColorStop(0.45, '#c2577a'); sg.addColorStop(0.75, '#f59a6a'); sg.addColorStop(1, '#ffd08a');
  x.fillStyle = sg; x.fillRect(dx, dy, dw, FLOOR - dy);
  x.fillStyle = '#ffe9b8'; x.beginPath(); x.arc(dx + 220, FLOOR - 40, 26, 0, Math.PI * 2); x.fill();
  for (let i = 0; i < 14; i++) { const bw = 14 + r() * 30, bh = 30 + r() * 110, bxx = dx + i * 24 + r() * 8; x.fillStyle = i % 2 ? '#2a1838' : '#341d46'; x.fillRect(Math.floor(bxx), Math.floor(FLOOR - bh), Math.floor(bw), Math.floor(bh)); for (let wy = FLOOR - bh + 4; wy < FLOOR - 4; wy += 6) for (let wx = bxx + 2; wx < bxx + bw - 2; wx += 4) if (r() < 0.25) { x.fillStyle = 'rgba(255,214,130,0.8)'; x.fillRect(Math.floor(wx), Math.floor(wy), 2, 2); } }
  for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#7c8296' : '#8a90a6'; x.fillRect(dx, dy + i * 13, dw, 12); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(dx, dy + i * 13, dw, 1); }
  x.fillStyle = '#9aa0b4'; x.fillRect(dx - 12, dy - 10, dw + 24, 10); x.fillRect(dx - 12, dy, 12, FLOOR - dy); x.fillRect(dx + dw, dy, 12, FLOOR - dy);
  x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(dx, dy + 52, dw, 3);
  // panneau perforé + outils
  x.fillStyle = '#4a3a2c'; x.fillRect(40, 96, 250, 120);
  for (let py = 102; py < 212; py += 8) for (let px = 46; px < 286; px += 8) { x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(px, py, 2, 2); }
  const tool = (tx, ty, w, h, col) => { x.fillStyle = col; x.fillRect(tx, ty, w, h); x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(tx, ty, w, 1); };
  for (let i = 0; i < 7; i++) { tool(56 + i * 12, 108, 4, 40 + (i % 3) * 8, '#b8bec8'); tool(54 + i * 12, 106, 8, 6, '#c44'); }
  tool(150, 110, 60, 6, '#c8ccd4'); tool(150, 124, 46, 6, '#c8ccd4'); tool(220, 108, 8, 50, '#d43'); tool(240, 112, 30, 30, '#2a6dd0'); tool(150, 150, 120, 4, '#888');
  // affiches
  const poster = (px, py, w, h, bg, fg, t1, t2) => {
    x.fillStyle = bg; x.fillRect(px, py, w, h); x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(px, py, w, 2);
    x.fillStyle = fg; x.font = '700 14px "Chakra Petch", sans-serif'; x.textAlign = 'center'; x.fillText(t1, px + w / 2, py + 22);
    x.font = '600 10px "Chakra Petch", sans-serif'; x.fillText(t2, px + w / 2, py + h - 10);
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(px + w, py + 3, 3, h);
  };
  poster(330, 100, 90, 120, '#1a2a6a', '#ffd34d', 'DRAG', 'NIGHT · 402 m');
  poster(440, 110, 80, 100, '#e8e2d0', '#c62f3a', 'TURBO', 'POWER CLUB');
  // néons au plafond
  for (const nx of [140, 460]) {
    x.fillStyle = '#20222e'; x.fillRect(nx - 6, 0, 2, 18); x.fillRect(nx + 190, 0, 2, 18);
    x.fillStyle = '#eef6ff'; x.fillRect(nx - 10, 18, 210, 6);
    const lg = x.createRadialGradient(nx + 95, 22, 0, nx + 95, 22, 260); lg.addColorStop(0, 'rgba(220,235,255,0.22)'); lg.addColorStop(1, 'rgba(220,235,255,0)');
    x.fillStyle = lg; x.fillRect(nx - 170, 0, 530, 300);
  }
  // sol époxy brillant
  const fg = x.createLinearGradient(0, FLOOR, 0, 540); fg.addColorStop(0, '#3b3e4f'); fg.addColorStop(1, '#22242f');
  x.fillStyle = fg; x.fillRect(0, FLOOR, 960, 200);
  for (let i = 0; i < 6000; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)'; x.fillRect(Math.floor(r() * 960), FLOOR + Math.floor(r() * 200), 1, 1); }
  // reflets du mur et de la porte sur le sol
  const rf = x.createLinearGradient(0, FLOOR, 0, FLOOR + 120); rf.addColorStop(0, 'rgba(255,170,120,0.35)'); rf.addColorStop(1, 'rgba(255,170,120,0)');
  x.fillStyle = rf; x.fillRect(dx, FLOOR, dw, 120);
  x.fillStyle = 'rgba(122,42,54,0.25)'; x.fillRect(0, FLOOR, dx, 14);
  // lignes du sol en perspective + bande jaune
  x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 1;
  for (let i = -8; i <= 8; i++) { x.beginPath(); x.moveTo(480 + i * 70, FLOOR); x.lineTo(480 + i * 190, 540); x.stroke(); }
  for (const y of [372, 418, 478]) { x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(0, y, 960, 1); }
  x.fillStyle = '#e8c020'; x.fillRect(0, 528, 960, 4); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, 532, 960, 2);
  // servante rouge
  const tx = 30, ty = 262;
  x.fillStyle = '#9d1f28'; x.fillRect(tx, ty, 120, 100); x.fillStyle = '#c62f3a'; x.fillRect(tx, ty, 120, 6);
  for (let i = 0; i < 6; i++) { x.fillStyle = '#b22632'; x.fillRect(tx + 4, ty + 10 + i * 15, 112, 13); x.fillStyle = '#d7dbe4'; x.fillRect(tx + 40, ty + 15 + i * 15, 40, 2); }
  x.fillStyle = '#111'; x.fillRect(tx + 6, ty + 100, 10, 8); x.fillRect(tx + 104, ty + 100, 10, 8);
  // pile de pneus
  for (let i = 0; i < 4; i++) { x.fillStyle = '#131318'; x.fillRect(180, 330 - i * 22, 70, 22); x.fillStyle = '#26262e'; x.fillRect(186, 334 - i * 22, 58, 4); x.fillStyle = '#34343e'; x.fillRect(180, 330 - i * 22, 70, 1); }
  // ombre de vignettage
  const vg = x.createRadialGradient(480, 300, 220, 480, 300, 640); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  x.fillStyle = vg; x.fillRect(0, 0, 960, 540);
  return c;
}
function drawGarage(ctx, t) {
  if (!garageBG) garageBG = buildGarageBG();
  const cs = Game.car(), c = CARS[cs.id], p = PROFILES[c.style];
  ctx.setTransform(HD, 0, 0, HD, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(garageBG, 0, 0);
  // enseigne néon
  const on = !(Math.sin(t * 2.1) > 0.96 && Math.random() < 0.6);
  ctx.save();
  ctx.font = `700 44px ${UIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 3; ctx.strokeStyle = on ? '#ff6ab8' : '#5a2a48'; ctx.shadowColor = '#ff3d9a'; ctx.shadowBlur = on ? 28 : 0;
  ctx.strokeText('TUNED TALES', 470, 54);
  ctx.shadowBlur = on ? 14 : 0; ctx.strokeStyle = on ? '#ffd2ec' : '#5a2a48'; ctx.lineWidth = 1; ctx.strokeText('TUNED TALES', 470, 54);
  ctx.restore();
  // voiture, reflet sur l'époxy, halos
  const s = 1.6, x = Math.round(400 - p.L * s / 2), y = 506, lk = lookOf(cs);
  // poussières qui flottent dans le cône de lumière
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) { const px = 200 + ((i * 97 + t * (6 + i % 5) * 4) % 560), py = 40 + ((i * 53 + Math.sin(t * 0.6 + i) * 18 + t * (3 + i % 3) * 3) % 460);
    ctx.fillStyle = `rgba(255,236,200,${0.12 + 0.18 * Math.abs(Math.sin(t * 1.3 + i))})`; ctx.fillRect(Math.round(px), Math.round(py), i % 4 ? 2 : 3, i % 4 ? 2 : 3); }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.22; ctx.translate(0, y * 2 + 6); ctx.scale(1, -1);
  drawCar(ctx, c.style, cs.color, x, y, s, {wheelAng: 0.3, look: lk}); ctx.restore();
  const idle = Math.sin(t * 38) > 0.6 ? 1 : 0;                       // le moteur tourne au ralenti
  ctx.save(); ctx.translate(0, -idle);
  drawCar(ctx, c.style, cs.color, x, y, s, {wheelAng: 0.3, look: lk});
  const ph = (t % 5.5) / 1.6; if (ph < 1) drawSheen(ctx, c.style, cs.color, lk, x, y, s, ph, 0.55);
  ctx.restore();
  drawCarLights(ctx, c.style, x, y, s, {neon: NEON_COLORS[lk.neon], look: lk});
  // fumée d'échappement au ralenti
  for (let i = 0; i < 6; i++) { const k = ((t * 0.7 + i / 6) % 1), ex = x - 4 - k * 70, ey = y - (p.sill + 4) * s - k * 34 - Math.sin(t * 2 + i) * 4, r = 6 + k * 26;
    const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, r); g.addColorStop(0, `rgba(210,215,230,${0.16 * (1 - k)})`); g.addColorStop(1, 'rgba(210,215,230,0)'); ctx.fillStyle = g; ctx.fillRect(ex - r, ey - r, r * 2, r * 2); }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (Race.active) { Race.update(dt); Race.draw(ctx); }
  else if (Jobs.active) { Jobs.update(dt); Jobs.draw(ctx); }
  else if (UI.screen === 'home') drawGarage(ctx, now / 1000);
  if (UI.screen === 'body' && $('bsview')) UI.drawShowroom(now / 1000);
  requestAnimationFrame(frame);
}

/* ---------- entrées ---------- */
let keyHeld = false;
document.addEventListener('pointerdown', () => Sound.resume(), {once: false});
document.addEventListener('keydown', e => {
  Sound.resume();
  if (Jobs.active) { if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.code)) e.preventDefault(); if (!e.repeat) Jobs.key(e.code); return; }
  if (!Race.active) return;
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (!e.repeat && !keyHeld) { keyHeld = true; Race.onDown(); } }
  else if (e.code === 'KeyN' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') { e.preventDefault(); Race.onNitro(); }
});
document.addEventListener('keyup', e => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && keyHeld) { keyHeld = false; if (Race.active) Race.onUp(); }
});
function canvasPos(e) {
  const r = canvas.getBoundingClientRect(), k = Math.min(r.width / 960, r.height / 540);
  return [(e.clientX - r.left - (r.width - 960 * k) / 2) / k, (e.clientY - r.top - (r.height - 540 * k) / 2) / k];
}
canvas.addEventListener('pointerdown', e => {
  if (Race.active) { e.preventDefault(); Race.onDown(); }
  else if (Jobs.active) { e.preventDefault(); const [x, y] = canvasPos(e); Jobs.down(x, y); }
});
canvas.addEventListener('pointermove', e => { if (Jobs.active) { const [x, y] = canvasPos(e); Jobs.move(x, y); } });
window.addEventListener('pointerup', () => { if (Race.active && !keyHeld) Race.onUp(); if (Jobs.active) Jobs.up(); });
$('nitrobtn').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Race.onNitro(); });

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, v = b.dataset.v;
  if (b.classList.contains('off') && a !== 'reset') { flash(b); return; }
  switch (a) {
    case 'go': UI.go(v); break;
    case 'race': Sound.resume(); Race.start(v[0] === 'c' ? Game.contracts()[+v.slice(1)] : v[0] === 'p' ? Game.pinkSlips()[+v.slice(1)] : Game.ladderOpp(+v.slice(1))); break;
    case 'tab': UI.raceTab = v; UI.render(); break;
    case 'bcat': UI.bodyCat = v; UI.render(); break;
    case 'dyno': Sound.resume(); UI.dyno(); break;
    case 'dyno-close': UI.dynoStop(); $('result').classList.add('hidden'); break;
    case 'ecureset': { const cs = Game.car(); cs.map = {}; Game.persist(); UI.render(); break; }
    case 'collect': { const g = Game.collectTurf(v === 'all' ? null : v); if (g) { UI.toast('+ ' + money(g) + ' encaissés'); FX.coins(b, 22); FX.sparks(b); } UI.render(); break; }
    case 'claim': { const g = Game.claimChal(v); if (g) { UI.toast(`+ ${money(g.cash)} · +${g.xp} XP`); FX.coins(b, 22); FX.sparks(b); if (g.ups.length) { FX.confetti(200); UI.toast(`🎖️ Niveau de réputation ${g.ups[g.ups.length - 1].level} !`); } UI.refreshTop(); } UI.render(); break; }
    case 'turfup': if (Game.upgradeTurf(v)) UI.render(); else flash(b); break;
    case 'crewcol': UI.crewColor = v; document.querySelectorAll('.crew-col').forEach(x => x.classList.toggle('sel', x.dataset.v === v)); break;
    case 'crewsave': Game.setCrew($('crewname').value, UI.crewColor || Game.crew().color); UI.render(); break;
    case 'lore': UI.showLore(v); break;
    case 'lore-close': UI.raceTab = 'legends'; UI.go('races'); break;
    case 'noop': break;
    case 'sellcar': {
      const c = Game.save.cars[v];
      if (c && confirm(`Vendre ta ${CARS[v].name} pour ${money(Game.carValue(c) * 0.6)} ?`)) { Game.sellCar(v); UI.render(); }
      break;
    }
    case 'bopt': {
      const [id, val] = v.split('|'), cs = Game.car();
      let value = id === 'color' ? val : VISUAL.find(x => x.id === id).opts[+val].v;
      const curVal = id === 'color' ? cs.color : lookOf(cs)[id];
      if (value === curVal) delete UI.lookDraft[id]; else UI.lookDraft[id] = value;
      UI.render(); break;
    }
    case 'bcancel': UI.lookDraft = {}; UI.render(); break;
    case 'bapply': {
      const d = Object.assign({}, UI.lookDraft), color = d.color; delete d.color;
      if (UI.draftCost() > Game.save.money) { flash(b); break; }
      if (color && !Game.paint(color)) { flash(b); break; }
      if (Object.keys(d).length && !Game.applyLook(d)) { flash(b); break; }
      UI.lookDraft = {}; UI.refreshTop(); UI.render(); break;
    }
    case 'fullscreen': toggleFullscreen(); break;
    case 'refresh': if (Game.refreshContracts()) UI.render(); else flash(b); break;
    case 'mute': b.textContent = Sound.toggleMute() ? '🔇' : '🔊'; break;
    case 'listen': {
      const cs = Game.car();
      if (v === 'cur') Sound.demo(cs.engine, cs.parts);
      else if (v === 'prev') { const pp = Object.assign({}, cs.parts); pp[UI.tuneSel] = (pp[UI.tuneSel] || 0) + 1; Sound.demo(cs.engine, pp); }
      else Sound.demo(v.slice(4), cs.parts);
      break;
    }
    case 'quitrace': if (Jobs.active) { Jobs.stop(); UI.go('jobs'); } else { Race.stop(); UI.go('races'); } break;
    case 'job': Sound.resume(); Jobs.start(v); break;
    case 'buycar': if (Game.buyCar(v)) UI.render(); else flash(b); break;
    case 'selcar': Game.save.current = v; Game.persist(); UI.render(); break;
    case 'paint': Game.paint(v); UI.render(); break;
    case 'buyeng': if (Game.buyEngine(v)) UI.render(); else flash(b); break;
    case 'swap': if (Game.swapEngine(v)) UI.render(); else flash(b); break;
    case 'tune': UI.tuneSel = v; UI.render(); break;
    case 'buypart': e.stopPropagation(); UI.tuneSel = v; if (Game.buyPart(v)) UI.render(); else flash(b); break;
    case 'tunecar': {
      UI.lookDraft = {};
      const owned = CAR_IDS.filter(Game.owns, Game), i = owned.indexOf(Game.save.current);
      Game.save.current = owned[(i + +v + owned.length) % owned.length]; Game.persist(); UI.render(); break;
    }
    case 'reset': if (confirm('Effacer toute la progression ?')) { Game.reset(); UI.go('home'); } break;
  }
});
function flash(b) { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }

Game.load();
setTimeout(() => { const d = Game.daily(); if (d) { UI.toast(`🎁 Bonus quotidien · jour ${d.streak} : + ${money(d.amount)}`); FX.coins($('toast'), 20); } }, 900);
try { if (localStorage.getItem('tt_muted') === '1') $('mutebtn').textContent = '🔇'; } catch (e) {}
UI.refreshTop();
document.fonts && document.fonts.load('10px "Press Start 2P"');
requestAnimationFrame(frame);

/* ---------- plein écran ---------- */
function toggleFullscreen() {
  const d = document, el = d.documentElement;
  if (!d.fullscreenElement && !d.webkitFullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el, {navigationUI: 'hide'});
  else (d.exitFullscreen || d.webkitExitFullscreen).call(d);
}
document.addEventListener('keydown', e => { if (e.code === 'KeyF' && !e.repeat && !Jobs.active && !(e.target.closest && e.target.closest('input'))) toggleFullscreen(); });
// en course / mini-jeu : la barre du haut se replie pour laisser tout l'écran au jeu
setInterval(() => document.body.classList.toggle('ingame', Race.active || Jobs.active), 200);

/* réglages ECU : appliqués au relâchement du curseur */
document.addEventListener('input', e => { const el = e.target; if (!el.dataset || !el.dataset.ecu || el.type !== 'range') return;
  const lab = el.parentElement.querySelector('.ecu-v'); if (lab) lab.textContent = '…'; });
document.addEventListener('change', e => {
  const el = e.target; if (!el.dataset || !el.dataset.ecu) return;
  const cs = Game.car(); cs.map = Object.assign({}, cs.map || {}); cs.map[el.dataset.ecu] = el.type === 'checkbox' ? el.checked : +el.value;
  Game.persist(); UI.render();
});
