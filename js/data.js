/* ============ DONNÉES : moteurs, voitures, pièces, adversaires ============ */

const ENGINES = {
  d4f:   {name:'D4F 1.2 16v',     kind:'4 cyl. atmo',  hp:75,  hpRpm:5500, tqRpm:4000, red:6300, mass:95,  turbo:false, price:0},
  k4m:   {name:'K4M 1.6 16v',     kind:'4 cyl. atmo',  hp:115, hpRpm:6000, tqRpm:4300, red:6800, mass:105, turbo:false, price:1800},
  bp:    {name:'BP 1.8 DOHC',     kind:'4 cyl. atmo',  hp:140, hpRpm:6500, tqRpm:4500, red:7200, mass:115, turbo:false, price:2600},
  f4r:   {name:'F4R 2.0 RS',      kind:'4 cyl. atmo',  hp:197, hpRpm:7250, tqRpm:5500, red:7800, mass:125, turbo:false, price:4200},
  ea113: {name:'2.0 TFSI',        kind:'4 cyl. turbo', hp:230, hpRpm:5600, tqRpm:2800, red:6700, mass:140, turbo:true,  price:5500},
  k20a:  {name:'K20A VTEC',       kind:'4 cyl. atmo',  hp:215, hpRpm:8000, tqRpm:6100, red:8600, mass:120, turbo:false, price:6500},
  s54:   {name:'S54 3.2 6 cyl.',  kind:'6 cyl. atmo',  hp:343, hpRpm:7900, tqRpm:4900, red:8200, mass:190, turbo:false, price:10500},
  rb26:  {name:'RB26DETT',        kind:'6 cyl. biturbo',hp:300,hpRpm:6800, tqRpm:4400, red:8000, mass:215, turbo:true,  price:12500},
  jz:    {name:'2JZ-GTE',         kind:'6 cyl. turbo', hp:320, hpRpm:5600, tqRpm:4000, red:7000, mass:225, turbo:true,  price:13500},
  sr20:  {name:'SR20DET',         kind:'4 cyl. turbo', hp:250, hpRpm:6400, tqRpm:4800, red:7500, mass:150, turbo:true,  price:7000},
  g63:   {name:'4G63T',           kind:'4 cyl. turbo', hp:290, hpRpm:6500, tqRpm:3500, red:7500, mass:165, turbo:true,  price:9500},
  mezger:{name:'Mezger 3.6 flat-6',kind:'6 cyl. à plat atmo', hp:415, hpRpm:7600, tqRpm:5500, red:8400, mass:200, turbo:false, price:28000},
  vr38:  {name:'VR38DETT',        kind:'V6 biturbo',   hp:485, hpRpm:6400, tqRpm:3200, red:7100, mass:240, turbo:true,  price:45000},
  thp:   {name:'1.6 THP 200',     kind:'4 cyl. turbo', hp:200, hpRpm:5800, tqRpm:1800, red:6500, mass:135, turbo:true,  price:5000},
  lr1:   {name:'1LR-GUE V10',     kind:'V10 atmo',     hp:560, hpRpm:8700, tqRpm:6800, red:9000, mass:170, turbo:false, price:150000},
  zetec: {name:'Zetec 1.6 16v',   kind:'4 cyl. atmo',  hp:100, hpRpm:6000, tqRpm:4000, red:6800, mass:110, turbo:false, price:1200},
  td27:  {name:'TD27 2.7 turbo diesel', kind:'4 cyl. diesel', hp:125, hpRpm:3600, tqRpm:2200, red:4500, mass:240, turbo:true, price:1500},
  r13b:  {name:'13B-REW rotatif', kind:'birotor biturbo', hp:280, hpRpm:6500, tqRpm:5000, red:8000, mass:125, turbo:true, price:11000},
  coyote:{name:'Coyote 5.0 V8',   kind:'V8 atmo',      hp:486, hpRpm:7250, tqRpm:4900, red:7500, mass:200, turbo:false, price:18000},
  ur2:   {name:'2UR-GSE 5.0 V8',  kind:'V8 atmo',      hp:477, hpRpm:7100, tqRpm:4800, red:7300, mass:205, turbo:false, price:20000},
  m840t: {name:'M840T 4.0 V8 biturbo', kind:'V8 biturbo', hp:720, hpRpm:7500, tqRpm:5500, red:8500, mass:200, turbo:true, price:90000},
  colombo:{name:'Colombo 3.0 V12', kind:'V12 atmo',    hp:300, hpRpm:7200, tqRpm:5500, red:7600, mass:175, turbo:false, price:600000},
  f1v6:  {name:'V6 1.6 turbo hybride', kind:'V6 turbo hybride', hp:1000, hpRpm:11500, tqRpm:10500, red:12500, mass:145, turbo:true, price:3000000},
  ls3:   {name:'LS3 V8 6.2',      kind:'V8 atmo',      hp:430, hpRpm:5900, tqRpm:4600, red:6600, mass:200, turbo:false, price:16000}
};

