# Mako MIDI Editor (PWA)

Current version: V0.1.3

PWA built with Vue 3 to control Walrus Audio Mako pedals (D1, M1, R1, ACS1) using Program Change (PC) and Control Change (CC). The UI auto-generates controls from pedal JSON files, supports English/French, and ships as an installable PWA.

## Features

- Multi-pedal board: add/edit/remove pedals, assign per-instance MIDI channels, navigate via a side list; board layout and values persist in localStorage.
- Interaction modes: Live sends CC immediately; Preset records changes, shows a dirty counter, and lets you Apply/Cancel them in batch.
- Program Change panel: manual PC field plus bank/preset grid when `pc.banks` exist; if a `bankSwitch` control exists it is sent before the PC.
- Dynamic CC UI from JSON: range, enum, zoneEnum, toggle, momentary; hidden controls are skipped; optional colors style each pedal card and PC block.
- Import/Export per pedal: JSON includes device, channel, and committed values; import can auto-select the device/channel and updates stored values without sending MIDI.
- PWA + i18n: installable, offline-ready basics, English/French UI with persisted locale and document title showing the current version.

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

1. Run the app (`npm run dev` locally; deploy behind HTTPS for production).
2. Allow MIDI access when prompted by the browser.
3. Open the menu (gear button) to pick a MIDI output and language.
4. Add pedals with the + button; choose the model and MIDI channel (the app suggests a free channel).
5. Switch Live/Preset depending on whether you want immediate CC sends or staged changes.
6. Program Change: use bank/preset buttons when available or type a PC number within the configured range.
7. Controls: tweak parameters; in Preset mode a dirty badge appears until you click Apply (sends all dirty CC) or Cancel (revert to committed values).
8. Import/Export: buttons on each card export/import JSON. Imports update UI/local storage only; no MIDI is sent automatically.

Notes:
- Board, locale, mode, and committed control values persist in localStorage. Clear site data to reset.
- The browser must expose the Web MIDI API and be served over HTTPS/localhost.

## Import / Export (preset JSON)

- Export creates a JSON file with the current pedal, channel, and committed control values.
- Import reads a JSON file and updates the matching pedal/card without sending MIDI.

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
- Import updates UI state and local persistence without sending CC messages; in Preset mode you can still review before applying.

## Supported Devices

Each pedal is described by a JSON file:
- `src/config/D1.json` — Walrus Audio Mako D1 MK1
- `src/config/M1.json` — Walrus Audio Mako M1 MK1
- `src/config/R1.json` — Walrus Audio Mako R1 MK1
- `src/config/ACS1.json` — Walrus Audio Mako ACS1 MK1

You can add other pedals by creating new JSON files in `src/config/`.

## Add a Pedal (JSON schema)

Each file must follow this shape (extra fields are ignored by the renderer):

```jsonc
{
  "device": "Device name",
  "schemaVersion": 1,
  "color": "#cccccc",                // optional: accent dot
  "backgroundColor": "#f5f5f5",      // optional: card/PC background
  "secondaryBgColor": "#e8e8e8",     // optional: secondary surface
  "textColor": "#111111",            // optional: main text color
  "secondaryTextColor": "#555555",   // optional: muted text color
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
    // Examples of supported controls
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
  "notes": ["Optional device-specific notes"]
}
```

The app automatically loads all `*.json` files from `src/config/` via `import.meta.glob` and sorts them by device name. If `pc.banks` is present, the PC UI shows bank/preset buttons and sends the `bankSwitch` control (when defined) before the Program Change. Controls marked with `"hidden": true` are not rendered.

Supported control types (`src/core/entities/controls.ts`):
- `range` (min, max)
- `enum` (key → value map)
- `zoneEnum` (named min/max ranges; the value sent is the middle of the range)
- `toggle` (on/off)
- `momentary` (impulse)

## Project Architecture

- `src/app` — bootstrap (Vue mount, router, PWA, i18n wiring)
- `src/ui` — UI components/pages (device/channel picker, PC/CC, board)
- `src/features/pedal-controls` — rendered control widgets (range/enum/etc.)
- `src/application` — application services (message-sending facade)
- `src/core` — domain (MIDI entities, byte builders, ports)
- `src/adapters` — infrastructure (Web MIDI implementation of `MidiGateway`)
- `src/config` — JSON definitions and helpers (list/load/visibility)
- `src/locales` — translations (en/fr)
- `src/styles` — global styles
- `public` — PWA assets (icons)

The project follows a UI / Application / Domain / Infrastructure split to make testing and adding new MIDI backends easier.

## Compatibility & Limitations

- Web MIDI: primarily available in Chrome/Edge; Safari may require recent versions or flags.
- HTTPS required (or `localhost`) for MIDI access and PWA installation.
- Only MIDI output is used; SysEx is not requested.
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

Walrus Audio and the pedal names mentioned (D1, M1, R1, ACS1, etc.) are trademarks and/or copyrighted works of their respective owners. This project is independent and is not affiliated with, endorsed by, or sponsored by Walrus Audio. These marks and names have no association with the author of this project.

