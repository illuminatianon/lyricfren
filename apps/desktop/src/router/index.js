import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SettingsView from '../views/SettingsView.vue';
import WorkspaceView from '../views/WorkspaceView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/workspace',
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: WorkspaceView,
  },
  {
    path: '/home',
    name: 'homeView',
    component: HomeView,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
  },
  // Redirect any unknown routes to home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Desktop app - sidebar always visible, no need for navigation guards

export default router;
