/* ============ BOUCLE PRINCIPALE, SCÈNE DU GARAGE, ENTRÉES ============ */
const canvas = $('scene'), ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let garageBG = null;
function buildGarageBG() {
  const cv = document.createElement('canvas'); cv.width = 960; cv.height = 540;
  const c = cv.getContext('2d'); c.scale(2, 2);
  const r = rng(11);
  // mur de briques + grain
  c.fillStyle = '#4a3a3a'; c.fillRect(0, 0, W, 190);
  for (let y = 0; y < 190; y += 10) for (let x = (y / 10) % 2 ? -12 : 0; x < W; x += 24) {
    c.fillStyle = ((x * 3 + y) % 7 < 3) ? '#5c4646' : '#503c3c'; c.fillRect(x + 1, y + 1, 22, 8);
    c.fillStyle = 'rgba(255,255,255,0.07)'; c.fillRect(x + 1, y + 1, 22, 0.5);
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x + 1, y + 8.5, 22, 0.5);
  }
  for (let i = 0; i < 1800; i++) { c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.16)' : 'rgba(255,220,200,0.07)'; c.fillRect(r() * W, r() * 190, 0.5, 0.5); }
  // porte de garage
  c.fillStyle = '#2a2a38'; c.fillRect(300, 22, 160, 150);
  for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#5d6275' : '#686e82'; c.fillRect(300, 22 + i * 12, 160, 11); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(300, 22 + i * 12, 160, 0.5); }
  const sky = ['#ffd37a', '#ffb866', '#f59a62', '#e07c6c', '#c0627a', '#8e4a86', '#60388a'];
  sky.forEach((col, i) => { c.fillStyle = col; c.fillRect(300, 70 + i * 14.5, 160, 15); });
  c.fillStyle = '#331b4a'; c.fillRect(320, 124, 30, 48); c.fillRect(360, 134, 22, 38); c.fillRect(392, 116, 36, 56);
  c.fillStyle = '#ffd060'; for (let i = 0; i < 20; i++) c.fillRect(324 + (i % 5) * 5, 128 + Math.floor(i / 5) * 8, 1.5, 2);
  c.fillStyle = '#868ca0'; c.fillRect(296, 18, 168, 6); c.fillRect(296, 22, 6, 150); c.fillRect(458, 22, 6, 150);
  // néon (cadre)
  c.fillStyle = '#ff3d9a'; c.fillRect(130, 30, 170, 26); c.fillStyle = '#1a0a1a'; c.fillRect(133, 33, 164, 20);
  // étagères
  c.fillStyle = '#6a5038'; c.fillRect(20, 90, 100, 5); c.fillRect(20, 124, 100, 5);
  const items = [['#d03030', 28, 74, 14, 16], ['#e0c030', 48, 78, 10, 12], ['#3070d0', 66, 72, 16, 18], ['#cfcfcf', 90, 80, 8, 10], ['#d03030', 30, 108, 18, 16], ['#30a050', 60, 110, 14, 14], ['#e0c030', 84, 104, 20, 20]];
  for (const [col, x, y, w, h] of items) { c.fillStyle = col; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x, y, w, 1); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(x, y + h - 3, w, 3); }
  for (let i = 0; i < 3; i++) { c.fillStyle = '#16161a'; c.fillRect(14, 160 - i * 12, 36, 12); c.fillStyle = '#2c2c34'; c.fillRect(18, 162 - i * 12, 28, 3); c.fillStyle = '#3a3a44'; c.fillRect(14, 160 - i * 12, 36, 0.5); }
  // sol béton
  c.fillStyle = '#585a68'; c.fillRect(0, 170, W, 100);
  for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(0, 170 + i * i * 1.3 + i * 3, W, 8 + i); }
  for (let i = -7; i <= 7; i++) { c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(W / 2 + i * 30, 170); c.lineTo(W / 2 + i * 90, H); c.stroke(); }
  for (let i = 0; i < 2200; i++) { c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.07)'; c.fillRect(r() * W, 170 + r() * 100, 0.5, 0.5); }
  c.fillStyle = '#e8c020'; c.fillRect(0, 262, W, 2);
  // cône de lumière
  c.fillStyle = 'rgba(255,230,160,0.09)'; c.beginPath(); c.moveTo(190, 0); c.lineTo(290, 0); c.lineTo(390, 268); c.lineTo(90, 268); c.closePath(); c.fill();
  c.fillStyle = '#9aa0b4'; c.fillRect(228, 0, 24, 6);
  return cv;
}
function drawGarage(ctx, t) {
  if (!garageBG) garageBG = buildGarageBG();
  const cs = Game.car(), c = CARS[cs.id], p = PROFILES[c.style];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(garageBG, 0, 0);
  ctx.save(); ctx.scale(2, 2);
  const blink = (Math.sin(t * 3) > -0.8) ? 1 : 0.45;
  ctx.globalAlpha = blink * 0.5; ctx.fillStyle = '#ff3d9a'; ctx.fillRect(126, 26, 178, 34); ctx.globalAlpha = 1;
  ctx.fillStyle = blink > 0.9 ? '#ff7ac0' : '#a04a80'; ctx.font = `10px ${FONT}`; ctx.textBaseline = 'top'; ctx.fillText('TUNED TALES', 142, 39);
  ctx.restore();
  const s = 1.6, x = Math.round(390 - p.L * s / 2), y = 516, bob = Math.round(Math.sin(t * 1.6) * 1);
  ctx.save(); ctx.globalAlpha = 0.16; ctx.translate(0, y * 2 + 8); ctx.scale(1, -1);
  drawCar(ctx, c.style, cs.color, x, y, s, {wheelAng: 0.3}); ctx.restore();
  drawCar(ctx, c.style, cs.color, x, y + bob, s, {wheelAng: 0.3});
  const g = ctx.createRadialGradient(480, 270, 200, 480, 270, 620);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 540);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (Race.active) { Race.update(dt); Race.draw(ctx); }
  else if (UI.screen === 'home') drawGarage(ctx, now / 1000);
  requestAnimationFrame(frame);
}

