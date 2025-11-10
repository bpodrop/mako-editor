# Mako MIDI Editor (PWA)

Current version: V0.1.0-beta

Web MIDI application built with Vue 3 to control Walrus Audio Mako pedals (D1, M1, R1) using Program Change (PC) and Control Change (CC). The UI auto-generates controls from JSON configuration files and ships as a PWA (installable, basic offline capability).

## Features

- Send MIDI messages: Program Change and Control Change
- Select MIDI output and channel (1–16)
- Dynamic pedal controls (range, enum, zoneEnum, toggle, momentary)
- Ready-to-use configs: D1, M1, R1
- Local persistence of values per pedal (localStorage)
- PWA: installable, auto-update, works over HTTPS/localhost

## Tech Stack

- Vue 3 + TypeScript (Vite)
- Web MIDI API (browser)
- vite-plugin-pwa for Service Worker and manifest

## Requirements

- Node.js 18+
- A browser with Web MIDI support (Chrome/Edge) in a secure context (HTTPS or localhost)

## Quick Start

```bash
# Install dependencies
npm install

# Run in development (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview the build
npm run preview
```

## Usage

1. Open the app (dev: `npm run dev`, prod: deploy over HTTPS).
2. Allow MIDI access when prompted by the browser.
3. Pick a MIDI output and channel.
4. Select a pedal configuration (D1, M1 or R1).
5. Use:
   - Program Change: send a preset PC (0–127).
   - Controls: each UI control sends the CC defined in the configuration.

Notes:
- The browser must expose the Web MIDI API and be served over HTTPS/localhost.
- Control values persist per device via localStorage.

## Save / Load

- “Save (file)” exports a JSON file with the selected device, current MIDI channel, and all control values.
- “Load (file)” imports a previously exported JSON and applies values (no MIDI is sent during import).

Expected JSON shape (example):

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

Notes:
- On import, if `device` matches a known option, the app selects it automatically.
- If `channel` is present, it is applied; otherwise the current channel is kept.
- Only control IDs known by the selected configuration are applied.
- Import updates UI state and local persistence without sending CC messages.

## Supported Devices

Each pedal is described by a JSON file:
- `src/config/D1.json` — Walrus Audio Mako D1
- `src/config/M1.json` — Walrus Audio Mako M1
- `src/config/R1.json` — Walrus Audio Mako R1

You can add other pedals by creating new JSON files in `src/config/`.

## Add a Pedal (JSON schema)

Each file must follow this minimal shape:

```jsonc
{
  "device": "Device name",
  "schemaVersion": 1,
  "midi": { "channel": 1, "pc": { "range": [0, 127] } },
  "controls": [
    // Examples of supported controls
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
  "notes": ["Optional device-specific notes"]
}
```

The app automatically loads all `*.json` files from `src/config/` via `import.meta.glob` and sorts them by device name.

Supported control types (`src/core/entities/controls.ts`):
- `range` (min, max)
- `enum` (key → value map)
- `zoneEnum` (named min/max ranges; the value sent is the middle of the range)
- `toggle` (on/off)
- `momentary` (impulse)

## Project Architecture

- `src/app` — bootstrap (Vue mount, PWA)
- `src/ui` — UI components (device/channel pickers, PC/CC, control rendering)
- `src/application` — application services (message-sending facade)
- `src/core` — domain (MIDI entities, byte builders, ports)
- `src/adapters` — infrastructure (Web MIDI implementation of `MidiGateway`)
- `src/config` — JSON definitions and helpers (list/load/visibility)
- `public` — PWA assets (icons)

The project follows a UI / Application / Domain / Infrastructure split to make testing and adding new MIDI backends easier.

## Compatibility & Limitations

- Web MIDI: primarily available in Chrome/Edge; Safari may require recent versions or flags.
- HTTPS required (or `localhost`) for MIDI access and PWA installation.
- The Service Worker caches basic assets (NetworkFirst for scripts/styles).

## NPM Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the build
- `npm run type-check` — TypeScript check via `vue-tsc`

## Deployment

- Host the `dist/` content behind HTTPS.
- Ensure the root path (`/`) and PWA manifest are served correctly.

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Disclaimer

Walrus Audio and the pedal names mentioned (D1, M1, R1, etc.) are trademarks and/or copyrighted works of their respective owners. This project is independent and is not affiliated with, endorsed by, or sponsored by Walrus Audio. These marks and names have no association with the author of this project.

