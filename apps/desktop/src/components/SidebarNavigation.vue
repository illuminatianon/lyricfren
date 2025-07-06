<script setup>
import { ref } from 'vue';
import SettingsDialog from './SettingsDialog.vue';

// Navigation items data
const navItems = [
  { to: '/workspace', label: 'Workspace', icon: 'mdi-view-dashboard' },
  { to: '/songs', label: 'Songs', icon: 'mdi-music-note' },
  { to: '/styles', label: 'Styles', icon: 'mdi-palette' },
];

const settingsDialogVisible = ref(false);

const openSettings = () => {
  settingsDialogVisible.value = true;
};
</script>

<template>
  <div class="d-flex flex-column h-100">
    <!-- Main Navigation -->
    <v-list
      nav
      class="flex-grow-1 pt-4"
    >
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        class="mb-2"
      >
        <v-tooltip
          activator="parent"
          location="end"
        >
          {{ item.label }}
        </v-tooltip>
      </v-list-item>
    </v-list>

    <!-- Settings at bottom -->
    <v-list nav>
      <v-list-item
        @click="openSettings"
        prepend-icon="mdi-cog"
        class="mb-4"
      >
        <v-tooltip
          activator="parent"
          location="end"
        >
          Settings
        </v-tooltip>
      </v-list-item>
    </v-list>

    <!-- Settings Dialog -->
    <SettingsDialog v-model:visible="settingsDialogVisible" />
  </div>
</template>
