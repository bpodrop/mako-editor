import { createApp, watch } from 'vue';
import App from '../ui/App.vue';
import '../styles/base.css';
import { registerSW } from 'virtual:pwa-register';
import { WebMidiGateway } from '../adapters/infrastructure/midi/web-midi.gateway';
import { createMidiStore, MidiStoreSymbol } from '../ui/composables/useMidiStore';
import pkg from '../../package.json';
import { router } from './router';
import { i18n } from './i18n';

// Register PWA (service worker) via vite-plugin-pwa
registerSW({ immediate: true });

const app = createApp(App);

// Infrastructure + Store wiring
const gateway = new WebMidiGateway();
const midiStore = createMidiStore(gateway);
app.provide(MidiStoreSymbol, midiStore);
app.use(router);
app.use(i18n);

// Set document title with version from package.json
const refreshTitle = () => {
  try {
    const baseTitle = i18n.global.t('app.title');
    const ver = pkg?.version ? ` ${i18n.global.t('app.version', { version: pkg.version })}` : '';
    document.title = `${baseTitle}${ver}`;
  } catch {
    // ignore title update errors
  }
};
refreshTitle();
watch(() => i18n.global.locale.value, refreshTitle);

app.mount('#app');
