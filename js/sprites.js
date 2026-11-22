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
      {t:'poly',wing:1,pts:[[8,80],[13,82],[44,69],[40,66],[20,71],[17,62],[11,62],[10,72]],c:1.05},   // aileron relevé
      {t:'line',wing:1,a:[13,81],b:[43,69],c:[236,238,244]},
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
      {t:'poly',wing:1,pts:[[12,72],[22,72],[20,59],[14,59]],c:0.85},                                     // jambe d'aileron
      {t:'poly',wing:1,pts:[[2,76],[26,75],[26,71],[4,72]],c:1.0},{t:'line',wing:1,a:[3,76],b:[25,75],c:[236,238,244]},
      {t:'rect',x:105,h:61,w:6,hh:15,c:[18,18,22]},
      {t:'line',a:[86,29],b:[196,29],c:0.45},                                                      // ligne de caisse
      {t:'poly',pts:[[193,22],[198,22],[198,30],[194,30]],c:[12,12,16]},                           // évent d'aile
      {t:'poly',pts:[[244,8],[274,9],[275,26],[248,24]],c:[12,12,16]},                             // grandes entrées d'air
      {t:'rect',x:262,h:16,w:4,hh:4,c:[230,230,220]},
      {t:'rect',x:80,h:9,w:120,hh:6,c:0.35},                                                       // bas de caisse
      {t:'poly',pts:[[206,52],[226,51],[228,53],[208,54]],c:[14,14,18]},                           // évent de capot
      {t:'rect',x:2,h:11,w:30,hh:6,c:0.3},
      {t:'rect',x:0,h:12,w:6,hh:4,c:[200,204,212]}
    ]},
  /* ---- Honda Civic Type R EP3 : « obus » monovolume, pare-brise très incliné ---- */
  civic: {L:248, wr:19, wheels:[41,195], sill:12, belt:61, spokes:5, bodyBumpers:true,
    body:[[3,12],[0,22],[1,42],[3,58],[8,70],[14,80],[24,85],[40,86],[110,86],[130,84],[150,78],[175,66],[200,55],[222,50],[238,45],[246,37],[248,26],[245,15],[238,12]],
    glass:[[22,62],[24,72],[32,80],[44,82],[110,82],[128,80],[146,74],[170,63],[178,60]],
    pillars:[[96,104]], doors:[92,176], handle:[100,56], mirror:166,
    hl:[[214,54],[234,50],[244,44],[238,40],[218,46]],
    tl:[[1,46],[10,46],[12,66],[4,64]],
    extra:[
      {t:'rect',x:96,h:62,w:8,hh:24,c:[18,18,22]},
      {t:'poly',pts:[[14,84],[34,88],[38,85],[20,82]],c:0.75},
      {t:'poly',pts:[[222,14],[246,16],[247,26],[226,26]],c:[10,10,14]},
      {t:'rect',x:200,h:30,w:8,hh:3,c:[210,30,40]},
      {t:'line',a:[50,38],b:[196,40],c:0.6},
      {t:'rect',x:0,h:16,w:5,hh:3,c:[200,204,212]}
    ]},

  /* ---- Peugeot RCZ : coupé « double bulle », arches de toit aluminium ---- */
  rcz: {L:257, wr:19, wheels:[48,205], sill:12, belt:60, spokes:5, bodyBumpers:true,
    body:[[5,12],[0,22],[0,40],[3,52],[10,58],[28,60],[44,64],[62,72],[82,79],[104,82],[124,82],[140,79],[160,70],[182,60],[204,56],[230,53],[248,46],[256,36],[255,20],[248,12]],
    glass:[[60,62],[76,71],[96,77],[120,78],[136,75],[156,66],[170,60]],
    pillars:[], doors:[84,180], handle:[92,56], mirror:166,
    hl:[[226,55],[248,50],[254,43],[232,47]],
    tl:[[1,46],[12,48],[13,56],[2,55]],
    extra:[
      {t:'line',a:[28,58],b:[62,70],c:[206,210,220]},{t:'line',a:[62,70],b:[82,77],c:[206,210,220]},{t:'line',a:[82,77],b:[104,80],c:[206,210,220]},
      {t:'line',a:[104,80],b:[124,80],c:[206,210,220]},{t:'line',a:[124,80],b:[140,77],c:[206,210,220]},{t:'line',a:[140,77],b:[160,68],c:[206,210,220]},
      {t:'line',a:[28,57],b:[62,69],c:[150,156,168]},{t:'line',a:[62,69],b:[104,79],c:[150,156,168]},{t:'line',a:[104,79],b:[140,76],c:[150,156,168]},{t:'line',a:[140,76],b:[160,67],c:[150,156,168]},
      {t:'poly',pts:[[222,14],[252,16],[253,28],[226,27]],c:[12,12,16]},
      {t:'line',a:[54,34],b:[200,38],c:0.6},
      {t:'rect',x:0,h:16,w:6,hh:3,c:[200,204,212]}
    ]},

  /* ---- Nissan Silvia S15 : coupé fluide, capot long, optiques effilées ---- */
  s15: {L:267, wr:19, wheels:[62,214], sill:11, belt:57, spokes:5, bodyBumpers:true,
    body:[[6,12],[1,20],[0,32],[2,46],[8,55],[30,58],[58,60],[72,64],[90,72],[106,76],[150,77],[164,74],[184,63],[200,56],[230,53],[252,48],[263,40],[266,30],[263,18],[254,12]],
    glass:[[74,58],[88,68],[104,73],[150,73],[162,70],[180,60],[184,57]],
    pillars:[[124,128]], doors:[86,186], handle:[96,52], mirror:172,
    hl:[[236,53],[256,48],[262,42],[240,45]],
    tl:[[1,44],[12,46],[12,54],[2,53]],
    extra:[
      {t:'poly',wing:1,pts:[[8,59],[32,60],[32,63],[8,62]],c:0.85},
      {t:'poly',pts:[[236,14],[263,16],[264,28],[240,27]],c:[12,12,16]},
      {t:'line',a:[70,36],b:[214,40],c:0.6},
      {t:'rect',x:0,h:16,w:5,hh:3,c:[200,204,212]}
    ]},

  /* ---- Mitsubishi Lancer Evo IX : berline carrée, grand aileron, capot à ouïes ---- */
  evo: {L:269, wr:19, wheels:[57,215], sill:12, belt:63, spokes:6, bodyBumpers:true,
    body:[[5,12],[0,22],[0,42],[3,56],[10,62],[40,64],[58,66],[74,74],[92,84],[104,86],[150,86],[164,83],[184,72],[204,62],[236,59],[256,55],[266,46],[268,34],[265,20],[258,12]],
    glass:[[72,64],[78,72],[92,80],[106,82],[150,82],[162,79],[180,70],[198,63]],
    pillars:[[120,126],[86,90]], doors:[78,128,196], handle:[134,60], mirror:186,
    hl:[[232,59],[258,55],[264,48],[236,51]],
    tl:[[1,48],[12,50],[13,58],[2,57]],
    extra:[
      {t:'rect',wing:1,x:10,h:64,w:4,hh:13,c:0.8},{t:'rect',wing:1,x:40,h:65,w:4,hh:12,c:0.8},
      {t:'poly',wing:1,pts:[[2,77],[52,77],[52,81],[4,81]],c:1.0},{t:'line',wing:1,a:[3,81],b:[51,81],c:[236,238,244]},
      {t:'rect',x:212,h:60,w:4,hh:2,c:[10,10,14]},{t:'rect',x:220,h:60,w:4,hh:2,c:[10,10,14]},{t:'rect',x:228,h:59,w:4,hh:2,c:[10,10,14]},
      {t:'poly',pts:[[238,14],[268,16],[268,32],[242,30]],c:[10,10,14]},
      {t:'line',a:[60,36],b:[214,38],c:0.6},
      {t:'rect',x:0,h:16,w:6,hh:4,c:[200,204,212]}
    ]},

  /* ---- Porsche 911 GT3 (997) : silhouette 911, moteur arrière, aileron fixe ---- */
  gt3: {L:266, wr:19, wheels:[64,206], sill:11, belt:56, spokes:5, bodyBumpers:true,
    body:[[6,12],[1,20],[0,34],[2,44],[8,50],[24,56],[44,63],[64,70],[86,75],[108,77],[130,76],[148,70],[166,58],[180,52],[200,50],[222,48],[244,44],[258,38],[264,30],[264,18],[258,12]],
    glass:[[66,58],[84,68],[104,73],[128,72],[146,64],[158,56]],
    pillars:[[118,121]], doors:[86,168], handle:[94,52], mirror:156,
    hl:[[236,47],[248,46],[254,40],[250,36],[238,40]], hlRound:[246,42,6],
    tl:[[2,42],[14,44],[14,50],[2,49]],
    extra:[
      {t:'rect',wing:1,x:16,h:52,w:4,hh:21,c:[24,24,30]},{t:'rect',wing:1,x:40,h:61,w:4,hh:12,c:[24,24,30]},
      {t:'poly',wing:1,pts:[[4,72],[52,72],[54,76],[4,76]],c:[28,28,34]},{t:'line',wing:1,a:[4,76],b:[53,76],c:[110,114,126]},
      {t:'poly',pts:[[50,26],[62,28],[62,40],[52,38]],c:[12,12,16]},
      {t:'poly',pts:[[234,14],[262,16],[263,28],[238,27]],c:[12,12,16]},
      {t:'line',a:[70,34],b:[206,36],c:0.6},
      {t:'rect',x:0,h:16,w:6,hh:4,c:[200,204,212]}
    ]},

  /* ---- Nissan GT-R R35 : coupé massif, aileron de coffre, 4 feux ronds ---- */
  r35: {L:279, wr:20, wheels:[56,223], sill:12, belt:61, spokes:6, bodyBumpers:true,
    body:[[6,12],[0,22],[0,40],[3,56],[10,62],[34,66],[56,70],[72,76],[92,82],[110,82],[150,82],[166,78],[188,66],[208,58],[240,56],[262,50],[274,42],[278,32],[276,18],[268,12]],
    glass:[[74,64],[82,72],[96,78],[112,80],[150,80],[164,76],[184,66],[196,61]],
    pillars:[[136,140]], doors:[100,200], handle:[108,57], mirror:192,
    hl:[[244,57],[266,52],[274,45],[252,48]],
    tlRound:[8,50,5],
    extra:[
      {t:'poly',wing:1,pts:[[6,66],[34,67],[34,70],[6,69]],c:0.85},
      {t:'poly',pts:[[204,34],[214,36],[214,46],[206,44]],c:[12,12,16]},
      {t:'poly',pts:[[246,14],[276,16],[277,30],[250,28]],c:[12,12,16]},
      {t:'line',a:[60,36],b:[220,38],c:0.6},
      {t:'rect',x:2,h:14,w:30,hh:6,c:0.3},
      {t:'rect',x:0,h:15,w:6,hh:4,c:[200,204,212]}
    ]},

  /* ---- Lexus LFA : supercar à moteur avant, grande prise d'air latérale ---- */
  lfa: {L:270, wr:20, wheels:[56,212], sill:10, belt:54, spokes:10, bodyBumpers:true,
    body:[[6,12],[0,22],[0,38],[4,50],[16,55],[40,58],[60,62],[78,68],[98,73],[120,74],[140,72],[160,64],[178,54],[200,50],[226,46],[248,40],[262,33],[268,24],[264,14],[256,12]],
    glass:[[72,56],[90,67],[108,71],[124,70],[142,63],[158,55]],
    pillars:[], doors:[74,166], handle:[82,50], mirror:150,
    hl:[[232,45],[256,40],[262,34],[238,38]],
    tl:[[1,40],[14,42],[14,46],[2,46]],
    extra:[
      {t:'poly',pts:[[60,22],[82,24],[82,44],[64,40]],c:[12,12,16]},
      {t:'line',a:[62,30],b:[80,31],c:[60,62,70]},{t:'line',a:[62,36],b:[80,37],c:[60,62,70]},
      {t:'poly',wing:1,pts:[[8,57],[38,58],[38,60],[8,60]],c:[28,28,34]},
      {t:'poly',pts:[[236,12],[266,14],[266,22],[240,22]],c:[12,12,16]},
      {t:'rect',x:0,h:14,w:30,hh:5,c:[18,18,22]},
      {t:'rect',x:8,h:15,w:3,hh:3,c:[200,204,212]},{t:'rect',x:13,h:15,w:3,hh:3,c:[200,204,212]},{t:'rect',x:18,h:15,w:3,hh:3,c:[200,204,212]},
      {t:'line',a:[84,30],b:[210,34],c:0.6}
    ]},
  /* ---- Ford Focus Mk1 : « New Edge », phares et feux triangulaires ---- */
  focus: {L:250, wr:18, wheels:[40,196], sill:12, belt:58, spokes:5, bodyBumpers:true,
    body:[[3,12],[0,22],[1,40],[2,58],[5,72],[10,82],[20,87],[40,89],[116,89],[132,87],[150,80],[172,66],[194,57],[218,52],[236,47],[246,40],[249,28],[247,16],[240,12]],
    glass:[[18,60],[19,72],[24,80],[36,85],[116,85],[130,83],[146,77],[166,66],[182,60]],
    pillars:[[60,66],[108,114]], doors:[62,110,184], handle:[116,55], mirror:172,
    hl:[[206,55],[238,49],[244,43],[214,44]],
    tl:[[1,48],[8,48],[14,74],[4,72]],
    extra:[
      {t:'poly',pts:[[228,20],[248,22],[248,30],[230,30]],c:[14,14,18]},
      {t:'line',a:[50,36],b:[192,38],c:0.6},
      {t:'rect',x:0,h:15,w:5,hh:3,c:[200,204,212]}
    ]},

  /* ---- Nissan Terrano II : 4x4 haut perché, roue de secours sur le hayon ---- */
  terrano: {L:246, wr:22, wheels:[48,192], sill:24, belt:62, spokes:6, bodyBumpers:true,
    body:[[8,24],[4,30],[4,52],[6,66],[8,84],[14,92],[28,95],[132,95],[148,92],[160,80],[170,68],[180,64],[226,62],[240,58],[246,48],[246,32],[242,24]],
    glass:[[20,64],[22,84],[30,90],[130,90],[146,86],[156,76],[164,66]],
    pillars:[[58,64],[100,106]], doors:[100,168], handle:[106,58], mirror:160,
    hl:[[222,60],[240,57],[244,50],[224,52]],
    tl:[[5,40],[10,40],[10,62],[5,62]],
    extra:[
      {t:'rect',x:30,h:96,w:100,hh:2,c:[30,30,34]},
      {t:'rect',x:8,h:24,w:236,hh:9,c:[44,46,50]},
      {t:'disc',x:5,h:60,r:14,c:[18,18,22]},{t:'disc',x:5,h:60,r:8,c:[120,126,138]},{t:'disc',x:5,h:60,r:3,c:[40,42,48]},
      {t:'poly',pts:[[228,26],[246,28],[246,40],[230,38]],c:[20,20,24]},
      {t:'line',a:[60,48],b:[186,50],c:0.6}
    ]},

  /* ---- Mazda RX-7 FD : courbes rondes, nez plongeant, grand aileron arceau ---- */
  rx7: {L:257, wr:19, wheels:[52,197], sill:10, belt:54, spokes:5, bodyBumpers:true,
    body:[[5,10],[0,20],[0,34],[3,46],[10,54],[30,58],[54,62],[70,68],[88,73],[108,74],[128,73],[142,68],[162,56],[180,50],[206,46],[230,40],[248,32],[256,24],[254,14],[246,10]],
    glass:[[66,56],[82,66],[100,71],[126,70],[140,65],[156,55]],
    pillars:[[110,113]], doors:[74,162], handle:[82,50], mirror:150,
    hl:[[236,32],[250,29],[252,25],[238,27]],
    tl:[[1,40],[12,42],[12,48],[1,47]],
    extra:[
      {t:'line',a:[226,41],b:[250,33],c:[20,20,24]},
      {t:'rect',wing:1,x:12,h:56,w:3,hh:11,c:1.0},{t:'rect',wing:1,x:38,h:60,w:3,hh:7,c:1.0},
      {t:'poly',wing:1,pts:[[4,66],[46,66],[46,69],[4,69]],c:1.05},{t:'line',wing:1,a:[4,69],b:[46,69],c:[236,238,244]},
      {t:'poly',pts:[[230,12],[254,14],[255,22],[232,21]],c:[12,12,16]},
      {t:'poly',pts:[[166,32],[174,33],[174,40],[166,39]],c:[12,12,16]},
      {t:'line',a:[60,32],b:[194,34],c:0.6},
      {t:'rect',x:0,h:14,w:6,hh:3,c:[200,204,212]}
    ]},

  /* ---- Ford Mustang GT 2025 : capot long, fastback, feux à trois barres ---- */
  mustang: {L:289, wr:21, wheels:[62,228], sill:12, belt:60, spokes:5, bodyBumpers:true,
    body:[[6,12],[0,24],[0,44],[4,56],[14,60],[40,62],[60,66],[78,74],[98,80],[124,82],[146,80],[164,72],[186,62],[214,58],[252,55],[274,50],[286,42],[288,30],[285,16],[276,12]],
    glass:[[80,62],[96,72],[112,77],[140,77],[156,72],[176,62]],
    pillars:[[128,132]], doors:[100,186], handle:[108,56], mirror:176,
    hl:[[252,54],[276,50],[282,44],[256,46]],
    tl:[[1,50],[10,52],[10,60],[1,59]],
    extra:[
      {t:'rect',x:1,h:51,w:8,hh:1,c:[255,120,110]},{t:'rect',x:1,h:54,w:8,hh:1,c:[255,120,110]},{t:'rect',x:1,h:57,w:8,hh:1,c:[255,120,110]},
      {t:'poly',wing:1,pts:[[8,61],[30,62],[30,64],[8,63]],c:0.9},
      {t:'rect',x:222,h:57,w:14,hh:2,c:[12,12,16]},
      {t:'poly',pts:[[262,16],[288,18],[288,40],[266,38]],c:[12,12,16]},
      {t:'line',a:[70,34],b:[224,36],c:0.6},
      {t:'rect',x:0,h:15,w:6,hh:4,c:[200,204,212]},{t:'rect',x:8,h:15,w:6,hh:4,c:[200,204,212]}
    ]},

  /* ---- Lexus RC F : calandre en sablier, feux en L, quadruple échappement ---- */
  rcf: {L:282, wr:20, wheels:[58,222], sill:12, belt:60, spokes:10, bodyBumpers:true,
    body:[[6,12],[0,22],[0,42],[3,56],[10,62],[36,64],[56,66],[74,74],[94,80],[118,82],[140,80],[160,72],[182,62],[212,58],[246,55],[266,50],[278,42],[281,30],[278,16],[270,12]],
    glass:[[76,64],[90,74],[108,79],[136,79],[152,74],[172,64]],
    pillars:[[124,128]], doors:[96,182], handle:[104,57], mirror:172,
    hl:[[248,54],[270,50],[276,44],[252,47]],
    tl:[[1,48],[14,50],[14,58],[1,57]],
    extra:[
      {t:'poly',pts:[[258,14],[281,16],[281,40],[262,36]],c:[10,10,14]},
      {t:'line',a:[254,45],b:[264,39],c:[230,240,255]},
      {t:'line',a:[184,61],b:[246,57],c:1.6},
      {t:'poly',pts:[[200,34],[210,36],[210,46],[202,44]],c:[12,12,16]},
      {t:'poly',wing:1,pts:[[8,63],[28,64],[28,66],[8,65]],c:[26,26,32]},
      {t:'line',a:[64,34],b:[218,36],c:0.6},
      {t:'rect',x:0,h:15,w:6,hh:4,c:[200,204,212]},{t:'rect',x:8,h:15,w:6,hh:4,c:[200,204,212]}
    ]},

  /* ---- McLaren 720S : moteur central, verrière en goutte, énorme prise d'air de porte ---- */
  mc720: {L:272, wr:20, wheels:[58,214], sill:9, belt:50, spokes:10, bodyBumpers:true,
    body:[[6,10],[0,20],[0,34],[3,44],[12,50],[40,54],[70,60],[92,68],[114,72],[134,72],[150,68],[168,58],[186,48],[210,42],[236,36],[256,30],[268,24],[271,16],[266,10]],
    glass:[[90,52],[104,64],[118,69],[134,69],[148,62],[160,52]],
    pillars:[], doors:[100,172], handle:[110,48], mirror:156, noHandle:true,
    hl:[[238,36],[258,30],[262,26],[242,30]],
    tl:[[1,42],[14,44],[14,46],[1,45]],
    extra:[
      {t:'poly',pts:[[64,22],[102,24],[102,48],[76,44]],c:[12,12,16]},
      {t:'line',a:[68,30],b:[100,31],c:[50,52,60]},{t:'line',a:[70,38],b:[100,39],c:[50,52,60]},
      {t:'poly',pts:[[236,38],[262,30],[264,24],[240,30]],c:[16,16,20]},
      {t:'poly',wing:1,pts:[[6,53],[42,54],[42,56],[6,55]],c:[26,26,32]},
      {t:'rect',x:236,h:10,w:34,hh:3,c:[20,20,26]},
      {t:'rect',x:2,h:12,w:30,hh:6,c:[18,18,22]},
      {t:'rect',x:14,h:22,w:6,hh:4,c:[200,204,212]}
    ]},

  /* ---- Ferrari 250 Testa Rossa (1958) : ailes « ponton », cockpit ouvert ---- */
  tr250: {L:252, wr:18, wheels:[42,180], sill:14, belt:54, spokes:12, bodyBumpers:true, open:true, noHandle:true, noMirror:true, noSkirt:true,
    body:[[4,14],[0,22],[0,36],[4,46],[16,52],[40,54],[62,56],[76,62],[86,60],[96,55],[150,55],[164,58],[190,58],[214,54],[234,46],[248,36],[251,26],[248,18],[240,14]],
    glass:[[116,55],[124,65],[138,65],[132,55]],
    pillars:[], doors:[98,140], handle:[0,0], mirror:0,
    hl:[[232,44],[246,40],[248,36],[234,38]], hlRound:[240,41,5],
    tl:[[1,38],[6,38],[6,42],[1,42]],
    extra:[
      {t:'poly',pts:[[150,14],[178,14],[172,40],[152,46]],c:[16,14,16]},
      {t:'disc',x:108,h:56,r:5,c:[226,196,150]},{t:'rect',x:104,h:50,w:9,hh:6,c:[220,220,226]},
      {t:'rect',x:100,h:16,w:50,hh:3,c:[200,204,212]},
      {t:'disc',x:120,h:36,r:9,c:[240,240,236]},{t:'rect',x:118,h:32,w:4,hh:8,c:[20,20,24]},
      {t:'line',a:[196,52],b:[226,48],c:0.6}
    ]},

  /* ---- Formule 1 : monoplace, roues découvertes, ailerons, halo ---- */
  f1: {L:336, wr:22, wheels:[62,276], sill:14, belt:52, spokes:6, bodyBumpers:true, open:true, noArch:true, noHandle:true, noMirror:true, noSkirt:true, noLights:true, noDoors:true,
    body:[[24,18],[26,40],[60,48],[110,56],[140,64],[156,66],[166,60],[178,50],[204,42],[244,36],[290,32],[318,28],[332,24],[333,20],[300,20],[256,22],[214,18],[200,14],[150,12],[90,12],[60,14],[40,16]],
    glass:[[168,57],[178,60],[184,55],[172,53]],
    pillars:[], doors:[], handle:[0,0], mirror:0,
    hl:[[2,28],[6,28],[6,32],[2,32]],
    tl:[[2,28],[6,28],[6,32],[2,32]],
    extra:[
      {t:'poly',pts:[[0,30],[24,30],[26,60],[0,60]],c:[20,20,26]},
      {t:'poly',pts:[[0,55],[30,55],[30,60],[0,60]],c:1.0},{t:'rect',x:0,h:47,w:28,hh:3,c:1.0},
      {t:'poly',pts:[[296,4],[336,4],[336,12],[300,12]],c:[20,20,26]},{t:'rect',x:300,h:10,w:36,hh:2,c:1.0},
      {t:'line',a:[160,64],b:[188,58],c:[18,18,22]},{t:'line',a:[160,63],b:[188,57],c:[18,18,22]},
      {t:'disc',x:173,h:60,r:5,c:[250,214,40]},
      {t:'disc',x:150,h:62,r:3,c:[10,10,14]},
      {t:'poly',pts:[[186,26],[198,26],[198,38],[188,38]],c:[10,10,14]},
      {t:'rect',x:70,h:12,w:140,hh:3,c:[24,24,30]},
      {t:'line',a:[214,20],b:[300,22],c:0.5},
      {t:'rect',x:1,h:31,w:4,hh:3,c:[255,40,40]}
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
function getBody(style, color, look) {
  const lk = lookOf({look});
  const key = style + color + [lk.finish, lk.kit, lk.spoiler, lk.decal, lk.decalColor, lk.tint, lk.wheelSize, lk.hood, lk.roof, lk.lights, lk.banner, lk.exhaustTip].join('|');
  if (_bodyCache[key]) return _bodyCache[key];
  const p = PROFILES[style], b = new Buf(p.L, p.H), C = hexRgb(color);
  const WS = lk.wheelSize || 0;
  const L = p.L, belt = p.beltY, bot = p.bottom;
  const topY = Math.min(...p.body.map(q => q[1]));
  const col = c => typeof c === 'number' ? tone(C, c) : c;

  // 1) carrosserie : dégradé tramé en palette limitée
  // facteur d'éclairage de la carrosserie (réutilisé pour les vinyles), selon la finition
  const bodyF = (x, y) => {
    const n = bay(x, y);
    let f;
    if (y < belt) { const u = (y - topY) / Math.max(1, belt - topY); f = Math.round((1.08 + 0.38 * (1 - u) + n * 0.12) / 0.08) * 0.08; }
    else {
      const u = (y - belt) / (bot - belt) + n * 0.09;
      f = u < 0.05 ? 1.85 : u < 0.13 ? 1.42 : u < 0.28 ? 1.2 : u < 0.42 ? 1.04 : u < 0.5 ? 0.86 : u < 0.56 ? 0.74 : u < 0.72 ? 0.92 : u < 0.86 ? 0.78 : 0.56;
    }
    if (lk.finish === 'matte') f = 1 + (f - 1) * 0.38;
    if (lk.finish === 'metal' && ((x * 73 + y * 151) % 19 === 0)) f += 0.4;
    return f;
  };
  const paint = (base, x, y) => {
    const f = bodyF(x, y), c = tone(base, f);
    if (lk.finish === 'pearl' && f > 1.1) { const k = Math.min(0.5, (f - 1.1) * 0.8); return [c[0] + (205 - c[0]) * k, c[1] + (225 - c[1]) * k, c[2] + (255 - c[2]) * k]; }
    return c;
  };
  b.poly(p.body, (x, y) => paint(C, x, y), true);
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
  // vinyles / motifs (sur le flanc, sous la ligne de vitre)
  if (lk.decal !== 'none') {
    const D = hexRgb(lk.decalColor), hb = bot - belt, lum = D[0] * 0.3 + D[1] * 0.59 + D[2] * 0.11;
    const digit = DIGITS[(style.length * 3 + C[0]) % 10];
    const dcx = Math.round((p.doors[0] + p.doors[1]) / 2), dcy = Math.round(belt + hb * 0.45), dr = Math.round(hb * 0.3);
    const hit = (x, y) => {
      const v = (y - belt) / hb;
      switch (lk.decal) {
        case 'side': { const th = x > L * 0.72 ? 0.16 * (1 - (x - L * 0.72) / (L * 0.3)) : 0.16; return x > 8 && x < L - 8 && Math.abs(v - 0.5) < th / 2 ? 1 : 0; }
        case 'stripes': return x > 6 && x < L - 6 && ((v > 0.26 && v < 0.31) || (v > 0.36 && v < 0.41)) ? 1 : 0;
        case 'checker': return x > L * 0.08 && x < L * 0.92 && v > 0.55 && v < 0.82 && ((Math.floor(x / 5) + Math.floor(y / 5)) & 1) ? 1 : 0;
        case 'flames': {
          if (x < L * 0.3) return 0;
          const u = (x - L * 0.3) / (L * 0.7), amp = hb * 0.36 * Math.pow(u, 0.7), dy = Math.abs(y - (belt + hb * 0.55));
          const edge = amp * (0.55 + 0.45 * Math.sin(x * 0.32 + y * 0.18));
          return dy < edge ? (dy < edge * 0.45 && u > 0.35 ? 2 : 1) : 0;
        }
        case 'tribal': { const yc = belt + hb * (0.45 + 0.22 * Math.sin(x * 0.045)), th = 1.2 + 3.2 * Math.abs(Math.sin(x * 0.09)); return x > 10 && x < L - 10 && Math.abs(y - yc) < th ? 1 : 0; }
        case 'number': {
          const d2 = (x - dcx) * (x - dcx) + (y - dcy) * (y - dcy);
          if (d2 > dr * dr) return 0;
          const gx = Math.floor((x - dcx + 3) / 2), gy = Math.floor((y - dcy + 5) / 2);
          return gx >= 0 && gx < 3 && gy >= 0 && gy < 5 && digit[gy][gx] === '1' ? 2 : 1;
        }
      }
      return 0;
    };
    for (let y = belt + 1; y < bot - 3; y++) for (let x = 0; x < L; x++) {
      if (!b.sil[y * L + x]) continue;
      const h = hit(x, y); if (!h) continue;
      const base = h === 2 ? (lk.decal === 'flames' ? [255, 206, 60] : lum > 128 ? [16, 16, 20] : [244, 244, 248]) : D;
      b.px(x, y, paint(base, x, y));
    }
  }
  // capot et toit (carbone, ouïes, écope)
  const gxs = p.glass.map(q => q[0]), gx0 = Math.min(...gxs), gx1 = Math.max(...gxs);
  const topAtB = x => { for (let y = 0; y < p.H; y++) if (inPoly(p.body, x + .5, y + .5)) return y; return bot; };
  const carbon = (x, y) => ((x >> 1) + (y >> 1)) & 1 ? [36, 38, 46] : [20, 21, 26];
  if (!p.open && (lk.hood === 'carbon' || lk.hood === 'carbonvent')) {
    for (let x = gx1 + 3; x < L - 10; x++) { const ty = topAtB(x); for (let y = ty; y < ty + 5 && y < bot - 8; y++) if (b.sil[y * L + x]) b.px(x, y, y === ty ? [92, 96, 108] : carbon(x, y)); }
  }
  if (!p.open && (lk.hood === 'vent' || lk.hood === 'carbonvent')) {
    for (let k = 0; k < 3; k++) { const vx = gx1 + 14 + k * 11; if (vx > L - 20) break; const ty = topAtB(vx + 3); b.rect(vx, ty + 1, 7, 2, [8, 8, 12]); b.rect(vx, ty + 3, 7, 1, tone(C, 1.4)); }
  }
  if (!p.open && lk.roof === 'carbon') {
    for (let x = gx0 + 3; x < gx1 - 3; x++) { const ty = topAtB(x); for (let y = ty; y < ty + 3; y++) if (b.sil[y * L + x]) b.px(x, y, y === ty ? [92, 96, 108] : carbon(x, y)); }
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
    const n = bay(x, y) * 8, tf = [1, 0.6, 0.34][lk.tint || 0]; b.px(x, y, [c[0] * tf + n, c[1] * tf + n, c[2] * tf + n], true);
  }
  // bandeau de pare-soleil
  if (lk.banner !== 'none' && !p.open) {
    const BC = {black: [14, 14, 18], white: [236, 238, 244], red: [200, 28, 36], blue: [30, 90, 220]}[lk.banner];
    for (let x = 0; x < L; x++) { let first = -1; for (let y = gTop; y <= gBot; y++) if (gm(x, y)) { first = y; break; }
      if (first < 0) continue; for (let y = first + 1; y <= first + 3; y++) if (gm(x, y) && gm(x, y + 1)) b.px(x, y, BC); }
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
  if (!p.noHandle) { b.rect(p.handle[0], p.handle[1], 10, 2, [210, 214, 222]); b.rect(p.handle[0], p.handle[1] + 2, 10, 1, tone(C, 0.5)); }
  const sk0 = p.wheels[0] + p.wr + 8, sk1 = p.wheels[1] - p.wr - 8;
  if (!p.noSkirt) { b.rect(sk0, bot - 5, sk1 - sk0, 5, (x, y) => tone(C, 0.32 + bay(x, y) * 0.05), true); b.rect(sk0, bot - 6, sk1 - sk0, 1, tone(C, 0.8)); }
  if (!p.bodyBumpers) {
    b.rect(L - 28, bot - 12, 27, 12, (x, y) => tone(C, 0.34 + bay(x, y) * 0.05), true);
    b.rect(1, bot - 12, 25, 12, (x, y) => tone(C, 0.34 + bay(x, y) * 0.05), true);
    for (let i = 0; i < 9; i++) b.rect(L - 25 + i * 3, bot - 8, 1, 4, [6, 6, 10]);
  }
  // rétroviseur
  const mx = p.mirror, my = belt - 4;
  if (!p.noMirror) b.poly([[mx, my], [mx + 12, my], [mx + 14, my + 4], [mx + 10, my + 9], [mx + 1, my + 9]], (x, y) => tone(C, 0.8 + bay(x, y) * 0.1 + (my + 4 - y) * 0.02), true);
  if (!p.noMirror) { b.rect(mx + 2, my + 1, 8, 1, tone(C, 1.8)); b.rect(mx + 12, my + 2, 2, 2, [20, 20, 26]); }

  // 5) feux
  const HLC = lk.lights === 'xenon' ? [214, 232, 255] : [226, 228, 214];
  if (p.noLights) { /* monoplace : pas de phares */ }
  else if (p.hlRound) {
    const [cx, cy, r] = p.hlRound;
    b.poly(p.hl, [24, 24, 30], true);
    b.disc(cx, cy, r + 2, [18, 18, 24], true); b.disc(cx, cy, r, (x, y) => ((x - cx) + (y - cy) < -2 ? [252, 252, 244] : [226, 224, 186]), true);
    b.disc(cx, cy, r * 0.45, [255, 214, 90]); b.px(cx - 3, cy - 3, [255, 255, 255]);
  } else {
    b.poly(p.hl, (x, y) => (x + y) % 6 === 0 ? [255, 255, 255] : HLC, true);
    for (let i = 0; i < p.hl.length; i++) { const q = p.hl[i], n = p.hl[(i + 1) % p.hl.length]; b.line(q[0], q[1], n[0], n[1], [28, 28, 34]); }
    let cx = 0, cy = 0; for (const q of p.hl) { cx += q[0]; cy += q[1]; } cx = Math.round(cx / p.hl.length); cy = Math.round(cy / p.hl.length);
    b.disc(cx, cy, 5, [60, 64, 76]); b.disc(cx, cy, 3, lk.lights === 'xenon' ? [200, 225, 255] : [255, 232, 140]); b.px(cx - 1, cy - 1, [255, 255, 255]);
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
  // options de phares : fumés, angel eyes
  if (!p.noLights && lk.lights === 'smoke') {
    for (const poly of [p.hl, p.tl].filter(Boolean)) b.poly(poly, (x, y) => { const i = (y * L + x) * 4; return [b.d[i] * 0.45, b.d[i + 1] * 0.45, b.d[i + 2] * 0.5]; });
  }
  if (!p.noLights && lk.lights === 'angel') {
    let cx = 0, cy = 0; for (const q of p.hl) { cx += q[0]; cy += q[1]; } cx = cx / p.hl.length; cy = cy / p.hl.length;
    for (let a = 0; a < 360; a += 15) { const t = a * Math.PI / 180; b.px(Math.round(cx + Math.cos(t) * 4.5), Math.round(cy + Math.sin(t) * 3), [140, 236, 255]); }
  }

  // 6) accessoires propres à chaque voiture
  for (const e of p.extra) {
    if (e.wing && lk.spoiler) continue;                       // aileron d'origine remplacé
    if (e.t === 'poly') b.poly(e.pts, col(e.c), true);
    else if (e.t === 'rect') b.rect(e.x, e.y - e.hh + 1, e.w, e.hh, typeof e.c === 'number' ? ((x, y) => tone(C, e.c + bay(x, y) * 0.05)) : e.c, true);
    else if (e.t === 'disc') b.disc(e.x, e.y, e.r, col(e.c), true);
    else if (e.t === 'line' && typeof e.c !== 'number') b.line(e.a[0], e.a[1], e.b[0], e.b[1], e.c, true);
  }

  // 6b) aileron
  if (lk.spoiler && SPOILER_MOUNT[style] && !p.open) {
    const [x0, x1, mode] = SPOILER_MOUNT[style], carb = (x, y) => [24 + bay(x, y) * 10, 25 + bay(x, y) * 10, 30 + bay(x, y) * 10];
    const topAt = x => { for (let y = 0; y < p.H; y++) if (inPoly(p.body, x + .5, y + .5)) return y; return bot; };
    const roof = mode === 'roof';
    if (lk.spoiler === 1) {
      const ty = topAt(x0 + 2);
      b.poly([[x0 - 2, ty - (roof ? 3 : 4)], [x0 + 16, ty - 1], [x0 + 16, ty + 2], [x0, ty + 2]], (x, y) => paint(C, x, y), true);
    } else {
      const big = lk.spoiler === 3, deck = Math.min(topAt(x0 + 6), topAt(x1 - 6));
      const py = Math.max(2, deck - (roof ? (big ? 8 : 5) : (big ? 18 : 11))), px0 = x0 - (big ? 4 : 2), px1 = x1 + (big ? 6 : 2);
      for (const sx of [x0 + 6, x1 - 8]) { b.rect(sx, py + 2, 2, topAt(sx) - py - 1, carb, true); if (big) b.rect(sx - 2, py - 1, 5, 1, carb, true); }
      b.rect(px0, py, px1 - px0, 3, carb, true); b.rect(px0, py, px1 - px0, 1, [120, 124, 136], true);
      const eh = big ? 10 : 7; b.rect(px0, py - 2, 2, eh, carb, true); b.rect(px1 - 2, py - 2, 2, eh, carb, true);
    }
  }
  // 6c) sorties d'échappement
  const chrome = (x, y) => (y & 1) ? [228, 232, 240] : [176, 182, 194];
  if (lk.exhaustTip === 'twin') { b.rect(0, bot - 6, 10, 5, chrome, true); b.rect(0, bot - 5, 3, 3, [10, 10, 12]); }
  else if (lk.exhaustTip === 'quad') { b.rect(0, bot - 5, 9, 4, chrome, true); b.rect(0, bot - 10, 9, 4, chrome, true); b.rect(0, bot - 4, 2, 2, [10, 10, 12]); b.rect(0, bot - 9, 2, 2, [10, 10, 12]); }
  else if (lk.exhaustTip === 'center') { b.rect(0, bot - 8, 12, 7, chrome, true); b.rect(0, bot - 7, 4, 5, [10, 10, 12]); }
  else if (lk.exhaustTip === 'side') { const sx = p.wheels[0] + p.wr + 8; b.rect(sx, bot - 1, 12, 4, chrome, true); b.rect(sx, bot, 3, 2, [10, 10, 12]); }
  // écope de toit
  if (!p.open && lk.roof === 'scoop') {
    const cx = Math.round((gx0 + gx1) / 2), ty = topAtB(cx);
    b.poly([[cx - 13, ty + 1], [cx - 8, ty - 5], [cx + 9, ty - 5], [cx + 12, ty + 1]], (x, y) => paint(C, x, y - 10), true);
    b.rect(cx + 7, ty - 4, 4, 4, [8, 8, 12], true);
  }
  // 7) passages de roues
  if (!p.noArch) for (const wx of p.wheels) {
    const cy = GY - p.wr - WS;
    b.disc(wx, cy, p.wr + WS + 5, tone(C, 0.28), true, bot);
    b.disc(wx, cy, p.wr + WS + 3.8, [8, 8, 12], true, bot);
  }
  // 7b) kit carrosserie
  if (lk.kit && !p.open) {
    const carb = (x, y) => [22 + bay(x, y) * 10, 23 + bay(x, y) * 10, 28 + bay(x, y) * 10];
    const sk0 = p.wheels[0] + p.wr + WS + 6, sk1 = p.wheels[1] - p.wr - WS - 6;
    b.rect(sk0 - 2, bot + 1, sk1 - sk0 + 4, lk.kit >= 2 ? 3 : 2, lk.kit >= 2 ? carb : (x, y) => paint(C, x, y + 40), true);
    b.rect(L - 30, bot + 1, 28, 2, carb, true);
    if (lk.kit >= 2) {
      b.rect(L - 36, bot + 3, 36, 1, carb, true);
      b.poly([[L - 12, bot - 13], [L - 3, bot - 15], [L - 4, bot - 12]], carb, true);
      b.poly([[L - 12, bot - 8], [L - 2, bot - 10], [L - 3, bot - 7]], carb, true);
      for (let fx = 3; fx < 26; fx += 5) b.rect(fx, bot - 1, 2, 4, carb, true);
      b.rect(1, bot + 1, 26, 1, carb, true);
    }
    if (lk.kit === 3) {
      for (const wx of p.wheels) {
        const cy = GY - p.wr - WS, R0 = p.wr + WS + 5, R1 = R0 + 4;
        for (let y = cy - R1; y <= Math.min(bot, cy); y++) for (let x = wx - R1; x <= wx + R1; x++) {
          const d = Math.hypot(x + .5 - wx, y + .5 - cy);
          if (d > R0 && d <= R1) b.px(x, y, d > R1 - 1 ? tone(C, 0.35) : paint(C, x, y - 6), true);
        }
        for (let a = 15; a <= 165; a += 25) { const t = a * Math.PI / 180; b.px(Math.round(wx - Math.cos(t) * (R0 + 2)), Math.round(cy - Math.sin(t) * (R0 + 2)), [210, 214, 224]); }
      }
    }
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

/* roue détaillée : bande de roulement, flanc, lèvre, jante (plusieurs modèles), disque + étrier rouge */
function drawWheel(ctx, cx, cy, r, s, ang, fast, nsp, style, color) {
  const half = (nsp || 6) / 2, st = style || 'stock', base = hexRgb(WHEEL_COLORS[color] || WHEEL_COLORS.silver);
  const rgb = c => `rgb(${c.map(Math.round).join(',')})`;
  const light = rgb(tone(base, color === 'chrome' ? 1.15 : 1.1)), dark = rgb(tone(base, 0.72)), hub = rgb(tone(base, 0.45));
  const lipIn = st === 'deep' ? 0.46 : 0.64;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const d = Math.sqrt((dx + .5) * (dx + .5) + (dy + .5) * (dy + .5));
    if (d > r) continue;
    const f = d / r;
    let c;
    if (f > 0.86) c = f > 0.95 ? '#08080a' : ((dx + dy) & 1 ? '#17171c' : '#101014');
    else if (f > 0.70) c = f > 0.78 ? '#2a2a32' : '#202026';
    else if (f > lipIn) c = st === 'deep' ? ((dx - dy) % 5 === 0 ? '#ffffff' : '#dfe4ee') : '#e8ecf4';
    else if (f > lipIn - 0.04) c = '#8a90a0';
    else {
      const a = Math.atan2(dy + .5, dx + .5) - ang;
      let on;
      if (fast) on = f < 0.55;
      else switch (st) {
        case 'star': on = Math.abs(Math.sin(a * 2.5)) < 0.2 + 0.32 * (1 - f); break;
        case 'te37': on = Math.abs(Math.sin(a * 3)) < 0.42; break;
        case 'mesh': on = Math.abs(Math.sin(a * 5)) < 0.2 || Math.abs(Math.sin(a * 5 + f * 3.2)) < 0.18; break;
        case 'deep': on = Math.abs(Math.sin(a * 2.5)) < 0.18 + 0.12 * f; break;
        case 'turbo': on = Math.sin(a * 9 + f * 6) > -0.25; break;
        default: on = Math.abs(Math.sin(a * half)) < 0.30 + 0.22 * f;
      }
      if (f < 0.10) c = light;
      else if (f < 0.19) c = fast ? dark : hub;
      else if (on) c = Math.sin(a * (st === 'turbo' ? 9 : half)) > 0 ? light : rgb(base);
      else {
        const ca = Math.atan2(dy + .5, dx + .5);
        c = (Math.abs(ca + 0.75) < 0.5 && f > 0.28 && f < 0.56) ? '#d82828' : '#34363f';
      }
    }
    ctx.fillStyle = c; ctx.fillRect(cx + dx * s, cy + dy * s, s, s);
  }
}

/* Dessine une voiture : x = arrière-gauche, y = sol, s = échelle (sprite) */
function drawCar(ctx, style, color, x, y, s, o) {
  o = o || {};
  const p = PROFILES[style], lk = lookOf({look: o.look}), body = getBody(style, color, lk);
  const lean = o.lean || 0, WS = lk.wheelSize || 0, r = p.wr + WS;
  const drop = Math.min(lk.height || 0, p.sill - 2 - (lk.kit >= 2 ? 4 : lk.kit ? 3 : 0));
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(x + p.L * s / 2, y + 1 * s, p.L * s * 0.55, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  if (lean) { ctx.translate(x + p.wheels[0] * s, y); ctx.rotate(-lean * 0.007); ctx.translate(-(x + p.wheels[0] * s), -y); }
  ctx.drawImage(body, x, y - (p.H - 1 - drop) * s, p.L * s, p.H * s);
  const fast = (o.speed || 0) > 45;
  for (const wx of p.wheels) {
    const wc = wheelSprite(p, o.wheelAng || 0, fast, lk);
    ctx.drawImage(wc, x + (wx - r) * s, y - (2 * r + 1) * s, wc.width * s, wc.height * s);
  }
  ctx.restore();
}

/* cache des roues : 48 angles pré-rendus par profil */
const _wheelCache = {};
function wheelSprite(p, ang, fast, lk) {
  lk = lk || LOOK_DEFAULT;
  const r = p.wr + (lk.wheelSize || 0);
  const n = 48, a = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), k = fast ? 0 : Math.round(a / (Math.PI * 2) * n) % n;
  const key = [r, p.spokes || 6, lk.wheel, lk.wheelColor, fast ? 'f' : k].join(':');
  if (_wheelCache[key]) return _wheelCache[key];
  const c = document.createElement('canvas'); c.width = c.height = 2 * r + 1;
  drawWheel(c.getContext('2d'), r, r, r, 1, k / n * Math.PI * 2, fast, p.spokes || 6, lk.wheel, lk.wheelColor);
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
  const HX = x + hx * s, HY = y - (p.H - 1 - hy) * s, HC = o.look && o.look.lights === 'xenon' ? '200,225,255' : '255,240,190';
  if (!p.noLights) {
  glow(HX, HY, 26 * s, HC, 0.55);
  const beam = ctx.createLinearGradient(HX, 0, HX + 220 * s, 0);
  beam.addColorStop(0, 'rgba(255,236,180,0.22)'); beam.addColorStop(1, 'rgba(255,236,180,0)');
  ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(HX, HY - 3 * s); ctx.lineTo(HX + 220 * s, y - 30 * s); ctx.lineTo(HX + 220 * s, y + 8 * s); ctx.lineTo(HX, HY + 4 * s); ctx.closePath(); ctx.fill();
  }
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

/* mini-police 3x5 pour les numéros de course */
const DIGITS = [['111','101','101','101','111'],['010','110','010','010','111'],['111','001','111','100','111'],['111','001','111','001','111'],['101','101','111','001','001'],
                ['111','100','111','001','111'],['111','100','111','101','111'],['111','001','010','010','010'],['111','101','111','101','111'],['111','101','111','001','111']];
