<script setup>
import { ref } from 'vue';
import { useUIStore } from '../stores/ui';
import SettingsDialog from './SettingsDialog.vue';

const uiStore = useUIStore();
const settingsDialogVisible = ref(false);

const openSettings = () => {
  settingsDialogVisible.value = true;
};
</script>

<template>
  <v-app-bar elevation="1" color="surface">
    <div class="d-flex justify-space-between align-center w-100 px-4">
      <div class="d-flex align-center">
        <!-- Hamburger menu button -->
        <v-btn
          @click="uiStore.toggleSidebar"
          :icon="uiStore.sidebarVisible && !uiStore.isMobile ? 'mdi-close' : 'mdi-menu'"
          variant="text"
          class="mr-3"
          aria-label="Toggle sidebar"
        />

        <!-- Logo/Title -->
        <div class="text-h5 font-weight-bold">LyricFren</div>
      </div>

      <!-- Right side actions -->
      <div>
        <v-btn
          prepend-icon="mdi-cog"
          size="small"
          variant="outlined"
          @click="openSettings"
        >
          Settings
        </v-btn>
      </div>
    </div>

    <!-- Settings Dialog -->
    <SettingsDialog v-model:visible="settingsDialogVisible" />
  </v-app-bar>
</template>