// body = masse sans moteur ; frac = part du poids sur les roues motrices ; eff = rendement transmission
const CARS = {
  twingo: {name:'Renault Twingo 2',   year:2007, drive:'FWD', price:0,     engine:'d4f',
           body:860,  mu:0.95, frac:0.53, eff:0.90, r:0.29, cd:0.34, A:2.00, final:4.50,
           gears:[3.73,2.05,1.39,1.03,0.82], color:'#e8c020', style:'twingo', hint:'Citadine à tout faire'},
  clio:   {name:'Renault Clio RS',    year:2006, drive:'FWD', price:6500,  engine:'f4r',
           body:1115, mu:1.00, frac:0.53, eff:0.90, r:0.31, cd:0.33, A:2.05, final:4.50,
           gears:[3.73,2.20,1.52,1.18,0.97,0.82], color:'#f2f2f2', style:'clio', hint:'La reine des bacs à sable'},
  mx5:    {name:'Mazda MX-5 NB',      year:2001, drive:'RWD', price:11000, engine:'bp',
           body:900,  mu:1.00, frac:0.63, eff:0.91, r:0.29, cd:0.36, A:1.85, final:4.10,
           gears:[3.76,2.27,1.65,1.26,1.00,0.84], color:'#c42020', style:'mx5', hint:'Propulsion légère, base idéale'},
  m3:     {name:'BMW M3 E46',         year:2003, drive:'RWD', price:22000, engine:'s54',
           body:1380, mu:1.05, frac:0.63, eff:0.91, r:0.33, cd:0.32, A:2.10, final:3.62,
           gears:[4.23,2.53,1.67,1.23,1.00,0.83], color:'#3a78d0', style:'m3', hint:'Le 6 cylindres qui hurle'},
  supra:  {name:'Toyota Supra A80',   year:1996, drive:'RWD', price:35000, engine:'jz',
           body:1285, mu:1.05, frac:0.63, eff:0.91, r:0.33, cd:0.32, A:2.00, final:3.27,
           gears:[3.83,2.36,1.69,1.31,1.00,0.79], color:'#e8e8e8', style:'supra', hint:'Légende, 2JZ increvable'},
  skyline:{name:'Nissan Skyline R34', year:1999, drive:'AWD', price:50000, engine:'rb26',
           body:1345, mu:1.10, frac:0.92, eff:0.86, r:0.32, cd:0.34, A:2.00, final:4.11,
           gears:[3.83,2.36,1.69,1.31,1.00,0.79], color:'#4060b8', style:'skyline', hint:'Godzilla : 4 roues motrices'},
  civic:  {name:'Honda Civic Type R EP3', year:2002, drive:'FWD', price:12000, engine:'k20a',
           body:1080, mu:1.00, frac:0.53, eff:0.90, r:0.31, cd:0.34, A:2.00, final:4.76,
           gears:[3.27,2.13,1.52,1.15,0.92,0.74], color:'#f0f0f0', style:'civic', hint:'Le VTEC qui kicke à 5 800 tr/min'},
  rcz:    {name:'Peugeot RCZ',       year:2011, drive:'FWD', price:18000, engine:'thp',
           body:1185, mu:1.00, frac:0.53, eff:0.90, r:0.32, cd:0.32, A:2.00, final:4.10,
           gears:[3.42,1.95,1.36,1.05,0.84,0.69], color:'#b3121e', style:'rcz', hint:'Coupé double bulle et 1.6 turbo'},
  s15:    {name:'Nissan Silvia S15',  year:2000, drive:'RWD', price:25000, engine:'sr20',
           body:1100, mu:1.00, frac:0.63, eff:0.91, r:0.31, cd:0.29, A:1.90, final:4.08,
           gears:[3.32,1.90,1.31,1.00,0.82,0.70], color:'#d9dde3', style:'s15', hint:'La reine du drift'},
  evo:    {name:'Mitsubishi Lancer Evo IX', year:2006, drive:'AWD', price:45000, engine:'g63',
           body:1235, mu:1.10, frac:0.92, eff:0.86, r:0.32, cd:0.35, A:2.10, final:4.53,
           gears:[2.92,1.79,1.27,0.97,0.76], color:'#c8102e', style:'evo', hint:'Le rallye homologué pour la route'},
  gt3:    {name:'Porsche 911 GT3 (997)', year:2007, drive:'RWD', price:120000, engine:'mezger',
           body:1195, mu:1.25, frac:0.66, eff:0.91, r:0.33, cd:0.30, A:2.00, final:3.44,
           gears:[3.82,2.15,1.56,1.21,0.97,0.83], color:'#f4f4f4', style:'gt3', hint:'Moteur arrière, châssis de course'},
  r35:    {name:'Nissan GT-R R35',   year:2009, drive:'AWD', price:250000, engine:'vr38',
           body:1500, mu:1.15, frac:0.92, eff:0.87, r:0.34, cd:0.27, A:2.10, final:3.70,
           gears:[4.06,2.30,1.59,1.25,1.00,0.80], color:'#8d939e', style:'r35', hint:'Godzilla version moderne'},
  focus:  {name:'Ford Focus Mk1',    year:2001, drive:'FWD', price:3000, engine:'zetec',
           body:1060, mu:0.95, frac:0.53, eff:0.90, r:0.30, cd:0.32, A:2.05, final:4.06,
           gears:[3.58,1.93,1.28,0.95,0.76], color:'#1f4fa8', style:'focus', hint:'La compacte increvable de tonton'},
  terrano:{name:'Nissan Terrano II',  year:1999, drive:'AWD', price:5000, engine:'td27',
           body:1650, mu:0.90, frac:0.90, eff:0.82, r:0.37, cd:0.45, A:2.80, final:4.63,
           gears:[3.58,2.08,1.36,1.00,0.86], color:'#5b6b4a', style:'terrano', hint:'Le 4x4 qui ne craint rien (sauf le chrono)'},
  rx7:    {name:'Mazda RX-7 FD',      year:1997, drive:'RWD', price:40000, engine:'r13b',
           body:1155, mu:1.05, frac:0.63, eff:0.91, r:0.32, cd:0.29, A:1.80, final:4.10,
           gears:[3.48,2.02,1.39,1.00,0.72], color:'#c41818', style:'rx7', hint:'Le rotatif qui hurle à 8 000 tr/min'},
  mustang:{name:'Ford Mustang GT 2025', year:2025, drive:'RWD', price:60000, engine:'coyote',
           body:1590, mu:1.10, frac:0.60, eff:0.90, r:0.35, cd:0.36, A:2.30, final:3.73,
           gears:[4.24,2.54,1.66,1.24,1.00,0.68], color:'#1f6fd1', style:'mustang', hint:'Le V8 américain, version 2025'},
  rcf:    {name:'Lexus RC F',        year:2019, drive:'RWD', price:75000, engine:'ur2',
           body:1560, mu:1.12, frac:0.60, eff:0.90, r:0.34, cd:0.32, A:2.10, final:2.94,
           gears:[4.59,2.99,2.08,1.69,1.27,1.00,0.81,0.64], color:'#ff6a13', style:'rcf', hint:'V8 atmo et boîte 8 rapports'},
  mc720:  {name:'McLaren 720S',      year:2018, drive:'RWD', price:320000, engine:'m840t',
           body:1240, mu:1.35, frac:0.66, eff:0.91, r:0.35, cd:0.30, A:1.95, final:3.31,
           gears:[3.98,2.61,1.91,1.48,1.16,0.91,0.69], color:'#ff7a00', style:'mc720', hint:'Coque carbone et 720 ch'},
  tr250:  {name:'Ferrari 250 Testa Rossa', year:1958, drive:'RWD', price:5000000, engine:'colombo',
           body:650, mu:1.00, frac:0.58, eff:0.90, r:0.33, cd:0.38, A:1.60, final:4.00,
           gears:[2.40,1.73,1.31,1.00], color:'#c8141e', style:'tr250', hint:'Légende des 24 Heures du Mans 1958'},
  f1:     {name:'Formule 1',         year:2024, drive:'RWD', price:10000000, engine:'f1v6',
           body:653, mu:1.90, frac:0.62, eff:0.93, r:0.33, cd:0.90, A:1.40, final:4.50,
           gears:[3.10,2.40,1.95,1.65,1.42,1.25,1.12,1.00], color:'#e10600', style:'f1', hint:'1 000 ch, 798 kg : l\'arme absolue'},
  lfa:    {name:'Lexus LFA',         year:2011, drive:'RWD', price:1000000, engine:'lr1',
           body:1310, mu:1.32, frac:0.62, eff:0.91, r:0.34, cd:0.31, A:2.00, final:4.56,
           gears:[3.23,2.19,1.61,1.24,1.00,0.82], color:'#f2cc2e', style:'lfa', hint:'Le V10 qui hurle à 9 000 tr/min'}
};
const CAR_IDS = Object.keys(CARS).sort((a, b) => CARS[a].price - CARS[b].price);   // toujours par prix croissant
const ENGINE_IDS = Object.keys(ENGINES).sort((a, b) => ENGINES[a].price - ENGINES[b].price);

