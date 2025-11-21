# Mako MIDI Editor (PWA)

Version actuelle : V0.1.3

Application Web MIDI en Vue 3 pour piloter les pédales Walrus Audio Mako (D1, M1, R1, ACS1) via Program Change (PC) et Control Change (CC). L’UI génère automatiquement les contrôles à partir des JSON de pédales, supporte l’anglais/français et fonctionne comme une PWA installable.

## Fonctionnalités

- Tableau multi-pédales : ajout/édition/suppression, canal MIDI par instance, navigation via une liste latérale; la disposition et les valeurs sont conservées dans localStorage.
- Modes d’interaction : Live envoie les CC immédiatement; Preset enregistre les changements, affiche un compteur de modifications et permet de les Appliquer/Annuler en lot.
- Panneau Program Change : champ PC manuel + grille banque/presets si `pc.banks` est définie; si un contrôle `bankSwitch` existe il est envoyé avant le PC.
- UI CC dynamique depuis les JSON : range, enum, zoneEnum, toggle, momentary; les contrôles marqués hidden sont ignorés; des couleurs optionnelles stylent chaque carte/panneau PC.
- Import/Export par pédale : le JSON inclut l’appareil, le canal et les valeurs validées; l’import peut sélectionner l’appareil/le canal et met à jour les valeurs stockées sans envoyer de MIDI.
- PWA + i18n : installable, cache hors ligne de base, UI en anglais/français avec locale persistée et titre de document incluant la version.

## Pile technique

- Vue 3 + TypeScript (Vite)
- Web MIDI API (navigateur)
- vite-plugin-pwa pour le Service Worker et le manifeste

## Prérequis

