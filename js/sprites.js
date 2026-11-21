/* ============ SPRITES PIXEL ART HAUTE RÉSOLUTION (rastérisation manuelle, sans anti-aliasing) ============ */

// Sol = H-1 (45). Voiture orientée vers la droite. 'bottom' = bas de caisse.
const PROFILES = {
  twingo: {L:104, H:46, wr:9, wheels:[17,86], bottom:40, belt:19,
    body:[[1,40],[0,32],[1,26],[4,17],[9,7],[14,3],[60,2],[67,3],[75,10],[83,19],[93,23],[100,26],[103,31],[103,40]],
    glass:[[14,9],[18,5],[63,5],[79,19],[14,19]], pillars:[[38,41],[12,15]], doors:[39,66], mirror:68,
    hl:{round:[96,26,4]}, tl:[[1,22],[7,22],[8,31],[1,31]]},
  clio: {L:117, H:46, wr:10, wheels:[21,96], bottom:40, belt:18,
    body:[[1,40],[0,32],[2,25],[6,16],[12,8],[20,4],[66,2],[73,4],[84,13],[92,19],[104,22],[112,25],[116,30],[116,40]],
    glass:[[16,9],[22,5],[67,5],[85,18],[16,18]], pillars:[[43,47],[15,19]], doors:[44,74], mirror:84,
    hl:{poly:[[100,23],[114,26],[115,32],[102,31]]}, tl:[[1,21],[8,21],[9,30],[1,30]], blade:true},
  mx5: {L:115, H:46, wr:9, wheels:[26,92], bottom:40, belt:20,
    body:[[1,40],[0,33],[2,27],[10,22],[28,20],[38,14],[46,9],[58,8],[68,10],[78,19],[86,21],[102,24],[111,27],[114,32],[114,40]],
    glass:[[48,12],[56,10],[68,12],[76,19],[46,19]], soft:[[32,20],[40,12],[47,9],[58,8],[67,9],[73,15],[46,20]], pillars:[[44,47]], doors:[40,72], mirror:76,
    hl:{poly:[[98,23],[111,26],[112,31],[100,30]]}, tl:[[1,24],[7,24],[8,31],[1,31]]},
  m3: {L:130, H:46, wr:10, wheels:[27,104], bottom:40, belt:18,
    body:[[1,40],[0,32],[2,25],[10,20],[30,18],[41,13],[50,7],[66,5],[78,6],[88,12],[94,18],[104,20],[120,23],[127,27],[129,32],[129,40]],
    glass:[[48,10],[54,7],[77,8],[90,17],[46,17]], pillars:[[64,66]], doors:[40,82], mirror:88,
    hl:{poly:[[108,21],[124,24],[126,30],[110,29]]}, tl:[[1,21],[9,21],[10,29],[1,29]], m3:true},
  supra: {L:131, H:46, wr:10, wheels:[29,103], bottom:40, belt:18,
    body:[[1,40],[0,32],[2,24],[12,18],[34,16],[46,10],[58,7],[74,8],[88,15],[96,18],[114,24],[127,29],[130,33],[130,40]],
    glass:[[48,12],[58,9],[74,10],[88,16],[46,16]], pillars:[[56,58]], doors:[42,86], mirror:88,
    hl:{poly:[[110,23],[126,28],[127,33],[111,31]]}, tl:[[1,19],[10,19],[11,27],[1,27]], wing:[0,8,24]},
  skyline: {L:133, H:46, wr:10, wheels:[29,106], bottom:40, belt:18,
    body:[[1,40],[0,31],[2,23],[10,19],[34,17],[44,11],[53,6],[76,6],[86,8],[98,17],[104,19],[122,22],[130,26],[132,32],[132,40]],
    glass:[[46,10],[54,7],[76,7],[86,10],[96,17],[44,17]], pillars:[[62,64]], doors:[44,84], mirror:92,
    hl:{poly:[[108,20],[127,24],[128,31],[110,29]]}, roundTail:true, wing:[2,14,20]}
};

/* ---------- utilitaires pixel ---------- */
const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5;
function hexRgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
function tone(c, f) { return f <= 1 ? [c[0] * f, c[1] * f, c[2] * f] : [c[0] + (255 - c[0]) * Math.min(1, f - 1), c[1] + (255 - c[1]) * Math.min(1, f - 1), c[2] + (255 - c[2]) * Math.min(1, f - 1)]; }

