import { createApp } from 'vue';
import App from '../ui/App.vue';
import '../styles/base.css';
import { registerSW } from 'virtual:pwa-register';
import { WebMidiGateway } from '../adapters/infrastructure/midi/web-midi.gateway';
import { createMidiStore, MidiStoreSymbol } from '../ui/composables/useMidiStore';
import pkg from '../../package.json';

// Register PWA (service worker) via vite-plugin-pwa
registerSW({ immediate: true });

const app = createApp(App);

// Infrastructure + Store wiring
const gateway = new WebMidiGateway();
const midiStore = createMidiStore(gateway);
app.provide(MidiStoreSymbol, midiStore);

// Set document title with version from package.json
try {
  const baseTitle = 'Mako MIDI Editor';
  const ver = pkg?.version ? ` V${pkg.version}` : '';
  document.title = `${baseTitle}${ver}`;
} catch {}

app.mount('#app');
