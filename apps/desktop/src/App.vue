<script setup>
import { onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import AppFooter from './components/AppFooter.vue';
import { useSettingsStore } from './stores/settings';
import { useUIStore } from './stores/ui';

const settingsStore = useSettingsStore();
const uiStore = useUIStore();

// Initialize UI and load settings on app mount
onMounted(() => {
  // Initialize UI (sidebar visibility, window resize listener)
  uiStore.initializeUI();

  // Load settings
  settingsStore.fetchConfig();
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
    <AppFooter />
  </v-app>
</template>

<style>
</style>
