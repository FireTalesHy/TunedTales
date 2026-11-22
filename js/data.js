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
           gears:[3.83,2.36,1.69,1.31,1.00,0.79], color:'#4060b8', style:'skyline', hint:'Godzilla : 4 roues motrices'}
};
const CAR_IDS = Object.keys(CARS);
const ENGINE_IDS = Object.keys(ENGINES);

// Pièces de tuning : 11 catégories, 3 niveaux (nitro : 2)
const PARTS = [
  {id:'intake',  icon:'🌬️', name:'Admission',      desc:'Respire mieux : plus d\'air = plus de puissance.',
   tiers:[{n:'Filtre sport',p:350},{n:'Kit admission directe',p:800},{n:'Boîtier carbone + trompettes',p:1700}]},
  {id:'exhaust', icon:'🔊', name:'Échappement',    desc:'Évacue plus vite les gaz brûlés.',
   tiers:[{n:'Cat-back sport',p:450},{n:'Ligne inox + décat',p:1000},{n:'Collecteur 4-1 + ligne libre',p:2100}]},
  {id:'cam',     icon:'⚙️', name:'Arbres à cames', desc:'Déplace la puissance vers les hauts régimes (+250 tr/min de zone rouge par niveau).',
   tiers:[{n:'Cames Stage 1',p:700},{n:'Cames Stage 2',p:1500},{n:'Cames compétition',p:3000}]},
  {id:'ecu',     icon:'💻', name:'Reprogrammation',desc:'Cartographie moteur optimisée.',
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
  {name:'Le Roi du Drag', tag:'Boss final',  car:'skyline',engine:'rb26', parts:{turbo:3,ecu:3,intake:3,exhaust:3,cam:3,tires:3,clutch:3,gearbox:2,weight:3,aero:2,nitro:2}, reward:15000, skill:0.97}
];

const PAINTS = ['#e8c020','#f2f2f2','#c42020','#3a78d0','#2a2a30','#30a050','#e87820','#9040c0','#e060a0','#20b8c8'];

/* ============ PERSONNALISATION VISUELLE ============ */
const LOOK_DEFAULT = {finish: 'gloss', kit: 0, spoiler: 0, wheel: 'stock', wheelColor: 'silver', wheelSize: 0,
                      decal: 'none', decalColor: '#111216', height: 0, tint: 0, neon: 'none'};
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
  {id: 'height', name: 'Suspension', sub: 'Hauteur de caisse', opts: [
    {v: 0, n: 'Origine', p: 0}, {v: 2, n: 'Ressorts courts −20 mm', p: 400}, {v: 4, n: 'Combinés filetés −40 mm', p: 900}, {v: 6, n: 'Stance −60 mm', p: 1500}]},
  {id: 'tint', name: 'Vitres', sub: 'Teinte', opts: [
    {v: 0, n: 'Claires', p: 0}, {v: 1, n: 'Teintées', p: 250}, {v: 2, n: 'Limousine', p: 450}]},
  {id: 'neon', name: 'Néons', sub: 'Bas de caisse', opts: [
    {v: 'none', n: 'Aucun', p: 0}, {v: 'cyan', n: 'Cyan', p: 350}, {v: 'pink', n: 'Rose', p: 350}, {v: 'green', n: 'Vert', p: 350},
    {v: 'purple', n: 'Violet', p: 350}, {v: 'orange', n: 'Orange', p: 350}, {v: 'red', n: 'Rouge', p: 350}]}
];
// emplacement des ailerons par profil : zone de pose [x0, x1] et style de montage
const SPOILER_MOUNT = {twingo: [12, 36, 'roof'], clio: [20, 42, 'roof'], mx5: [6, 34, 'deck'], m3: [6, 38, 'deck'], supra: [8, 44, 'deck'], skyline: [6, 40, 'deck']};
function lookOf(o) { return Object.assign({}, LOOK_DEFAULT, (o && o.look) || {}); }
function randomLook(rnd, level) {
  const pick = (id, maxIdx) => { const opts = VISUAL.find(v => v.id === id).opts; return opts[Math.min(opts.length - 1, Math.floor(rnd() * Math.min(opts.length, maxIdx)))].v; };
  const L = Object.assign({}, LOOK_DEFAULT), lv = 1 + Math.floor(level * 7);
  for (const v of VISUAL) if (rnd() < 0.25 + level * 0.6) L[v.id] = pick(v.id, v.id === 'decalColor' ? 99 : lv);
  return L;
}