- Node.js 18+ (recommandé)
- Navigateur compatible Web MIDI (Chrome/Edge) en contexte sécurisé (HTTPS ou localhost)

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer en développement (http://localhost:5173)
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

## Utilisation

1. Lancez l’app (`npm run dev` en local; déployez en HTTPS en production).
2. Autorisez l’accès MIDI si le navigateur le demande.
3. Ouvrez le menu (icône engrenage) pour choisir la sortie MIDI et la langue.
4. Ajoutez des pédales avec le bouton +; choisissez le modèle et le canal MIDI (un canal libre est suggéré).
5. Basculez entre Live/Preset selon que vous voulez un envoi immédiat ou différé.
6. Program Change : utilisez les boutons banque/presets quand ils sont affichés ou saisissez un numéro de PC dans la plage définie.
7. Contrôles : ajustez les paramètres; en mode Preset, un badge indique les changements en attente jusqu’à Appliquer (envoie les CC modifiés) ou Annuler (revient aux valeurs validées).
8. Import/Export : les boutons de chaque carte exportent/importent un JSON. L’import met uniquement à jour l’UI/le stockage local; aucun MIDI n’est envoyé automatiquement.

Notes:
- Le tableau, la langue, le mode et les valeurs validées persistent dans localStorage. Videz les données du site pour repartir de zéro.
- Le navigateur doit exposer l’API Web MIDI et être servi en HTTPS/localhost.

## Import / Export (preset JSON)

- L’export crée un JSON avec la pédale courante, le canal et les valeurs validées.
- L’import lit un JSON et met à jour la carte correspondante sans envoyer de MIDI.

Format JSON attendu (exemple):

```json
{
  "$schema": "mako-editor:preset",
  "version": 1,
  "device": "D1",
  "channel": 1,
  "values": { "mix": 64, "bypass": 127 },
  "exportedAt": "2025-01-01T12:00:00.000Z"
}
```

Remarques:
- À l’import, si `device` existe dans la liste, l’app sélectionne automatiquement cette pédale.
- Si `channel` est présent, il est appliqué; sinon, le canal courant est conservé.
- Les `values` importées sont appliquées uniquement aux identifiants de contrôles connus par la configuration sélectionnée.
- L’import ne déclenche pas d’envoi CC; en mode Preset vous pouvez toujours valider/annuler après coup.

## Appareils pris en charge

Des fichiers JSON décrivent les paramètres MIDI de chaque pédale:
- `src/config/D1.json` — Walrus Audio Mako D1 MK1
- `src/config/M1.json` — Walrus Audio Mako M1 MK1
- `src/config/R1.json` — Walrus Audio Mako R1 MK1
- `src/config/ACS1.json` — Walrus Audio Mako ACS1 MK1

Vous pouvez ajouter d’autres pédales en créant de nouveaux JSON dans `src/config/`.

## Ajouter une pédale (schéma JSON)

Chaque fichier doit respecter ce schéma (les champs supplémentaires sont ignorés par le rendu):

```jsonc
{
  "device": "Nom de l’appareil",
  "schemaVersion": 1,
  "color": "#cccccc",                // optionnel : accent
  "backgroundColor": "#f5f5f5",      // optionnel : fond de carte/panneau PC
  "secondaryBgColor": "#e8e8e8",     // optionnel : surface secondaire
  "textColor": "#111111",            // optionnel : couleur principale du texte
  "secondaryTextColor": "#555555",   // optionnel : texte atténué
  "midi": {
    "channel": 1,
    "pc": {
      "range": [0, 127],
      "banks": [
        { "bank": "A", "presets": { "red": 0, "green": 1, "blue": 2, "extended": [10, 20] } }
      ]
    }
  },
  "controls": [
    // Exemples de contrôles supportés
    { "id": "mix", "label": "Mix", "cc": 15, "type": "range", "min": 0, "max": 127 },
    { "id": "program", "label": "Program", "cc": 24, "type": "enum", "map": { "A": 0, "B": 1 } },
    { "id": "bankSwitch", "label": "Bank", "cc": 27, "type": "zoneEnum", "zones": [
      { "name": "A", "min": 0, "max": 42 },
      { "name": "B", "min": 43, "max": 85 },
      { "name": "C", "min": 86, "max": 127 }
    ] },
    { "id": "bypass", "label": "Bypass", "cc": 29, "type": "toggle", "off": 0, "on": 127 },
    { "id": "tap", "label": "Tap", "cc": 30, "type": "momentary", "value": 127, "hidden": true }
  ],
  "notes": ["Notes spécifiques (optionnel)"]
}
```

L’application charge automatiquement tous les `*.json` de `src/config/` via `import.meta.glob` et trie l’affichage par nom d’appareil. Si `pc.banks` est présent, l’UI PC affiche les boutons banque/presets et envoie le contrôle `bankSwitch` (s’il existe) avant le Program Change. Les contrôles avec `"hidden": true` ne sont pas rendus.

Types de contrôles supportés (`src/core/entities/controls.ts`):
- `range` (min, max)
- `enum` (map clé → valeur)
- `zoneEnum` (plages nommées min/max, la valeur envoyée est le milieu de la zone)
- `toggle` (on/off)
- `momentary` (impulsion)

## Architecture du projet

- `src/app` — bootstrap (montage Vue, router, PWA, i18n)
- `src/ui` — composants/pages (sélection device/canal, PC/CC, board)
- `src/features/pedal-controls` — widgets de contrôles (range/enum/etc.)
- `src/application` — services applicatifs (façade d’envoi des messages)
- `src/core` — domaine (entités MIDI, génération d’octets, ports)
- `src/adapters` — infrastructure (implémentation Web MIDI du port `MidiGateway`)
- `src/config` — définitions JSON et helpers (liste/chargement/visibilité)
- `src/locales` — traductions (en/fr)
- `src/styles` — styles globaux
- `public` — assets PWA (icônes)

Le pattern suit une séparation « UI / Application / Domaine / Infrastructure » pour faciliter les tests et l’ajout d’autres backends MIDI.

## Compatibilité et limites

- Web MIDI: disponible surtout dans Chrome/Edge; Safari nécessite des versions récentes et drapeaux spécifiques.
- HTTPS requis (ou `localhost`) pour l’accès MIDI et l’installation PWA.
- Seule la sortie MIDI est utilisée; SysEx n’est pas requis.
- Le Service Worker met en cache les assets de base (stratégie NetworkFirst pour scripts/styles).

## Scripts NPM

- `npm run dev` — serveur de dev Vite
- `npm run build` — build de production
- `npm run preview` — prévisualisation du build
- `npm run type-check` — vérification TypeScript avec `vue-tsc`

## Déploiement

- Hébergez le contenu de `dist/` derrière HTTPS.
- Vérifiez que le chemin racine (`/`) et le manifeste PWA sont servis correctement.

## Licence

Ce projet est distribué sous la licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Avertissement

Walrus Audio et les noms de pédales cités (D1, M1, R1, ACS1, etc.) sont des marques déposées et/ou des œuvres protégées appartenant à leurs détenteurs respectifs. Ce projet est indépendant, non affilié, non approuvé et non sponsorisé par Walrus Audio. Ces marques et noms n’ont aucun lien avec l’auteur de ce projet.

