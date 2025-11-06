import { createApp } from 'vue';
import App from '../ui/App.vue';
import '../styles/base.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA (service worker) via vite-plugin-pwa
registerSW({ immediate: true });

createApp(App).mount('#app');
