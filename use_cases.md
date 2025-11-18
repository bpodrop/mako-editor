# use_cases.md
Application Web MIDI – Walrus Audio Mako Series
Version 1.0

## 1. Objectif
Définir l’ensemble des use cases pour une application web permettant de configurer les pédales **Walrus Audio Mako series** (R1, M1, D1, ACS1) via **Web MIDI**, dans une V1 simple, fiable et intuitive.

## 2. Acteurs
- **Utilisateur** : guitariste souhaitant ajuster sa pédale via MIDI.
- **Application Web MIDI** : interface Vue 3 / TypeScript.
- **Pédale Mako** : R1, M1, D1 ou ACS1.

## 3. Use Cases – V1 (Must Have)

### UC01 – Sélectionner la pédale
1. L’app affiche une sélection : R1 / M1 / D1 / ACS1.
2. L’utilisateur choisit une pédale.
3. L’app charge la configuration JSON (paramètres CC, programmes, banques).
4. L’UI s’adapte selon la pédale sélectionnée.

### UC02 – Choisir la sortie MIDI Web + test rapide
1. L’app liste les sorties MIDI disponibles.
2. L’utilisateur sélectionne la sortie.
3. Envoi d’un **Program Change #0** pour test.
4. L’app affiche un message de confirmation.

### UC03 – Changer de preset (PC)
1. L’app affiche “Preset 0–127”.
2. L’utilisateur clique sur un preset.
3. L’app envoie le PC correspondant.

### UC04 – Ajuster les paramètres principaux (CC)
1. L’app génère automatiquement les sliders/listes selon le JSON.
2. L’utilisateur modifie un paramètre.
3. L’app envoie le CC correspondant.

### UC05 – Afficher les contrôles de façon structurée
Mode simple / Mode avancé.
Groupes : Reverb/Delay/Mod/Amp, EQ, Lo-Fi, Special, etc.

### UC09 – Changer de Programme
Sélection d’un programme d’effet → envoi du CC correspondant.

### UC10 – Changer de Bank A/B/C (R1/M1/D1)
Sélecteur simple → envoi du CC dédié.

## 4. Use Cases – Should Have

### UC06 – Snapshot local
Sauvegarde des CC dans localStorage.

### UC07 – Charger un snapshot
Envoi des CC pour restaurer un réglage.

### UC08 – Multi-pédales
Snapshots et configuration séparés par modèle.

### UC11 – Fonctions spéciales
M1 : Lo-Fi, Skip, Brake, etc.
R1 : Sustain.
ACS1 : Boost, IR Block, HPF/LPF.
Affichés uniquement si CC disponibles.

## 5. Use Cases – Could Have

### UC13 – IR Block + Global HPF/LPF (ACS1)
Accès CC → option V1+.

### Export / Import snapshots
Fichier JSON simple.

### Journal MIDI
Historique des messages envoyés.

### Mode Live
Interface minimale pour scène.

## 6. Règles UI/UX
- UI générée dynamiquement depuis les JSON.
- Mode simple par défaut.
- Mode avancé optionnel.
- Pas d’exposition des fonctions non accessibles en CC.
- Retour visuel immédiat sur chaque action.

## 7. Limites V1
Fonctions non accessibles via CC :
- R1 Stereo Width
- D1 Haas/Panning
- ACS1 IR Upload

## 8. Fichiers attendus
- src/config/R1.json
- src/config/M1.json
- src/config/D1.json
- src/config/ACS1.json
