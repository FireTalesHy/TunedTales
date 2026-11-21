/* ============ SPRITES PIXEL ART HAUTE DÉFINITION (~60 px / mètre) ============
   Toutes les coordonnées de profil sont [x, h] : x depuis l'arrière, h = hauteur au-dessus du sol (px).
   Rastérisation manuelle (pas d'anti-aliasing) avec dégradés tramés et contour pixel-art.            */

const SH = 100;                       // hauteur du sprite
const GY = SH - 1;                    // ligne de sol

// c : nombre = ton de la couleur carrosserie, tableau = couleur RGB
const PROFILES = {
  /* ---- Renault Twingo 2 : relevé sur photo de profil (Wikimedia Commons) ---- */
  twingo: {L:217, wr:18, wheels:[42,193], sill:14, belt:60, spokes:5, bodyBumpers:true,
    body:[[4,14],[2,17],[1,34],[4,52],[7,60],[13,74],[18,86],[26,90],[36,91],[90,91],[120,89],[136,87],[156,77],[170,67],[176,60],[192,57],[204,56],[212,48],[215,38],[216,26],[215,15],[210,13]],
    glass:[[40,61],[40,79],[44,85],[52,87],[90,88],[138,85],[162,68],[168,59]],
    pillars:[[90,100]], doors:[94,172], handle:[96,48], mirror:160,
    hl:[[200,55],[210,54],[215,48],[214,44],[203,46]],
    tl:[[2,44],[5,62],[12,63],[24,52],[22,46]],
    extra:[
      {t:'line',a:[76,34],b:[168,34],c:[214,218,228]},{t:'line',a:[76,33],b:[168,33],c:0.55},   // jonc chromé
      {t:'disc',x:179,h:50,r:1.6,c:[255,170,40]},                                              // répétiteur
      {t:'poly',pts:[[196,16],[214,17],[215,24],[198,24]],c:[12,12,16]},                       // prise d'air basse
      {t:'disc',x:206,h:28,r:2.2,c:[230,230,210]},
      {t:'rect',x:0,h:16,w:5,hh:3,c:[200,204,212]},
      {t:'line',a:[22,48],b:[200,52],c:1.5},
      {t:'poly',pts:[[14,86],[24,91],[34,92],[34,90],[22,88]],c:0.7},
      {t:'rect',x:90,h:60,w:10,hh:28,c:[24,24,30]}
    ]},

  /* ---- Renault Clio III RS : relevé sur photo de profil fournie ---- */
  clio: {L:243, wr:19, wheels:[33,202], sill:12, belt:62, spokes:10, bodyBumpers:true,
    body:[[2,16],[0,30],[2,46],[8,58],[16,70],[21,82],[27,88],[32,89],[56,91],[90,91],[120,89],[136,84],[156,75],[172,67],[176,61],[196,59],[212,56],[232,50],[239,40],[242,26],[241,16],[232,13]],
    glass:[[43,63],[43,78],[48,87],[90,89],[118,87],[136,80],[154,67],[158,60]],
    pillars:[[90,96]], doors:[90,174], handle:[94,52], mirror:152,
    hl:[[214,54],[226,52],[236,46],[238,42],[222,44]],
    tl:[[3,50],[4,60],[10,64],[18,60],[16,52]],
    extra:[
      {t:'rect',x:90,h:62,w:6,hh:27,c:[18,18,22]},                                               // montant B noir
      {t:'poly',pts:[[21,90],[32,92],[34,87],[25,84]],c:[20,20,26]},                              // becquet de hayon
      {t:'poly',pts:[[139,49],[184,48],[178,37],[150,38]],c:[120,124,134]},                       // déco RS
      {t:'rect',x:156,h:41,w:4,hh:3,c:[30,30,36]},{t:'rect',x:164,h:44,w:4,hh:3,c:[30,30,36]},{t:'rect',x:172,h:41,w:4,hh:3,c:[30,30,36]},
      {t:'rect',x:160,h:44,w:4,hh:3,c:0.9},{t:'rect',x:168,h:41,w:4,hh:3,c:0.9},
      {t:'poly',pts:[[176,40],[186,41],[184,46],[178,46]],c:[14,14,18]},                          // ouïe d'aile
      {t:'line',a:[72,38],b:[168,34],c:0.55},{t:'line',a:[72,39],b:[168,35],c:1.7},             // jonc latéral
      {t:'rect',x:158,h:34,w:10,hh:2,c:[200,204,214]},
      {t:'poly',pts:[[222,14],[240,15],[241,22],[226,22]],c:[12,12,16]},
      {t:'rect',x:46,h:12,w:140,hh:5,c:0.6},
      {t:'rect',x:0,h:17,w:5,hh:3,c:[200,204,212]}
    ]},

  /* ---- Mazda MX-5 NB : relevé sur photo de profil (Wikimedia Commons) ---- */
  mx5: {L:239, wr:17, wheels:[51,194], sill:11, belt:51, spokes:5, bodyBumpers:true,
    body:[[2,11],[1,16],[0,24],[0,32],[2,42],[4,47],[7,52],[16,53],[40,54],[50,55],[54,60],[62,67],[72,72],[82,74],[100,75],[118,74],[121,72],[148,52],[154,51],[176,49],[196,46],[216,41],[230,36],[236,30],[238,22],[236,12],[230,10]],
    glass:[[84,51],[84,67],[88,70],[120,70],[144,51]],
    soft:[[48,55],[54,60],[62,67],[72,72],[82,74],[100,75],[118,74],[121,72],[124,69],[124,66],[86,66],[84,52],[50,52]],
    pillars:[], doors:[83,156], handle:[90,43], mirror:120,
    hl:[[219,40],[228,39],[233,35],[232,31],[222,33]],
    tl:[[4,46],[14,47],[16,42],[13,37],[5,38]],
    extra:[
      {t:'rect',x:16,h:28,w:9,hh:2,c:[255,150,40]},{t:'rect',x:220,h:25,w:7,hh:2,c:[255,150,40]},
      {t:'disc',x:167,h:34,r:1.6,c:[255,150,40]},
      {t:'poly',pts:[[222,13],[236,14],[237,21],[224,20]],c:[10,10,14]},
      {t:'rect',x:4,h:15,w:10,hh:2,c:[200,204,212]},
      {t:'line',a:[12,44],b:[214,40],c:1.5},
      {t:'line',a:[66,15],b:[176,15],c:0.5}
    ]},

  /* ---- BMW M3 E46 coupé : relevé sur photo de profil (Wikimedia Commons) ---- */
  m3: {L:269, wr:19, wheels:[52,224], sill:13, belt:54, spokes:10, bodyBumpers:true,
    body:[[1,13],[0,15],[0,41],[3,54],[5,59],[8,61],[26,64],[42,67],[56,75],[76,81],[100,83],[136,82],[148,80],[188,52],[206,48],[246,44],[262,41],[268,33],[268,21],[264,13]],
    glass:[[52,55],[54,68],[64,75],[80,77],[136,77],[150,73],[180,53]],
    pillars:[[94,98]], doors:[92,183], handle:[95,47], mirror:160,
    hl:[[254,41],[266,39],[268,33],[256,32]],
    tl:[[1,43],[10,44],[10,54],[2,53]],
    extra:[
      {t:'rect',x:187,h:37,w:18,hh:3,c:[12,12,16]},{t:'rect',x:187,h:40,w:18,hh:1,c:[200,204,214]},          // branchie d'aile
      {t:'rect',x:189,h:33,w:4,hh:2,c:[40,90,220]},{t:'rect',x:193,h:33,w:4,hh:2,c:[120,60,170]},{t:'rect',x:197,h:33,w:4,hh:2,c:[210,40,50]},
      {t:'rect',x:264,h:24,w:5,hh:10,c:[12,12,16]},{t:'rect',x:264,h:34,w:5,hh:1,c:[200,204,214]},             // haricot
      {t:'poly',pts:[[234,13],[266,14],[267,21],[238,21]],c:[10,10,14]},
      {t:'line',a:[190,51],b:[248,45],c:1.6},                                                                // bosse de capot
      {t:'rect',x:10,h:62,w:30,hh:2,c:0.55},                                                                 // becquet de coffre
      {t:'rect',x:0,h:16,w:6,hh:3,c:[200,204,212]},{t:'rect',x:8,h:16,w:6,hh:3,c:[200,204,212]},
      {t:'line',a:[14,46],b:[250,42],c:1.5},{t:'line',a:[74,20],b:[200,20],c:0.5}
    ]},

  /* ---- Toyota Supra A80 : relevé sur photo de profil (Wikimedia Commons) ---- */
  supra: {L:271, wr:20, wheels:[57,221], sill:14, belt:59, spokes:6, bodyBumpers:true,
    body:[[2,14],[2,19],[0,30],[1,46],[6,51],[10,54],[16,62],[34,67],[56,73],[80,79],[100,82],[120,81],[136,78],[176,59],[196,58],[216,55],[240,50],[256,45],[267,38],[270,30],[269,17],[264,14]],
    glass:[[80,61],[78,66],[82,72],[90,76],[106,78],[140,77],[168,59]],
    pillars:[[99,102]], doors:[94,179], handle:[98,50], mirror:150,
    hl:[[254,46],[262,44],[268,39],[266,35],[256,37]],
    tl:[[1,44],[8,44],[8,52],[2,52]],
    extra:[
      {t:'poly',pts:[[8,80],[13,82],[44,69],[40,66],[20,71],[17,62],[11,62],[10,72]],c:1.05},   // aileron relevé
      {t:'line',a:[13,81],b:[43,69],c:[236,238,244]},
      {t:'poly',pts:[[88,22],[100,22],[100,30],[92,30]],c:[14,14,18]},                          // écope latérale
      {t:'rect',x:13,h:35,w:8,hh:2,c:[220,40,40]},{t:'rect',x:246,h:28,w:8,hh:2,c:[255,150,40]},
      {t:'rect',x:186,h:44,w:4,hh:2,c:[255,150,40]},
      {t:'poly',pts:[[240,15],[268,16],[269,25],[244,24]],c:[10,10,14]},
      {t:'rect',x:77,h:14,w:124,hh:4,c:0.35},
      {t:'rect',x:0,h:16,w:5,hh:4,c:[200,204,212]},
      {t:'line',a:[30,56],b:[96,58],c:1.5},{t:'line',a:[180,50],b:[250,46],c:1.5}
    ]},

  /* ---- Nissan Skyline GT-R R34 : relevé sur l'illustration de profil fournie ---- */
  skyline: {L:276, wr:19, wheels:[58,220], sill:9, belt:61, spokes:6, bodyBumpers:true,
    body:[[4,9],[0,20],[0,34],[4,52],[7,58],[26,59],[40,60],[56,65],[76,72],[86,77],[100,78],[136,77],[150,74],[170,64],[188,54],[216,52],[246,50],[270,41],[274,34],[275,16],[272,8],[262,7]],
    glass:[[80,61],[88,72],[100,76],[148,75],[168,61]],
    pillars:[[105,111]], doors:[102,184], handle:[110,46], mirror:160,
    hl:[[252,41],[266,42],[272,38],[268,35],[254,35]],
    tlRound:[7,46,5],
    extra:[
      {t:'poly',pts:[[12,72],[22,72],[20,59],[14,59]],c:0.85},                                     // jambe d'aileron
      {t:'poly',pts:[[2,76],[26,75],[26,71],[4,72]],c:1.0},{t:'line',a:[3,76],b:[25,75],c:[236,238,244]},
      {t:'rect',x:105,h:61,w:6,hh:15,c:[18,18,22]},
      {t:'line',a:[86,29],b:[196,29],c:0.45},                                                      // ligne de caisse
      {t:'poly',pts:[[193,22],[198,22],[198,30],[194,30]],c:[12,12,16]},                           // évent d'aile
      {t:'poly',pts:[[244,8],[274,9],[275,26],[248,24]],c:[12,12,16]},                             // grandes entrées d'air
      {t:'rect',x:262,h:16,w:4,hh:4,c:[230,230,220]},
      {t:'rect',x:80,h:9,w:120,hh:6,c:0.35},                                                       // bas de caisse
      {t:'poly',pts:[[206,52],[226,51],[228,53],[208,54]],c:[14,14,18]},                           // évent de capot
      {t:'rect',x:2,h:11,w:30,hh:6,c:0.3},
      {t:'rect',x:0,h:12,w:6,hh:4,c:[200,204,212]}
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
      f = u < 0.05 ? 1.85 : u < 0.13 ? 1.42 : u < 0.28 ? 1.2 : u < 0.42 ? 1.04 : u < 0.5 ? 0.86 : u < 0.56 ? 0.74 : u < 0.72 ? 0.92 : u < 0.86 ? 0.78 : 0.56;
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
  if (!p.bodyBumpers) {
    b.rect(L - 28, bot - 12, 27, 12, (x, y) => tone(C, 0.34 + bay(x, y) * 0.05), true);
    b.rect(1, bot - 12, 25, 12, (x, y) => tone(C, 0.34 + bay(x, y) * 0.05), true);
    for (let i = 0; i < 9; i++) b.rect(L - 25 + i * 3, bot - 8, 1, 4, [6, 6, 10]);
  }
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
function drawWheel(ctx, cx, cy, r, s, ang, fast, nsp) {
  const half = (nsp || 6) / 2;
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
      const sp = Math.abs(Math.sin(a * half));
      if (f < 0.10) c = '#e6e9f0';
      else if (f < 0.19) c = fast ? '#7a7f8c' : '#3a3d48';
      else if ((fast ? 0.2 : sp) < 0.30 + 0.22 * f) c = Math.sin(a * half) > 0 ? '#d4d8e2' : '#aeb3c0';
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
  for (const wx of p.wheels) {
    const wc = wheelSprite(p, o.wheelAng || 0, fast);
    ctx.drawImage(wc, x + (wx - p.wr) * s, y - (2 * p.wr + 1) * s, wc.width * s, wc.height * s);
  }
  ctx.restore();
}

/* cache des roues : 48 angles pré-rendus par profil */
const _wheelCache = {};
function wheelSprite(p, ang, fast) {
  const n = 48, a = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), k = fast ? 0 : Math.round(a / (Math.PI * 2) * n) % n;
  const key = p.wr + ':' + (p.spokes || 6) + ':' + (fast ? 'f' : k);
  if (_wheelCache[key]) return _wheelCache[key];
  const c = document.createElement('canvas'); c.width = c.height = 2 * p.wr + 1;
  drawWheel(c.getContext('2d'), p.wr, p.wr, p.wr, 1, k / n * Math.PI * 2, fast, p.spokes || 6);
  return (_wheelCache[key] = c);
}

/* halos lumineux (phares, feux, néon de bas de caisse) — composition additive */
function drawCarLights(ctx, style, x, y, s, o) {
  o = o || {};
  const p = PROFILES[style];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const glow = (gx, gy, r, col, a) => {
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
  };
  // phare : point lumineux + faisceau sur la route
  let hx = 0, hy = 0; for (const q of p.hl) { hx += q[0]; hy += q[1]; } hx /= p.hl.length; hy /= p.hl.length;
  const HX = x + hx * s, HY = y - (p.H - 1 - hy) * s;
  glow(HX, HY, 26 * s, '255,240,190', 0.55);
  const beam = ctx.createLinearGradient(HX, 0, HX + 220 * s, 0);
  beam.addColorStop(0, 'rgba(255,236,180,0.22)'); beam.addColorStop(1, 'rgba(255,236,180,0)');
  ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(HX, HY - 3 * s); ctx.lineTo(HX + 220 * s, y - 30 * s); ctx.lineTo(HX + 220 * s, y + 8 * s); ctx.lineTo(HX, HY + 4 * s); ctx.closePath(); ctx.fill();
  // feux arrière
  let tx = 3, ty = p.H - 1 - 48;
  if (p.tl) { tx = 0; ty = 0; for (const q of p.tl) { tx += q[0]; ty += q[1]; } tx /= p.tl.length; ty /= p.tl.length; }
  else if (p.tlRound) { tx = p.tlRound[0]; ty = p.tlRound[1]; }
  glow(x + tx * s, y - (p.H - 1 - ty) * s, (o.brake ? 30 : 18) * s, '255,40,40', o.brake ? 0.7 : 0.45);
  // néon de bas de caisse
  if (o.neon) {
    const g = ctx.createRadialGradient(x + p.L * s / 2, y, 0, x + p.L * s / 2, y, p.L * s * 0.6);
    g.addColorStop(0, `rgba(${o.neon},0.45)`); g.addColorStop(1, `rgba(${o.neon},0)`);
    ctx.save(); ctx.translate(x + p.L * s / 2, y); ctx.scale(1, 0.12); ctx.translate(-(x + p.L * s / 2), -y);
    ctx.fillStyle = g; ctx.fillRect(x - 40 * s, y - p.L * s * 0.6, p.L * s + 80 * s, p.L * s * 1.2); ctx.restore();
  }
  ctx.restore();
}
