# MIDI Controller (PWA)

Application Web MIDI en Vue 3 pour piloter des pédales Walrus Audio Mako (D1, M1, R1) via Program Change (PC) et Control Change (CC). L’UI génère automatiquement les contrôles à partir de fichiers de configuration JSON et fonctionne comme une PWA (installable, mode hors‑ligne de base).

## Fonctionnalités

- Envoi de messages MIDI: Program Change et Control Change
- Sélection de sortie MIDI et du canal (1–16)
- Commandes dynamiques par pédale (range, enum, zoneEnum, toggle, momentary)
- Configurations prêtes à l’emploi: D1, M1, R1
- Persistance locale des valeurs par pédale (localStorage)
- PWA: installable, mise à jour automatique, fonctionne en HTTPS/localhost

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

1. Ouvrir l’app (dev: `npm run dev`, prod: déployée en HTTPS).
2. Autoriser l’accès MIDI si le navigateur le demande.
3. Choisir la sortie MIDI et le canal.
4. Sélectionner la configuration de pédale (D1, M1 ou R1).
5. Utiliser:
   - Program Change: envoyer un preset PC (0–127).
   - Contrôles: chaque contrôle envoie le CC défini par la configuration.

Notes:
- Le navigateur doit exposer l’API Web MIDI et être servi en HTTPS/localhost.
- Les valeurs des contrôles sont persistées par appareil (localStorage).

## Appareils pris en charge

Des fichiers JSON décrivent les paramètres MIDI de chaque pédale:
- `src/config/D1.json` — Walrus Audio Mako D1
- `src/config/M1.json` — Walrus Audio Mako M1
- `src/config/R1.json` — Walrus Audio Mako R1

Vous pouvez ajouter d’autres pédales en créant de nouveaux JSON dans `src/config/`.

## Ajouter une pédale (schema JSON)

Chaque fichier doit respecter ce schéma minimal:

```jsonc
{
  "device": "Nom de l’appareil",
  "schemaVersion": 1,
  "midi": { "channel": 1, "pc": { "range": [0, 127] } },
  "controls": [
    // Exemples de contrôles supportés
    { "id": "mix", "label": "Mix", "cc": 15, "type": "range", "min": 0, "max": 127 },
    { "id": "program", "label": "Program", "cc": 24, "type": "enum", "map": { "A": 0, "B": 1 } },
    { "id": "bank", "label": "Bank", "cc": 27, "type": "zoneEnum", "zones": [
      { "name": "A", "min": 0, "max": 42 },
      { "name": "B", "min": 43, "max": 85 },
      { "name": "C", "min": 86, "max": 127 }
    ] },
    { "id": "bypass", "label": "Bypass", "cc": 29, "type": "toggle", "off": 0, "on": 127 },
    { "id": "tap", "label": "Tap", "cc": 30, "type": "momentary", "value": 127 }
  ],
  "notes": ["Notes spécifiques (optionnel)"]
}
```

L’application charge automatiquement tous les `*.json` de `src/config/` via `import.meta.glob` et trie l’affichage par nom d’appareil.

Types de contrôles supportés (`src/core/entities/controls.ts`):
- `range` (min, max)
- `enum` (map clé → valeur)
- `zoneEnum` (plages nommées min/max, la valeur envoyée est le milieu de la zone)
- `toggle` (on/off)
- `momentary` (impulsion)

## Architecture du projet

- `src/app` — bootstrap (montage Vue, PWA)
- `src/ui` — composants d’interface (sélection device/canal, PC/CC, rendu des contrôles)
- `src/application` — services d’application (façade d’envoi des messages)
- `src/core` — domaine (entités MIDI, génération d’octets, ports)
- `src/adapters` — infrastructure (implémentation Web MIDI du port `MidiGateway`)
- `src/config` — définitions JSON et helpers (liste/chargement/visibilité)
- `public` — assets PWA (icônes)

Le pattern suit une séparation « UI / Application / Domaine / Infrastructure » pour faciliter les tests et l’ajout d’autres backends MIDI.

## Compatibilité et limites

- Web MIDI: disponible surtout dans Chrome/Edge; Safari nécessite des versions récentes et drapeaux spécifiques.
- HTTPS requis (ou `localhost`) pour l’accès MIDI et l’installation PWA.
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

Aucune licence spécifiée dans ce dépôt. Ajoutez un fichier `LICENSE` si nécessaire.