function Buf(L, H) { this.L = L; this.H = H; this.d = new Uint8ClampedArray(L * H * 4); this.sil = new Uint8Array(L * H); }
Buf.prototype.px = function (x, y, c, sil) {
  x = Math.floor(x); y = Math.floor(y);
  if (x < 0 || y < 0 || x >= this.L || y >= this.H) return;
  const i = (y * this.L + x) * 4;
  this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = 255;
  if (sil !== undefined) this.sil[y * this.L + x] = sil ? 1 : 0;
};
Buf.prototype.has = function (x, y) { return x >= 0 && y >= 0 && x < this.L && y < this.H && this.d[(y * this.L + x) * 4 + 3] > 0; };
Buf.prototype.rect = function (x, y, w, h, c, sil) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, typeof c === 'function' ? c(i, j) : c, sil); };
Buf.prototype.disc = function (cx, cy, r, c, sil, ymax) {
  for (let j = Math.floor(cy - r); j <= cy + r; j++) for (let i = Math.floor(cx - r); i <= cx + r; i++) {
    if (ymax !== undefined && j > ymax) continue;
    if ((i + .5 - cx) * (i + .5 - cx) + (j + .5 - cy) * (j + .5 - cy) <= r * r) this.px(i, j, typeof c === 'function' ? c(i, j) : c, sil);
  }
};
function inPoly(pts, x, y) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
Buf.prototype.poly = function (pts, c, sil) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++)
    if (inPoly(pts, x + .5, y + .5)) this.px(x, y, typeof c === 'function' ? c(x, y) : c, sil);
};
Buf.prototype.line = function (x0, y0, x1, y1, c, sil) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  for (let i = 0; i <= n; i++) this.px(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c, sil);
};

