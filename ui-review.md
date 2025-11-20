# Audit UI & pistes de modernisation

## Ce qui existe aujourd'hui
- **Page principale** : une grille 2 colonnes avec un bandeau titre + menu burger, un panneau de navigation des pédales et une zone cartes/contrôles qui bascule en une seule colonne sous 720 px. 【F:src/ui/pages/EditorPage.vue†L2-L109】
- **Navigateur de pédales** : liste verticale en `card` sticky avec sélection simple et suppression par bouton emoji. 【F:src/ui/components/PedalNavigator.vue†L1-L98】
- **Cartes pédales** : cartes arrondies avec actions texte/emoji (éditer, importer, exporter), commandes PC, boutons live/preset et grille de contrôles. 【F:src/ui/components/PedalBoardCard.vue†L1-L144】
- **Dialog d’ajout/édition** : panneau modal centré avec overlay sombre et formulaires `<select>` basiques. 【F:src/ui/components/AddPedalDialog.vue†L1-L92】
- **Thème global** : palette claire/sombre très neutre, arrondis doux, ombre légère, boutons primaires pleins et variantes “ghost” en pointillés. 【F:src/styles/base.css†L1-L82】

## Pistes d’amélioration (sans dépendance supplémentaire)
1. **Structure et respiration**
   - Étendre la largeur max du conteneur (ex. 1080‑1200 px) et ajouter un spacing vertical cohérent (ex. `gap: 1.25rem` sur `board-content`) pour un rendu plus aéré. 【F:src/ui/pages/EditorPage.vue†L29-L72】
   - Rendre le header sticky avec un fond flouté + ombre subtile afin de garder le titre et le menu accessibles quand on scrolle les cartes. 【F:src/ui/pages/EditorPage.vue†L2-L35】

2. **Navigation des pédales**
   - Ajouter une zone de recherche/filtre en haut de la liste et un badge de statut (live/preset/dirty) pour chaque entrée afin de réduire la charge cognitive quand beaucoup de pédales sont ouvertes. 【F:src/ui/components/PedalNavigator.vue†L1-L76】
   - Remplacer l’emoji poubelle par un bouton icône minimal (CSS only) et ajouter un hover + confirmation inline (ex. texte « Supprimer ? ») pour un look plus moderne qu’un `confirm()` natif. 【F:src/ui/components/PedalNavigator.vue†L31-L98】

3. **Cartes et contrôles**
   - Grouper les actions (éditer/importer/exporter) dans une barre d’actions compacte avec icônes SVG cohérentes et états hover/focus visibles, plutôt que des symboles texte. 【F:src/ui/components/PedalBoardCard.vue†L9-L42】
   - Introduire un en‑tête en deux lignes : titre + tags (live/preset, canal, état dirty) pour clarifier le contexte, et utiliser un fond secondaire (`--secondary-surface`) pour séparer la zone des contrôles. 【F:src/ui/components/PedalBoardCard.vue†L43-L120】
   - Ajouter des micro-interactions CSS (ex. `transform: translateY(-1px)` au hover, `box-shadow` renforcée) afin de donner du relief aux cartes sans librairie tierce. 【F:src/ui/components/PedalBoardCard.vue†L122-L181】

4. **Dialog et flux d’ajout**
   - Donner un aspect feuille flottante : overlay légèrement flou, coins plus arrondis (16 px), ombre plus marquée, et header avec contraste plus fort pour la hiérarchie. 【F:src/ui/components/AddPedalDialog.vue†L1-L80】
   - Prévoir des raccourcis clavier (Enter pour valider, Esc déjà présent) et un résumé des valeurs sélectionnées sous les selects pour rassurer l’utilisateur avant confirmation. 【F:src/ui/components/AddPedalDialog.vue†L64-L92】

5. **Palette et typographie**
   - Réchauffer la palette en ajustant les variables CSS (couleur primaire plus vibrante, surfaces légèrement teintées) et en augmentant les contrastes entre `--surface` et `--bg` pour une ambiance plus « outil créatif ». 【F:src/styles/base.css†L1-L39】
   - Harmoniser les tailles et poids de police (ex. `font-weight: 600` sur titres de section, `0.95rem` sur labels) pour une hiérarchie typographique nette. 【F:src/styles/base.css†L33-L47】

## Quick wins réalisables en pur CSS/Vue
- Appliquer une **grille responsive plus large** et un header sticky : modif `container`/`board-layout` + `position: sticky` sur `.header`. 【F:src/ui/pages/EditorPage.vue†L2-L73】
- **Moderniser les actions** : remplacer les emojis par des icônes SVG inline existants et ajouter des styles hover/focus cohérents sur `.icon-btn` et `.btn.ghost`. 【F:src/ui/components/PedalBoardCard.vue†L17-L42】【F:src/ui/components/PedalBoardCard.vue†L122-L181】
- **Renforcer les états** (dirty, live/preset) par des puces de couleur et badges dans la navigation et les cartes, avec des tokens CSS (`--warning`, `--success`) définis dans `:root`. 【F:src/ui/components/PedalNavigator.vue†L17-L98】【F:src/styles/base.css†L1-L29】