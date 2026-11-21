/* ============ SPRITES PIXEL ART HAUTE DÉFINITION (~60 px / mètre) ============
   Toutes les coordonnées de profil sont [x, h] : x depuis l'arrière, h = hauteur au-dessus du sol (px).
   Rastérisation manuelle (pas d'anti-aliasing) avec dégradés tramés et contour pixel-art.            */

const SH = 100;                       // hauteur du sprite
const GY = SH - 1;                    // ligne de sol

// c : nombre = ton de la couleur carrosserie, tableau = couleur RGB
const PROFILES = {
  /* ---- Renault Twingo 2 : citadine ronde, toit haut, gros hayon ---- */
  twingo: {L:216, wr:18, wheels:[34,176], sill:12, belt:58,
    body:[[4,12],[1,18],[0,30],[1,42],[3,54],[6,64],[10,73],[16,80],[26,85],[42,88],[70,89],[96,88],[112,85],[126,80],[140,72],[152,64],[160,57],[176,52],[196,49],[208,46],[214,40],[216,32],[214,22],[208,15],[200,12]],
    glass:[[14,58],[17,66],[22,74],[32,81],[46,84],[70,85],[96,84],[110,81],[124,76],[136,68],[148,59],[150,58]],
    pillars:[[52,58],[100,107]], doors:[98,168], handle:[106,56], mirror:146,
    hl:[[178,56],[202,52],[211,44],[205,40],[184,46]], hlRound:[196,47,7],
    tl:[[1,44],[9,44],[10,66],[3,64]],
    extra:[
      {t:'poly',pts:[[188,17],[212,19],[213,28],[192,28]],c:[10,10,14]},      // prise d'air
      {t:'rect',x:196,h:22,w:14,hh:1,c:[90,94,104]},
      {t:'line',a:[60,36],b:[186,36],c:0.62},                                  // ligne de caractère
      {t:'rect',x:2,h:18,w:26,hh:7,c:0.3},                                    // bas de pare-chocs arrière
      {t:'disc',x:206,h:27,r:3,c:[255,236,160]},                               // antibrouillard
      {t:'rect',x:0,h:34,w:3,hh:3,c:[214,218,226]}
    ]},

  /* ---- Renault Clio III RS : compacte sportive, bouclier agressif ---- */
  clio: {L:242, wr:19, wheels:[44,198], sill:12, belt:60,
    body:[[6,12],[2,18],[0,30],[2,46],[5,58],[10,66],[18,74],[28,81],[42,85],[60,87],[100,87],[126,85],[146,78],[166,68],[190,59],[214,57],[232,53],[240,45],[242,32],[238,20],[231,14],[214,12]],
    glass:[[26,60],[30,70],[40,78],[54,83],[112,83],[128,81],[144,75],[160,67],[182,60]],
    pillars:[[44,60],[110,120]], doors:[112,190], handle:[120,57], mirror:178,
    hl:[[200,60],[232,57],[238,49],[233,43],[204,49]],
    tl:[[1,48],[8,48],[10,70],[4,66]],
    extra:[
      {t:'poly',pts:[[204,15],[238,17],[239,31],[208,31]],c:[8,8,12]},         // grandes entrées d'air RS
      {t:'rect',x:206,h:30,w:32,hh:1,c:[120,124,134]},
      {t:'rect',x:206,h:19,w:34,hh:3,c:[8,8,12]},                              // lame avant noire
      {t:'rect',x:2,h:22,w:34,hh:10,c:[14,14,18]},                              // diffuseur arrière
      {t:'rect',x:70,h:25,w:10,hh:5,c:[236,236,236]},{t:'rect',x:70,h:25,w:5,hh:2,c:[20,20,20]},
      {t:'rect',x:75,h:23,w:5,hh:3,c:[20,20,20]},{t:'rect',x:80,h:25,w:10,hh:5,c:[236,236,236]},{t:'rect',x:85,h:25,w:5,hh:2,c:[20,20,20]},
      {t:'rect',x:0,h:16,w:4,hh:3,c:[210,214,222]},{t:'rect',x:0,h:12,w:4,hh:3,c:[210,214,222]},
      {t:'disc',x:224,h:26,r:3,c:[255,240,180]},
      {t:'line',a:[60,36],b:[190,38],c:0.6}
    ]},

  /* ---- Mazda MX-5 NB : roadster capote, capot long, optiques ovales ---- */
  mx5: {L:237, wr:17, wheels:[48,184], sill:12, belt:54,
    body:[[6,12],[2,18],[0,32],[2,40],[7,46],[22,50],[46,52],[60,53],[74,60],[92,70],[112,74],[132,74],[142,68],[156,57],[172,52],[200,50],[222,46],[234,40],[237,30],[233,20],[226,14],[210,12]],
    glass:[[78,54],[92,66],[110,71],[130,71],[142,65],[160,54]],
    soft:[[58,53],[74,60],[92,70],[112,74],[132,74],[142,68],[156,57],[150,53]],
    pillars:[], doors:[66,168], handle:[80,52], mirror:152,
    hl:[[198,50],[222,47],[230,41],[224,36],[202,41]], hlRound:[214,43,7],
    tl:[[1,40],[8,40],[11,50],[2,52]],
    extra:[
      {t:'poly',pts:[[196,26],[220,24],[232,30],[198,32]],c:[10,10,14]},
      {t:'rect',x:28,h:47,w:7,hh:7,c:[190,194,204]},                           // bouchon d'essence
      {t:'rect',x:200,h:44,w:20,hh:2,c:0.55},
      {t:'line',a:[16,36],b:[200,36],c:0.62},
      {t:'rect',x:2,h:18,w:28,hh:6,c:0.3}
    ]},

  /* ---- BMW M3 E46 coupé : long capot à bosse, nez de requin, branchies ---- */
  m3: {L:269, wr:19, wheels:[58,222], sill:11, belt:62,
    body:[[8,11],[2,16],[0,30],[2,50],[6,59],[30,63],[56,64],[66,66],[82,74],[100,80],[116,82],[150,82],[162,79],[178,73],[200,64],[210,62],[240,62],[256,58],[265,50],[268,40],[268,30],[263,20],[255,13],[238,11]],
    glass:[[70,62],[84,73],[100,79],[118,81],[150,81],[162,78],[178,72],[198,62]],
    pillars:[[130,136]], doors:[92,192], handle:[100,59], mirror:190,
    hl:[[236,61],[262,57],[266,49],[240,49]],
    tl:[[1,44],[14,48],[16,58],[3,57]],
    extra:[
      {t:'poly',pts:[[240,14],[268,16],[268,30],[244,28]],c:[8,8,12]},         // large entrée d'air
      {t:'rect',x:262,h:36,w:7,hh:14,c:[10,10,14]},{t:'rect',x:262,h:36,w:7,hh:1,c:[200,204,212]},{t:'rect',x:262,h:50,w:7,hh:1,c:[200,204,212]},
      {t:'rect',x:200,h:50,w:3,hh:6,c:[8,8,12]},{t:'rect',x:205,h:50,w:3,hh:6,c:[8,8,12]},{t:'rect',x:210,h:50,w:3,hh:6,c:[8,8,12]},   // branchies
      {t:'rect',x:198,h:50,w:16,hh:1,c:[200,204,212]},
      {t:'rect',x:196,h:40,w:5,hh:2,c:[40,90,220]},{t:'rect',x:201,h:40,w:5,hh:2,c:[120,60,170]},{t:'rect',x:206,h:40,w:5,hh:2,c:[210,40,50]},
      {t:'line',a:[176,64],b:[236,64],c:1.55},{t:'line',a:[176,62],b:[236,62],c:0.7},   // bosse de capot
      {t:'rect',x:20,h:64,w:42,hh:2,c:0.5},                                     // becquet de coffre
      {t:'rect',x:0,h:17,w:5,hh:4,c:[210,214,222]},{t:'rect',x:0,h:13,w:5,hh:4,c:[210,214,222]},
      {t:'line',a:[58,32],b:[222,32],c:0.62}
    ]},

  /* ---- Toyota Supra A80 : fastback bas, bulle de toit, gigantesque aileron ---- */
  supra: {L:271, wr:19, wheels:[61,214], sill:11, belt:57,
    body:[[8,11],[2,18],[0,30],[2,44],[6,55],[14,60],[40,64],[62,66],[78,70],[98,75],[122,77],[150,77],[168,73],[186,66],[206,58],[220,54],[246,50],[262,44],[270,36],[270,26],[264,17],[254,12],[236,11]],
    glass:[[64,57],[76,66],[96,73],[120,75],[150,75],[166,71],[182,65],[202,57]],
    pillars:[[130,138]], doors:[84,192], handle:[96,55], mirror:186,
    hl:[[230,53],[259,46],[264,40],[234,42]],
    tl:[[1,36],[10,36],[13,54],[3,52]],
    extra:[
      {t:'rect',x:12,h:62,w:4,hh:19,c:[20,20,26]},{t:'rect',x:46,h:64,w:4,hh:17,c:[20,20,26]},     // jambes d'aileron
      {t:'poly',pts:[[0,80],[62,80],[62,84],[0,84]],c:[26,26,32]},{t:'rect',x:0,h:84,w:62,hh:1,c:[110,114,126]},
      {t:'rect',x:210,h:51,w:6,hh:2,c:[8,8,12]},{t:'rect',x:221,h:51,w:6,hh:2,c:[8,8,12]},                // sorties de capot
      {t:'rect',x:196,h:44,w:3,hh:8,c:[8,8,12]},{t:'rect',x:201,h:44,w:3,hh:8,c:[8,8,12]},                 // prise d'air d'aile
      {t:'poly',pts:[[236,14],[268,16],[269,28],[240,27]],c:[8,8,12]},
      {t:'rect',x:0,h:34,w:10,hh:2,c:[230,40,40]},                                                          // bandeau de feux
      {t:'rect',x:0,h:17,w:5,hh:4,c:[210,214,222]},{t:'rect',x:0,h:13,w:5,hh:4,c:[210,214,222]},
      {t:'line',a:[126,76],b:[132,57],c:0.5},
      {t:'line',a:[62,32],b:[214,32],c:0.62}
    ]},

  /* ---- Nissan Skyline GT-R R34 : coupé carré, 4 feux ronds, aileron, évents ---- */
  skyline: {L:276, wr:19, wheels:[60,220], sill:11, belt:62,
    body:[[8,11],[2,16],[0,30],[2,50],[6,60],[14,66],[40,68],[60,70],[76,72],[98,81],[114,82],[168,82],[184,79],[200,70],[216,62],[240,60],[262,57],[272,50],[276,40],[276,30],[272,20],[262,13],[244,11]],
    glass:[[74,62],[90,76],[106,81],[170,81],[184,77],[200,68],[214,62]],
    pillars:[[134,144]], doors:[100,198], handle:[108,59], mirror:198,
    hl:[[236,58],[268,54],[274,46],[272,40],[240,46]],
    tlRound:[9,48,6],
    extra:[
      {t:'rect',x:14,h:66,w:4,hh:19,c:[20,20,26]},{t:'rect',x:42,h:68,w:4,hh:17,c:[20,20,26]},
      {t:'poly',pts:[[0,84],[56,84],[56,88],[0,88]],c:[26,26,32]},{t:'rect',x:0,h:88,w:56,hh:1,c:[110,114,126]},
      {t:'poly',pts:[[206,61],[228,60],[230,63],[208,64]],c:[8,8,12]},                                      // évent de capot
      {t:'poly',pts:[[240,15],[274,17],[276,32],[246,30]],c:[8,8,12]},                                     // grandes entrées d'air
      {t:'rect',x:244,h:30,w:30,hh:1,c:[120,124,134]},
      {t:'rect',x:196,h:50,w:3,hh:7,c:[8,8,12]},{t:'rect',x:201,h:50,w:3,hh:7,c:[8,8,12]},
      {t:'rect',x:0,h:17,w:5,hh:4,c:[210,214,222]},{t:'rect',x:0,h:13,w:5,hh:4,c:[210,214,222]},
      {t:'rect',x:2,h:24,w:44,hh:7,c:[16,16,20]},
      {t:'line',a:[60,34],b:[220,34],c:0.62},
      {t:'rect',x:258,h:44,w:10,hh:2,c:[200,30,40]}
    ]}
};
// convertit [x,h] -> [x,y] une fois
for (const k in PROFILES) {
  const p = PROFILES[k]; p.H = SH;
  const T = a => a && a.map(q => [q[0], GY - q[1]]);
  p.body = T(p.body); p.glass = T(p.glass); p.soft = T(p.soft); p.hl = T(p.hl); p.tl = T(p.tl);
  p.bottom = GY - p.sill; p.beltY = GY - p.belt;
  p.pillars = p.pillars || [];
  for (const e of p.extra) { if (e.pts) e.pts = T(e.pts); if (e.a) { e.a = [e.a[0], GY - e.a[1]]; e.b = [e.b[0], GY - e.b[1]]; } if (e.h !== undefined) e.y = GY - e.h; }
  if (p.hlRound) p.hlRound = [p.hlRound[0], GY - p.hlRound[1], p.hlRound[2]];
  if (p.tlRound) p.tlRound = [p.tlRound[0], GY - p.tlRound[1], p.tlRound[2]];
  p.handle = [p.handle[0], GY - p.handle[1]];
}

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
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    const xs = [];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1], yy = y + .5;
      if ((yi > yy) !== (yj > yy)) xs.push((xj - xi) * (yy - yi) / (yj - yi) + xi);
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2)
      for (let x = Math.ceil(xs[k] - .5); x < xs[k + 1] - .5; x++) this.px(x, y, typeof c === 'function' ? c(x, y) : c, sil);
  }
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
  const L = p.L, belt = p.beltY, bot = p.bottom;
  const topY = Math.min(...p.body.map(q => q[1]));
  const col = c => typeof c === 'number' ? tone(C, c) : c;

  // 1) carrosserie : dégradé tramé en palette limitée
  b.poly(p.body, (x, y) => {
    const n = bay(x, y);
    let f;
    if (y < belt) { const u = (y - topY) / Math.max(1, belt - topY); f = Math.round((1.08 + 0.38 * (1 - u) + n * 0.12) / 0.08) * 0.08; }
    else {
      const u = (y - belt) / (bot - belt) + n * 0.09;
      f = u < 0.05 ? 1.85 : u < 0.12 ? 1.45 : u < 0.30 ? 1.22 : u < 0.5 ? 1.02 : u < 0.68 ? 0.86 : u < 0.84 ? 0.68 : 0.5;
    }
    return tone(C, f);
  }, true);
  // capote
  if (p.soft) b.poly(p.soft, (x, y) => { const f = 0.34 + bay(x, y) * 0.05 + (y - topY) * 0.004; return [30 * f * 3, 32 * f * 3, 38 * f * 3]; }, true);

  // 2) ailes bombées : reflet au-dessus de chaque roue
  for (const wx of p.wheels) {
    const cy = GY - p.wr;
    for (let a = 0; a <= 180; a += 2) {
      const t = a * Math.PI / 180, rr = p.wr + 8;
      const x = Math.round(wx - Math.cos(t) * rr), y = Math.round(cy - Math.sin(t) * rr);
      if (b.has(x, y) && y > belt) { b.px(x, y, tone(C, 1.5)); if (a % 6 === 0) b.px(x, y + 1, tone(C, 1.3)); }
    }
  }
  // lignes de caractère / ombres sous le bouclier
  for (const e of p.extra) if (e.t === 'line' && typeof e.c === 'number') {
    for (let i = 0; i <= Math.abs(e.b[0] - e.a[0]); i++) {
      const x = e.a[0] + i, y = Math.round(e.a[1] + (e.b[1] - e.a[1]) * i / Math.max(1, e.b[0] - e.a[0]));
      if (b.has(x, y)) { b.px(x, y, tone(C, e.c)); b.px(x, y + 1, tone(C, 1.45)); }
    }
  }

  // 3) vitres : cadre + verre dégradé + reflets, liseré chromé
  const gMask = new Uint8Array(L * p.H);
  const gys = p.glass.map(q => q[1]); const gTop = Math.min(...gys), gBot = Math.max(...gys);
  for (let y = gTop; y <= gBot; y++) for (let x = 0; x < L; x++) if (inPoly(p.glass, x + .5, y + .5)) gMask[y * L + x] = 1;
  const gm = (x, y) => x >= 0 && y >= 0 && x < L && y < p.H && gMask[y * L + x];
  for (let y = gTop; y <= gBot; y++) for (let x = 0; x < L; x++) {
    if (!gm(x, y)) continue;
    const edge = !gm(x - 1, y) || !gm(x + 1, y) || !gm(x, y - 1);
    if (!gm(x, y + 1)) { b.px(x, y, [196, 202, 212], true); continue; }           // liseré chromé
    if (edge) { b.px(x, y, tone(C, 0.3), true); continue; }
    const u = (y - gTop) / Math.max(1, gBot - gTop);
    let c = [24 + 56 * u, 40 + 78 * u, 62 + 88 * u];
    const d = (x * 1.0 + y * 1.7) % 46;
    if (d < 5) c = c.map(v => v + 46); else if (d < 9) c = c.map(v => v + 18);
    if (p.soft === undefined && u > 0.55 && ((x * 7 + y * 3) % 23) < 2) c = c.map(v => v - 14);
    const n = bay(x, y) * 8; b.px(x, y, [c[0] + n, c[1] + n, c[2] + n], true);
  }
  // appuis-tête (silhouettes dans l'habitacle)
  if (!p.soft) {
    for (const hx of [p.pillars.length ? p.pillars[0][1] + 8 : 80]) { /* pas de détail intrusif */ }
  }
  for (const pl of p.pillars) {
    for (let y = gTop; y <= belt; y++) for (let x = pl[0]; x < pl[1]; x++) if (gm(x, y)) b.px(x, y, tone(C, 0.55 + bay(x, y) * 0.08), true);
  }

  // 4) portes, poignées, bas de caisse
  const seam = tone(C, 0.42);
  for (const dx of p.doors) for (let y = belt + 2; y < bot - 6; y++) if (b.has(dx, y)) { b.px(dx, y, seam); b.px(dx + 1, y, tone(C, 1.4)); }
  b.rect(p.handle[0], p.handle[1], 10, 2, [210, 214, 222]);
  b.rect(p.handle[0], p.handle[1] + 2, 10, 1, tone(C, 0.5));
  const sk0 = p.wheels[0] + p.wr + 8, sk1 = p.wheels[1] - p.wr - 8;
  b.rect(sk0, bot - 5, sk1 - sk0, 5, (x, y) => tone(C, 0.32 + bay(x, y) * 0.05), true);
  b.rect(sk0, bot - 6, sk1 - sk0, 1, tone(C, 0.8));
  b.rect(L - 28, bot - 12, 27, 12, (x, y) => tone(C, 0.34 + bay(x, y) * 0.05), true);          // bouclier avant
  b.rect(1, bot - 12, 25, 12, (x, y) => tone(C, 0.34 + bay(x, y) * 0.05), true);               // bouclier arrière
  for (let i = 0; i < 9; i++) b.rect(L - 25 + i * 3, bot - 8, 1, 4, [6, 6, 10]);
  // rétroviseur
  const mx = p.mirror, my = belt - 4;
  b.poly([[mx, my], [mx + 12, my], [mx + 14, my + 4], [mx + 10, my + 9], [mx + 1, my + 9]], (x, y) => tone(C, 0.8 + bay(x, y) * 0.1 + (my + 4 - y) * 0.02), true);
  b.rect(mx + 2, my + 1, 8, 1, tone(C, 1.8));
  b.rect(mx + 12, my + 2, 2, 2, [20, 20, 26]);

  // 5) feux
  if (p.hlRound) {
    const [cx, cy, r] = p.hlRound;
    b.poly(p.hl, [24, 24, 30], true);
    b.disc(cx, cy, r + 2, [18, 18, 24], true); b.disc(cx, cy, r, (x, y) => ((x - cx) + (y - cy) < -2 ? [252, 252, 244] : [226, 224, 186]), true);
    b.disc(cx, cy, r * 0.45, [255, 214, 90]); b.px(cx - 3, cy - 3, [255, 255, 255]);
  } else {
    b.poly(p.hl, (x, y) => (x + y) % 6 === 0 ? [255, 255, 255] : [226, 228, 214], true);
    for (let i = 0; i < p.hl.length; i++) { const q = p.hl[i], n = p.hl[(i + 1) % p.hl.length]; b.line(q[0], q[1], n[0], n[1], [28, 28, 34]); }
    let cx = 0, cy = 0; for (const q of p.hl) { cx += q[0]; cy += q[1]; } cx = Math.round(cx / p.hl.length); cy = Math.round(cy / p.hl.length);
    b.disc(cx, cy, 5, [60, 64, 76]); b.disc(cx, cy, 3, [255, 232, 140]); b.px(cx - 1, cy - 1, [255, 255, 255]);
    b.rect(L - 5, p.hl[3][1] - 1, 4, 5, [255, 170, 40]);
  }
  if (p.tlRound) {
    const [cx, cy, r] = p.tlRound;
    b.disc(cx, cy, r + 1.5, [24, 8, 8], true); b.disc(cx, cy, r, (x, y) => (x + y) % 4 ? [226, 30, 36] : [255, 110, 100], true);
    b.disc(cx, cy, r * 0.45, [255, 150, 140]);
    b.poly([[1, cy - 8], [18, cy - 8], [18, cy + 8], [1, cy + 8]], (x, y) => !b.has(x, y) || b.sil[y * L + x] ? [30, 10, 12] : [30, 10, 12], true);
    b.disc(cx, cy, r + 1.5, [24, 8, 8], true); b.disc(cx, cy, r, (x, y) => (x + y) % 4 ? [226, 30, 36] : [255, 110, 100], true); b.disc(cx, cy, r * 0.45, [255, 170, 160]);
    b.disc(cx + 10, cy, r - 1, (x, y) => (x + y) % 4 ? [200, 24, 30] : [240, 90, 84], true);
  } else {
    b.poly(p.tl, (x, y) => (x + y) % 5 === 0 ? [255, 96, 84] : [200, 24, 30], true);
    const t0 = p.tl[0]; b.line(t0[0], t0[1], p.tl[1][0], p.tl[1][1], [255, 150, 130]);
  }

  // 6) accessoires propres à chaque voiture
  for (const e of p.extra) {
    if (e.t === 'poly') b.poly(e.pts, col(e.c), true);
    else if (e.t === 'rect') b.rect(e.x, e.y - e.hh + 1, e.w, e.hh, typeof e.c === 'number' ? ((x, y) => tone(C, e.c + bay(x, y) * 0.05)) : e.c, true);
    else if (e.t === 'disc') b.disc(e.x, e.y, e.r, col(e.c), true);
    else if (e.t === 'line' && typeof e.c !== 'number') b.line(e.a[0], e.a[1], e.b[0], e.b[1], e.c, true);
  }

  // 7) passages de roues
  for (const wx of p.wheels) {
    const cy = GY - p.wr;
    b.disc(wx, cy, p.wr + 5, tone(C, 0.28), true, bot);
    b.disc(wx, cy, p.wr + 3.8, [8, 8, 12], true, bot);
  }
  // 8) contour pixel-art
  const o = tone(C, 0.2);
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