// Pièces de tuning : 11 catégories, 3 niveaux (nitro : 2)
const PARTS = [
  {id:'intake',  icon:'🌬️', name:'Admission',      desc:'Respire mieux : plus d\'air = plus de puissance.',
   tiers:[{n:'Filtre sport',p:350},{n:'Kit admission directe',p:800},{n:'Boîtier carbone + trompettes',p:1700}]},
  {id:'exhaust', icon:'🔊', name:'Échappement',    desc:'Évacue plus vite les gaz brûlés.',
   tiers:[{n:'Cat-back sport',p:450},{n:'Ligne inox + décat',p:1000},{n:'Collecteur 4-1 + ligne libre',p:2100}]},
  {id:'cam',     icon:'⚙️', name:'Arbres à cames', desc:'Déplace la puissance vers les hauts régimes (+250 tr/min de zone rouge par niveau).',
   tiers:[{n:'Cames Stage 1',p:700},{n:'Cames Stage 2',p:1500},{n:'Cames compétition',p:3000}]},
  {id:'ecu',     icon:'💻', name:'Reprogrammation',desc:'Cartographie optimisée. Débloque la cartographie ECU : niv. 1 allumage & richesse, niv. 2 pression turbo, rupteur & antipatinage, niv. 3 flat shift & anti-lag.',
   tiers:[{n:'Reprog Stage 1',p:500},{n:'Boîtier standalone',p:1300},{n:'Cartographie sur banc',p:2800}]},
  {id:'turbo',   icon:'🌀', name:'Turbo / Boost',  desc:'Suralimentation : gros gain à mi/haut régime (moins efficace sur les moteurs déjà turbo).',
   tiers:[{n:'Petit turbo / boost +',p:2200},{n:'Turbo moyen',p:5200},{n:'Gros turbo + intercooler',p:10500}]},
  {id:'weight',  icon:'🪶', name:'Allègement',     desc:'Moins de poids = meilleures accélérations.',
   tiers:[{n:'Banquette + insonorisant (-30 kg)',p:500},{n:'Baquets + capot alu (-70 kg)',p:1400},{n:'Arceau + lexan (-120 kg)',p:3000}]},
  {id:'tires',   icon:'🛞', name:'Pneus',          desc:'Plus d\'adhérence au départ.',
   tiers:[{n:'Pneus sport',p:400},{n:'Semi-slicks',p:1100},{n:'Slicks drag',p:2400}]},
  {id:'gearbox', icon:'🕹️', name:'Boîte courte',   desc:'Rapports plus courts : accélère plus fort, vitesse de pointe plus basse.',
   tiers:[{n:'Pont court',p:600},{n:'Rapports rapprochés',p:1500},{n:'Boîte à crabots',p:3200}]},
  {id:'clutch',  icon:'🦶', name:'Embrayage',      desc:'Meilleur départ et passages de vitesse plus rapides.',
   tiers:[{n:'Embrayage renforcé',p:450},{n:'Disque céramique',p:1200},{n:'Embrayage bi-disque',p:2600}]},
  {id:'aero',    icon:'🏁', name:'Aérodynamique',  desc:'Réduit la traînée pour les vitesses élevées.',
   tiers:[{n:'Becquet + lame',p:350},{n:'Kit carrosserie',p:900},{n:'Fond plat + diffuseur',p:2000}]},
  {id:'nitro',   icon:'💨', name:'Nitro (NOS)',    desc:'Boost de puissance 4 s, rechargé à chaque course. Touche N / bouton NITRO.',
   tiers:[{n:'Kit NOS 50 ch',p:1800},{n:'Kit NOS 100 ch',p:4200}]}
];

