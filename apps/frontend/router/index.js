import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SettingsView from '../views/SettingsView.vue'
import WorkspaceView from '../views/WorkspaceView.vue'
import { useUIStore } from '../stores/ui'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/workspace'
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: WorkspaceView
  },
  {
    path: '/home',
    name: 'homeView',
    component: HomeView
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView
  },
  // Redirect any unknown routes to home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Use the UI store to close the sidebar on navigation

// Add a global navigation guard to close the sidebar on every navigation
router.beforeEach((_to, _from, next) => {
  // Get the UI store
  const uiStore = useUIStore()

  // Close the sidebar
  uiStore.closeSidebar()

  // Continue with navigation
  next()
})

export default router