const _bodyCache = {};
function getBody(style, color) {
  const key = style + color;
  if (_bodyCache[key]) return _bodyCache[key];
  const p = PROFILES[style], b = new Buf(p.L, p.H), C = hexRgb(color);
  const belt = p.belt, bot = p.bottom, L = p.L;
  const topY = Math.min(...p.body.map(q => q[1]));
  const DK = [14, 14, 20];

  // 1) carrosserie : dégradé tramé (palette limitée)
  b.poly(p.body, (x, y) => {
    const n = bay(x, y);
    let f;
    if (y < belt) { const u = (y - topY) / Math.max(1, belt - topY); f = Math.round((1.10 + 0.34 * (1 - u) + n * 0.14) / 0.1) * 0.1; }
    else {
      const u = (y - belt) / (bot - belt) + n * 0.10;
      f = u < 0.07 ? 1.78 : u < 0.30 ? 1.28 : u < 0.52 ? 1.0 : u < 0.76 ? 0.78 : 0.55;
    }
    return tone(C, f);
  }, true);
  // reflet allongé sur le flanc
  for (let x = Math.floor(L * 0.18); x < L * 0.78; x++) {
    const y = belt + 7 + Math.round((x - L * 0.18) * 0.012);
    if (b.has(x, y) && (x + y) % 3) b.px(x, y, tone(C, 1.5), true);
  }
  // capote (roadster)
  if (p.soft) b.poly(p.soft, (x, y) => { const f = 0.30 + bay(x, y) * 0.06 + (y - 8) * 0.012; return [38 * f * 2.4, 40 * f * 2.4, 46 * f * 2.4]; }, true);

  // 2) vitres : cadre + verre dégradé avec reflets diagonaux
  const gMask = new Uint8Array(L * p.H);
  const gys = p.glass.map(q => q[1]); const gTop = Math.min(...gys), gBot = Math.max(...gys);
  for (let y = 0; y < p.H; y++) for (let x = 0; x < L; x++) if (inPoly(p.glass, x + .5, y + .5)) gMask[y * L + x] = 1;
  const gm = (x, y) => x >= 0 && y >= 0 && x < L && y < p.H && gMask[y * L + x];
  for (let y = 0; y < p.H; y++) for (let x = 0; x < L; x++) {
    if (!gm(x, y)) continue;
    const edge = !gm(x - 1, y) || !gm(x + 1, y) || !gm(x, y - 1) || !gm(x, y + 1);
    if (edge) { b.px(x, y, tone(C, 0.38), true); continue; }
    const u = (y - gTop) / Math.max(1, gBot - gTop);
    let c = [26 + 62 * u, 42 + 82 * u, 64 + 92 * u];
    const d = (x * 1.0 + y * 1.6) % 28;
    if (d < 3) c = c.map(v => v + 44); else if (d < 5) c = c.map(v => v + 18);
    const n = bay(x, y) * 8; b.px(x, y, [c[0] + n, c[1] + n, c[2] + n], true);
  }
  // montants
  for (const pl of p.pillars) {
    for (let y = gTop; y <= belt; y++) for (let x = pl[0]; x < pl[1]; x++) if (gm(x, y) || (y <= gBot && b.has(x, y) && inPoly(p.glass, x + .5, y + .5))) b.px(x, y, tone(C, 0.62 + bay(x, y) * 0.1), true);
  }
  // 3) panneaux : portes, poignées, bas de caisse
  const seam = tone(C, 0.5), handle = tone(C, 1.9);
  for (const dx of p.doors) for (let y = belt + 1; y < bot - 4; y++) if (b.has(dx, y)) b.px(dx, y, seam);
  b.rect(p.doors[0] + 4, belt + 3, 5, 1, handle); b.rect(p.doors[1] - 9, belt + 3, 5, 1, handle);
  const sk0 = p.wheels[0] + p.wr + 4, sk1 = p.wheels[1] - p.wr - 4;
  b.rect(sk0, bot - 3, sk1 - sk0, 3, (x, y) => tone(C, 0.34 + bay(x, y) * 0.05), true);
  b.rect(sk0, bot - 4, sk1 - sk0, 1, tone(C, 0.9));
  // pare-chocs
  b.rect(L - 18, bot - 6, 17, 6, (x, y) => tone(C, 0.30 + bay(x, y) * 0.05), true);
  b.rect(1, bot - 6, 15, 6, (x, y) => tone(C, 0.30 + bay(x, y) * 0.05), true);
  for (let i = 0; i < 6; i++) b.rect(L - 15 + i * 2, bot - 4, 1, 2, [6, 6, 10]);     // grille basse
  b.rect(0, bot - 2, 3, 2, [200, 204, 212], true);                                   // échappement
  // rétroviseur
  b.poly([[p.mirror, belt - 1], [p.mirror + 6, belt - 1], [p.mirror + 6, belt + 3], [p.mirror + 1, belt + 3]], (x, y) => tone(C, 0.7 + bay(x, y) * 0.1), true);
  b.px(p.mirror + 1, belt - 1, tone(C, 1.7));
  // 4) feux
  const hl = p.hl;
  if (hl.round) {
    const [cx, cy, r] = hl.round;
    b.disc(cx, cy, r + 1, [20, 20, 26], true); b.disc(cx, cy, r, (x, y) => (x - cx) + (y - cy) < -1 ? [255, 255, 245] : [235, 232, 190], true); b.disc(cx, cy, 1.5, [255, 220, 90]);
  } else {
    b.poly(hl.poly, (x, y) => (x + y) % 5 === 0 ? [255, 255, 255] : [236, 236, 214], true);
    const [a, , c2] = hl.poly; b.line(a[0], a[1], hl.poly[1][0], hl.poly[1][1], [30, 30, 36]);
    b.rect(hl.poly[1][0] - 3, hl.poly[1][1] + 1, 2, 2, [255, 214, 96]);
  }
  b.rect(L - 3, belt + 10, 3, 4, [255, 190, 60]);                                    // clignotant
  if (p.roundTail) {
    for (const [cx, cy] of [[5, 26], [12, 26]]) { b.disc(cx, cy, 3.2, [30, 10, 10], true); b.disc(cx, cy, 2.4, (x, y) => (x + y) % 3 ? [230, 36, 36] : [255, 110, 100], true); }
  } else {
    b.poly(p.tl, (x, y) => (x + y) % 4 === 0 ? [255, 90, 80] : [206, 26, 30], true);
  }
  // 5) spécifiques
  if (p.blade) { b.rect(L - 20, bot - 8, 19, 2, [8, 8, 12]); for (let x = 6; x < L - 22; x += 1) if (b.has(x, belt + 6) && x % 2) b.px(x, belt + 6, [190, 30, 30]); }
  if (p.m3) {
    for (let i = 0; i < 3; i++) b.line(L - 46 + i * 3, belt + 8 - i, L - 42 + i * 3, belt + 8 - i, [10, 10, 14]);
    b.rect(L - 6, belt + 9, 2, 4, [8, 8, 10]); b.rect(L - 9, belt + 9, 2, 4, [8, 8, 10]);
    b.line(L - 52, belt - 1, L - 24, belt + 3, tone(C, 1.6));
    b.rect(L - 50, belt + 6, 4, 3, [20, 60, 170]); b.rect(L - 45, belt + 6, 3, 3, [180, 30, 40]);
  }
  if (p.wing) {
    const [wx, wy, ww] = p.wing, DKW = [18, 18, 22];
    b.rect(wx + 4, wy + 1, 2, bot - wy - 12, DKW, true); b.rect(wx + ww - 6, wy + 1, 2, bot - wy - 12, DKW, true);
    b.rect(wx, wy, ww, 2, [30, 30, 38], true); b.rect(wx, wy, ww, 1, [90, 90, 104], true);
  }
  // 6) passages de roues
  for (const wx of p.wheels) {
    const cy = p.H - 1 - p.wr;
    b.disc(wx, cy, p.wr + 4.2, tone(C, 0.3), true, bot);
    b.disc(wx, cy, p.wr + 3.2, [8, 8, 12], true, bot);
  }
  // 7) contour pixel-art
  const o = tone(C, 0.22);
  const sil = b.sil, outl = [];
  for (let y = 0; y < p.H; y++) for (let x = 0; x < L; x++) {
    if (!sil[y * L + x]) continue;
    const e = (xx, yy) => xx < 0 || yy < 0 || xx >= L || yy >= p.H || !sil[yy * L + xx];
    if (e(x - 1, y) || e(x + 1, y) || e(x, y - 1) || e(x, y + 1)) outl.push([x, y]);
  }
  for (const [x, y] of outl) b.px(x, y, o);

  const cv = document.createElement('canvas'); cv.width = L; cv.height = p.H;
  cv.getContext('2d').putImageData(new ImageData(b.d, L, p.H), 0, 0);
  _bodyCache[key] = cv;
  return cv;
}

