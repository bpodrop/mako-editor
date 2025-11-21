import { createRouter, createWebHashHistory } from 'vue-router';
import EditorPage from '../ui/pages/EditorPage.vue';
import LegalPage from '../ui/components/LegalPage.vue';
import UserGuidePage from '../ui/components/UserGuidePage.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: EditorPage },
    { path: '/legal', name: 'legal', component: LegalPage },
    { path: '/guide', name: 'guide', component: UserGuidePage },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