// Adversaires de drag : voiture + moteur + pièces
const OPPONENTS = [
  {name:'Kévin',   tag:'Le voisin',          car:'twingo', engine:'d4f',  parts:{},                                                         reward:150,  skill:0.80},
  {name:'Sophie',  tag:'Étudiante pressée',  car:'clio',   engine:'f4r',  parts:{},                                                         reward:260,  skill:0.82},
  {name:'Momo',    tag:'Mécano du coin',     car:'mx5',    engine:'bp',   parts:{intake:1,exhaust:1},                                       reward:420,  skill:0.85},
  {name:'Yanis',   tag:'Clio Cup repeinte',  car:'clio',   engine:'f4r',  parts:{ecu:2,tires:1,intake:1},                                   reward:700,  skill:0.86},
  {name:'Hugo',    tag:'Swap VTEC',          car:'mx5',    engine:'k20a', parts:{exhaust:1,tires:1},                                        reward:1000, skill:0.88},
  {name:'Zoé',     tag:'Fan de BMW',         car:'m3',     engine:'s54',  parts:{},                                                         reward:1600, skill:0.88},
  {name:'Dylan',   tag:'Twingo 2JZ (RIP pneus)',car:'twingo',engine:'jz', parts:{tires:2,clutch:1},                                         reward:2200, skill:0.88},
  {name:'Marco',   tag:'Supra d\'import',    car:'supra',  engine:'jz',   parts:{tires:1},                                                  reward:3000, skill:0.90},
  {name:'Jade',    tag:'M3 préparée',        car:'m3',     engine:'s54',  parts:{intake:2,exhaust:2,ecu:2,cam:2,tires:2,clutch:1},          reward:4200, skill:0.91},
  {name:'Takumi',  tag:'Touge legend',       car:'skyline',engine:'rb26', parts:{turbo:1,ecu:2,exhaust:2,tires:2,gearbox:1},                reward:6000, skill:0.93},
  {name:'Ryu',     tag:'Supra 1000 ch',      car:'supra',  engine:'jz',   parts:{turbo:3,ecu:3,intake:3,exhaust:3,cam:2,tires:3,clutch:2,nitro:1}, reward:8500, skill:0.95},
  {name:'Le Roi du Drag', tag:'Chef des Midnight Kings',  car:'skyline',engine:'rb26', parts:{turbo:3,ecu:3,intake:3,exhaust:3,cam:3,tires:3,clutch:3,gearbox:2,weight:3,aero:2,nitro:2}, reward:15000, skill:0.97},
  {name:'Valentina', tag:'Héritière pressée', car:'mc720', engine:'m840t', parts:{turbo:1,ecu:2,tires:2,clutch:2,intake:2}, reward:40000, skill:0.95},
  {name:'Le Comte',  tag:'Collectionneur', car:'lfa', engine:'lr1', parts:{intake:3,exhaust:3,ecu:3,cam:3,tires:3,clutch:3,weight:2,nitro:2}, reward:70000, skill:0.96},
  {name:'L\'Architecte', tag:'Fondateur du Cercle', car:'f1', engine:'f1v6', parts:{tires:2,clutch:3}, reward:250000, skill:0.97}
];

