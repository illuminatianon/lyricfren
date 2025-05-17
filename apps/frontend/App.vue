<script setup>
import { onMounted } from 'vue';
import AppHeader from "./AppHeader.vue";
import AppSidebar from "./components/AppSidebar.vue";
import AppFooter from "./components/AppFooter.vue";
import { useSettingsStore } from "./stores/settings";
import { useUIStore } from "./stores/ui";

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
  <div class="min-h-screen flex flex-column">
    <!-- Header -->
    <AppHeader class="app-header" />

    <div class="flex-1 grid grid-nogutter">
      <!-- Sidebar -->
      <AppSidebar />

      <!-- Main content column -->
      <div
        class="col transition-all transition-duration-300"
        :class="{ 'md:pl-0': !uiStore.sidebarVisible || uiStore.isMobile }"
      >
        <main class="p-3 md:p-4 lg:p-5">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<style>
/* Global styles moved to style.css */
/* Custom styles for this component only */
</style>

