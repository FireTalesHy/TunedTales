# Tuned Tales

Jeu de drag & tuning en pixel art (2.5D), jouable dans le navigateur — aucune dépendance, aucun build.

- 6 voitures (Twingo 2 → Skyline R34), 10 moteurs swappables, 11 catégories de pièces (3 niveaux)
- Onglet Tuning : courbes puissance/couple, chiffres clés et aperçu du gain avant achat
- Drag 402 m : réflexe de départ + passages de vitesse (mode facile), nitro
- Contrats : 3 courses proposées à chaque fois, adaptées à ta voiture (rivaux, préparations et récompenses variés : pari, défi réflexe, départ canon…)
- Petits boulots en mini-jeux (livraison de pizzas, station de lavage, serrage au couple) : le score est converti en argent
- Sons moteurs simulés physiquement par moteur (4, 6, 8 cylindres), sifflement de turbo, dump valve et pétarades selon l'échappement
- Sauvegarde automatique (localStorage)

## ▶ Jouer

**https://firetaleshy.github.io/TunedTales/**

Le site est publié par GitHub Pages depuis la branche `main` (Settings → Pages → Deploy from a branch → `main` / root). En local : ouvrir `index.html`.

Contrôles : ESPACE / clic maintenu = régime au départ, relâcher au feu vert ; ESPACE / clic = passer la vitesse ; N = nitro.

## Crédits

- Synthèse du son moteur : [engine-sound-generator](https://github.com/Antonio-R1/engine-sound-generator) d'Antonio-R1 (licence MIT, voir `js/vendor/LICENSE-engine-sound-generator.txt`), d'après Baldan et al. 2015, *Physically informed car engine sound synthesis*.
- Silhouettes des voitures relevées sur des photos de profil (Wikimedia Commons et images de référence fournies).

Le son moteur simulé nécessite une page servie en HTTPS (GitHub Pages) ou via `localhost` ; en ouvrant `index.html` directement, un synthé de secours est utilisé.