/* roue détaillée : bande de roulement, flanc, lèvre, jante à 6 rayons, disque + étrier rouge */
function drawWheel(ctx, cx, cy, r, s, ang, fast) {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const d = Math.sqrt((dx + .5) * (dx + .5) + (dy + .5) * (dy + .5));
    if (d > r) continue;
    const f = d / r;
    let c;
    if (f > 0.86) c = f > 0.95 ? '#08080a' : ((dx + dy) & 1 ? '#17171c' : '#101014');   // bande de roulement
    else if (f > 0.70) c = f > 0.78 ? '#2a2a32' : '#202026';                              // flanc
    else if (f > 0.64) c = '#e8ecf4';                                                    // lèvre de jante
    else if (f > 0.60) c = '#8a90a0';
    else {
      const a = Math.atan2(dy + .5, dx + .5) - ang;
      const sp = Math.abs(Math.sin(a * 3));
      if (f < 0.10) c = '#e6e9f0';
      else if (f < 0.19) c = fast ? '#7a7f8c' : '#3a3d48';
      else if ((fast ? 0.2 : sp) < 0.30 + 0.22 * f) c = Math.sin(a * 3) > 0 ? '#d4d8e2' : '#aeb3c0';
      else {
        const ca = Math.atan2(dy + .5, dx + .5);
        c = (Math.abs(ca + 0.75) < 0.5 && f > 0.28 && f < 0.56) ? '#d82828' : '#34363f';      // étrier rouge fixe
      }
    }
    ctx.fillStyle = c; ctx.fillRect(cx + dx * s, cy + dy * s, s, s);
  }
}

/* Dessine une voiture : x = arrière-gauche, y = sol, s = échelle (sprite) */
function drawCar(ctx, style, color, x, y, s, o) {
  o = o || {};
  const p = PROFILES[style], body = getBody(style, color);
  const lean = o.lean || 0;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(x + p.L * s / 2, y + 1 * s, p.L * s * 0.55, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  if (lean) { ctx.translate(x + p.wheels[0] * s, y); ctx.rotate(-lean * 0.007); ctx.translate(-(x + p.wheels[0] * s), -y); }
  ctx.drawImage(body, x, y - (p.H - 1) * s, p.L * s, p.H * s);
  const fast = (o.speed || 0) > 45;
  for (const wx of p.wheels) drawWheel(ctx, x + wx * s, y - (p.wr + 1) * s, p.wr, s, o.wheelAng || 0, fast);
  ctx.restore();
}
