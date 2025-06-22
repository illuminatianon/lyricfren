<script setup>
import { onMounted } from 'vue';
import AppHeader from "./components/AppHeader.vue";
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
    <AppHeader class="app-header" />
    <div class="flex-1 flex">
      <AppSidebar />
      <div
        class="flex-1 transition-all transition-duration-300"
        :class="{ 'md:pl-0': !uiStore.sidebarVisible || uiStore.isMobile }"
      >
        <main class="p-3 md:p-4 lg:p-5 flex-1 flex flex-column">
          <router-view class="flex-1" />
        </main>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<style>
</style>
