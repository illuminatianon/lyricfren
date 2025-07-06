<script setup>
import { useRouter } from 'vue-router';
import { useWorkspaceManager } from '../stores/workspaceManager.js';

const router = useRouter();
const workspaceManager = useWorkspaceManager();

// Navigation items data
const navItems = [
  { to: '/workspace', label: 'Workspace', icon: 'mdi-view-dashboard' },
  { to: '/songs', label: 'Songs', icon: 'mdi-music-note' },
  { to: '/styles', label: 'Styles', icon: 'mdi-palette' },
];

const openSettings = () => {
  // Navigate to workspace if not already there
  if (router.currentRoute.value.name !== 'workspace') {
    router.push('/workspace');
  }

  // Add a settings panel
  workspaceManager.addPanel('settings', {
    title: 'Settings',
    content: '',
  });
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


  </div>
</template>
