<script setup>
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import { useSettingsStore } from './stores/settings';
import { useUIStore } from './stores/ui';
import { useWorkspaceManager } from './stores/workspaceManager';

const settingsStore = useSettingsStore();
const uiStore = useUIStore();
const workspaceManager = useWorkspaceManager();

// Initialize UI and load settings on app mount
onMounted(async () => {
  // Initialize UI (sidebar visibility, window resize listener)
  uiStore.initializeUI();

  // Load settings
  settingsStore.fetchConfig();

  // Initialize workspace (load most recent or create new)
  try {
    await workspaceManager.initializeWorkspace();
  } catch (error) {
    console.error('Failed to initialize workspace:', error);
  }
});
</script>

<template>
  <v-app>
    <AppHeader />
    <v-main>
      <div class="d-flex">
        <AppSidebar />
        <div class="flex-grow-1">
          <div class="pa-4">
            <router-view />
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style>
</style>
