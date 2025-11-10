import { createRouter, createWebHashHistory } from 'vue-router';
import EditorPage from '../ui/pages/EditorPage.vue';
import LegalPage from '../ui/components/LegalPage.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: EditorPage },
    { path: '/legal', name: 'legal', component: LegalPage },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