const PAINTS = ['#e8c020','#f2f2f2','#c42020','#3a78d0','#2a2a30','#30a050','#e87820','#9040c0','#e060a0','#20b8c8'];

/* ============ PERSONNALISATION VISUELLE ============ */
const LOOK_DEFAULT = {finish: 'gloss', kit: 0, spoiler: 0, wheel: 'stock', wheelColor: 'silver', wheelSize: 0,
                      decal: 'none', decalColor: '#111216', height: 0, tint: 0, neon: 'none',
                      hood: 'stock', roof: 'stock', lights: 'stock', banner: 'none', exhaustTip: 'stock'};
const WHEEL_COLORS = {silver: '#c5cad6', black: '#2a2c33', gold: '#d6ab45', bronze: '#a0703e', white: '#eceff5', red: '#c8303a', chrome: '#f2f5fb'};
const NEON_COLORS = {cyan: '62,224,255', pink: '255,61,180', green: '90,255,120', purple: '170,90,255', orange: '255,150,40', red: '255,50,60'};
const VISUAL = [
  {id: 'finish', name: 'Peinture', sub: 'Finition', opts: [
    {v: 'gloss', n: 'Brillante', p: 0}, {v: 'matte', n: 'Mate', p: 400}, {v: 'metal', n: 'Métallisée', p: 600}, {v: 'pearl', n: 'Nacrée', p: 900}]},
  {id: 'kit', name: 'Kit carrosserie', sub: 'Boucliers & bas de caisse', opts: [
    {v: 0, n: 'Origine', p: 0}, {v: 1, n: 'Street', d: 'Lame avant + bas de caisse', p: 900},
    {v: 2, n: 'Racing', d: 'Splitter, canards, diffuseur', p: 2200}, {v: 3, n: 'Widebody', d: 'Élargisseurs rivetés + kit Racing', p: 4500}]},
  {id: 'spoiler', name: 'Aileron', sub: 'Appui arrière', opts: [
    {v: 0, n: 'Origine', p: 0}, {v: 1, n: 'Becquet ducktail', p: 500}, {v: 2, n: 'Aileron GT', p: 1400}, {v: 3, n: 'Col de cygne', p: 2600}]},
  {id: 'wheel', name: 'Jantes', sub: 'Modèle', opts: [
    {v: 'stock', n: 'Origine', p: 0}, {v: 'star', n: 'Étoile 5 branches', p: 700}, {v: 'te37', n: 'Rayons forgés 6', p: 900},
    {v: 'mesh', n: 'Maille', p: 1100}, {v: 'deep', n: 'Deep dish', p: 1300}, {v: 'turbo', n: 'Turbofan', p: 1000}]},
  {id: 'wheelColor', name: 'Couleur jantes', sub: 'Teinte', opts: [
    {v: 'silver', n: 'Argent', p: 0}, {v: 'black', n: 'Noir', p: 300}, {v: 'white', n: 'Blanc', p: 300}, {v: 'gold', n: 'Or', p: 450},
    {v: 'bronze', n: 'Bronze', p: 450}, {v: 'red', n: 'Rouge', p: 350}, {v: 'chrome', n: 'Chrome', p: 600}]},
  {id: 'wheelSize', name: 'Taille jantes', sub: 'Diamètre', opts: [
    {v: 0, n: 'Origine', p: 0}, {v: 1, n: '+1 pouce', p: 500}, {v: 2, n: '+2 pouces', p: 1000}]},
  {id: 'decal', name: 'Motifs', sub: 'Vinyles', opts: [
    {v: 'none', n: 'Aucun', p: 0}, {v: 'side', n: 'Bande latérale', p: 400}, {v: 'stripes', n: 'Double liseré', p: 500},
    {v: 'number', n: 'Numéro de course', p: 500}, {v: 'checker', n: 'Damier', p: 700}, {v: 'flames', n: 'Flammes', p: 900}, {v: 'tribal', n: 'Tribal', p: 1100}]},
  {id: 'decalColor', name: 'Couleur motif', sub: 'Gratuit', colors: true, opts: [
    {v: '#111216', n: 'Noir', p: 0}, {v: '#f4f4f8', n: 'Blanc', p: 0}, {v: '#ff3d2e', n: 'Rouge', p: 0}, {v: '#ffb21c', n: 'Orange', p: 0},
    {v: '#ffe23d', n: 'Jaune', p: 0}, {v: '#2fe06a', n: 'Vert', p: 0}, {v: '#1fd1ff', n: 'Cyan', p: 0}, {v: '#3a5bff', n: 'Bleu', p: 0},
    {v: '#b14dff', n: 'Violet', p: 0}, {v: '#ff4dc4', n: 'Rose', p: 0}, {v: '#9aa0ad', n: 'Gris', p: 0}]},
  {id: 'hood', name: 'Capot', sub: 'Matière & ouïes', opts: [
    {v: 'stock', n: 'Origine', p: 0}, {v: 'vent', n: 'Ouïes d\'extraction', p: 600}, {v: 'carbon', n: 'Carbone', p: 800}, {v: 'carbonvent', n: 'Carbone ventilé', p: 1400}]},
  {id: 'roof', name: 'Toit', sub: 'Pavillon', opts: [
    {v: 'stock', n: 'Origine', p: 0}, {v: 'carbon', n: 'Carbone', p: 700}, {v: 'scoop', n: 'Écope de toit', p: 500}]},
  {id: 'lights', name: 'Phares', sub: 'Optiques', opts: [
    {v: 'stock', n: 'Origine', p: 0}, {v: 'xenon', n: 'Xénon bleuté', p: 300}, {v: 'smoke', n: 'Fumés', p: 250}, {v: 'angel', n: 'Angel eyes', p: 450}]},
  {id: 'banner', name: 'Bandeau', sub: 'Pare-soleil', opts: [
    {v: 'none', n: 'Aucun', p: 0}, {v: 'black', n: 'Noir', p: 150}, {v: 'white', n: 'Blanc', p: 150}, {v: 'red', n: 'Rouge', p: 150}, {v: 'blue', n: 'Bleu', p: 150}]},
  {id: 'exhaustTip', name: 'Sorties', sub: 'Échappement', opts: [
    {v: 'stock', n: 'Origine', p: 0}, {v: 'twin', n: 'Grosse sortie', p: 300}, {v: 'quad', n: 'Quadruple', p: 600}, {v: 'center', n: 'Centrale', p: 400}, {v: 'side', n: 'Latérale', p: 500}]},
  {id: 'height', name: 'Suspension', sub: 'Hauteur de caisse', opts: [
    {v: 0, n: 'Origine', p: 0}, {v: 2, n: 'Ressorts courts −20 mm', p: 400}, {v: 4, n: 'Combinés filetés −40 mm', p: 900}, {v: 6, n: 'Stance −60 mm', p: 1500}]},
  {id: 'tint', name: 'Vitres', sub: 'Teinte', opts: [
    {v: 0, n: 'Claires', p: 0}, {v: 1, n: 'Teintées', p: 250}, {v: 2, n: 'Limousine', p: 450}]},
  {id: 'neon', name: 'Néons', sub: 'Bas de caisse', opts: [
    {v: 'none', n: 'Aucun', p: 0}, {v: 'cyan', n: 'Cyan', p: 350}, {v: 'pink', n: 'Rose', p: 350}, {v: 'green', n: 'Vert', p: 350},
    {v: 'purple', n: 'Violet', p: 350}, {v: 'orange', n: 'Orange', p: 350}, {v: 'red', n: 'Rouge', p: 350}]}
];
// emplacement des ailerons par profil : zone de pose [x0, x1] et style de montage
const SPOILER_MOUNT = {civic: [14, 36, 'roof'], rcz: [6, 30, 'deck'], s15: [8, 34, 'deck'], evo: [6, 44, 'deck'], gt3: [8, 46, 'deck'], r35: [6, 40, 'deck'], lfa: [6, 36, 'deck'], twingo: [12, 36, 'roof'], clio: [20, 42, 'roof'], mx5: [6, 34, 'deck'], m3: [6, 38, 'deck'], supra: [8, 44, 'deck'], skyline: [6, 40, 'deck']};
function lookOf(o) { return Object.assign({}, LOOK_DEFAULT, (o && o.look) || {}); }
function randomLook(rnd, level) {
  const pick = (id, maxIdx) => { const opts = VISUAL.find(v => v.id === id).opts; return opts[Math.min(opts.length - 1, Math.floor(rnd() * Math.min(opts.length, maxIdx)))].v; };
  const L = Object.assign({}, LOOK_DEFAULT), lv = 1 + Math.floor(level * 7);
  for (const v of VISUAL) if (rnd() < 0.25 + level * 0.6) L[v.id] = pick(v.id, v.id === 'decalColor' ? 99 : lv);
  return L;
}

