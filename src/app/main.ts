import { createApp } from 'vue';
import App from '../ui/App.vue';
import '../styles/base.css';
import { registerPWA } from '../infrastructure/pwa';

// Register PWA (service worker) as early as possible
registerPWA();

createApp(App).mount('#app');