/* roue détaillée : pneu, flanc, jante à rayons rotatifs, disque + étrier */
function drawWheel(ctx, cx, cy, r, s, ang, fast) {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const d = Math.sqrt((dx + .5) * (dx + .5) + (dy + .5) * (dy + .5));
    if (d > r) continue;
    let c;
    if (d > r - 2.6) c = d > r - 1 ? '#0c0c0f' : '#1a1a20';          // bande de roulement
    else if (d > r - 4.2) c = '#2c2c34';                               // flanc
    else if (d > r - 5.4) c = '#dde1ea';                               // lèvre de jante
    else {
      const a = Math.atan2(dy + .5, dx + .5) - ang;
      const spokes = Math.abs(Math.sin(a * 3));                        // 6 rayons
      const inSpoke = fast ? 0.5 : spokes;
      if (d < 1.8) c = '#4a4e5a';
      else if (d < 3 && !fast) c = '#8a90a0';
      else if (inSpoke < 0.36 + 0.2 * d / r) c = ((dx + dy) & 1) ? '#c5cad6' : '#a9aebc';
      else {
        const ca = Math.atan2(dy + .5, dx + .5);
        c = (Math.abs(ca + 0.7) < 0.55 && d > r * 0.42 && d < r * 0.74) ? '#d42a2a' : '#3b3d48';   // étrier rouge fixe
      }
    }
    ctx.fillStyle = c; ctx.fillRect(cx + dx * s, cy + dy * s, s, s);
  }
}

/* Dessine une voiture : x = arrière-gauche, y = sol, s = échelle entière du sprite */
function drawCar(ctx, style, color, x, y, s, o) {
  o = o || {};
  const p = PROFILES[style], body = getBody(style, color);
  const lean = o.lean || 0;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath(); ctx.ellipse(x + p.L * s / 2, y + 1 * s, p.L * s * 0.54, 3.6 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  if (lean) { ctx.translate(x + p.wheels[0] * s, y); ctx.rotate(-lean * 0.010); ctx.translate(-(x + p.wheels[0] * s), -y); }
  ctx.drawImage(body, x, y - (p.H - 1) * s, p.L * s, p.H * s);
  const fast = (o.speed || 0) > 45;
  for (const wx of p.wheels) drawWheel(ctx, x + wx * s, y - (p.wr + 1) * s, p.wr, s, o.wheelAng || 0, fast);
  ctx.restore();
}