/* ============ CLANS ============ */
const CLANS = [
  {id: 'cles',   name: 'Les Clés de 12',     emblem: '🔧', color: '#ffb21c', turf: 'La zone industrielle', members: [0, 1],  boss: 2,  perk: {type: 'parts',     v: 0.10, label: 'Pièces de tuning −10 %'}},
  {id: 'nuit',   name: 'Nuit Blanche',       emblem: '🌙', color: '#9b6bff', turf: 'Les quais',            members: [3, 4],  boss: 5,  perk: {type: 'contracts', v: 0.15, label: 'Récompenses des contrats +15 %'}},
  {id: 'twin',   name: 'Twin Turbo Familia', emblem: '🌀', color: '#3ee0ff', turf: 'Le port',              members: [6, 7],  boss: 8,  perk: {type: 'jobs',      v: 0.30, label: 'Petits boulots +30 %'}},
  {id: 'kings',  name: 'Midnight Kings',     emblem: '👑', color: '#ff3b5c', turf: 'L\'autoroute de nuit',  members: [9, 10], boss: 11, perk: {type: 'streak',    v: 0.5,  label: 'Série de victoires jusqu\'à ×3'}},
  {id: 'cercle', name: 'Le Cercle',          emblem: '⭕', color: '#f2cc2e', turf: 'Le circuit privé',     members: [12, 13], boss: 14, perk: {type: 'all',      v: 0.25, label: 'Toutes les récompenses +25 %'}}
];
/* ============ LORE : un chapitre par boss battu ============ */
const LORE = {
  cles: {title: 'Chapitre I — La bougie d\'or', text: c =>
`Momo s'essuie les mains sur son bleu de travail et pose une vieille bougie d'allumage dorée sur ton capot.
« T'es pas d'ici, toi. Ici, la nuit, la ville appartient aux clans. Chaque chef garde une bougie comme celle-là. Les cinq ensemble, ça ouvre la porte du Cercle. »
Il jette un œil au néon de ton garage et fronce les sourcils.
« Tuned Tales… C'était le garage du Fantôme. Le meilleur pilote que cette ville ait connu. Une nuit, il a disparu. Personne ne sait où. »
${c}, la première bougie est à toi.`},
  nuit: {title: 'Chapitre II — Les quais', text: c =>
`Zoé coupe son six-cylindres et reste un moment silencieuse.
« Nuit Blanche roulait avec le Fantôme, avant. Le soir où il a disparu, il courait le dernier Grand Prix sauvage, ici, sur les quais. »
Elle te tend la deuxième bougie, puis une photo pliée en quatre : une voiture rouge sous une bâche, dans un garage que tu reconnais. Le tien.
« Garde-la. Je crois qu'elle t'attendait. »`},
  twin: {title: 'Chapitre III — Le moteur du Fantôme', text: c =>
`Jade sourit pour la première fois de la soirée.
« La Familia construit les moteurs de tout le monde. Le dernier qu'on a monté pour le Fantôme, c'était un douze-cylindres. Il voulait courir pour son titre de propriété… contre l'Architecte. »
Elle baisse la voix. « Personne ne bat l'Architecte. Ceux qui essaient perdent leur voiture. Lui a perdu son garage. »
Troisième bougie. ${c} commence à faire parler de lui sur le port.`},
  kings: {title: 'Chapitre IV — Le chien de garde', text: c =>
`Le Roi du Drag descend de sa Skyline, les mains en l'air.
« Je suis pas un roi. Je suis le chien de garde du Cercle. Ils truquent les courses, ils raflent les voitures avec les titres de propriété, et ils m'ont laissé la couronne pour faire peur aux petits. »
Il te donne la quatrième bougie et une carte noire gravée d'un cercle doré : une invitation au circuit privé.
« Le Fantôme a perdu Tuned Tales contre eux. Si tu gagnes là-bas, tu le récupères pour de bon. »`},
  cercle: {title: 'Chapitre V — La ville est à toi', text: c =>
`La Formule 1 de l'Architecte s'immobilise. Il retire son casque : des cheveux gris, un regard fatigué.
« Le Fantôme était mon associé. On a fondé le Cercle ensemble, pour faire courir la ville. Puis j'ai voulu la posséder. Il est parti avec sa Testa Rossa et m'a laissé le titre de son garage, en jurant que quelqu'un viendrait le reprendre. »
Il pose la cinquième bougie et un acte de propriété signé dans ta main.
« Tuned Tales est à toi. Et sous la bâche, dans ton garage… elle n'a jamais cessé d'attendre. »
${c} règne désormais sur la ville. La Ferrari 250 Testa Rossa du Fantôme rejoint ton garage.`}
};