/* ---------- entrées ---------- */
let keyHeld = false;
document.addEventListener('keydown', e => {
  if (!Race.active) return;
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (!e.repeat && !keyHeld) { keyHeld = true; Race.onDown(); } }
  else if (e.code === 'KeyN' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') { e.preventDefault(); Race.onNitro(); }
});
document.addEventListener('keyup', e => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && keyHeld) { keyHeld = false; if (Race.active) Race.onUp(); }
});
canvas.addEventListener('pointerdown', e => { if (Race.active) { e.preventDefault(); Race.onDown(); } });
window.addEventListener('pointerup', () => { if (Race.active && !keyHeld) Race.onUp(); });
$('nitrobtn').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Race.onNitro(); });

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, v = b.dataset.v;
  if (b.classList.contains('off') && a !== 'reset') { flash(b); return; }
  switch (a) {
    case 'go': UI.go(v); break;
    case 'race': Race.start(+v); break;
    case 'quitrace': UI.go('races'); break;
    case 'buycar': if (Game.buyCar(v)) UI.render(); else flash(b); break;
    case 'selcar': Game.save.current = v; Game.persist(); UI.render(); break;
    case 'paint': Game.paint(v); UI.render(); break;
    case 'buyeng': if (Game.buyEngine(v)) UI.render(); else flash(b); break;
    case 'swap': if (Game.swapEngine(v)) UI.render(); else flash(b); break;
    case 'tune': UI.tuneSel = v; UI.render(); break;
    case 'buypart': e.stopPropagation(); UI.tuneSel = v; if (Game.buyPart(v)) UI.render(); else flash(b); break;
    case 'tunecar': {
      const owned = CAR_IDS.filter(Game.owns, Game), i = owned.indexOf(Game.save.current);
      Game.save.current = owned[(i + +v + owned.length) % owned.length]; Game.persist(); UI.render(); break;
    }
    case 'reset': if (confirm('Effacer toute la progression ?')) { Game.reset(); UI.go('home'); } break;
  }
});
function flash(b) { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); }

Game.load();
UI.refreshTop();
document.fonts && document.fonts.load('10px "Press Start 2P"');
requestAnimationFrame(frame);
