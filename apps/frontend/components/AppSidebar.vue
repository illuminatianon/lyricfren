<script setup>
import { useUIStore } from '../stores/ui';
import SidebarNavigation from './SidebarNavigation.vue';

const uiStore = useUIStore();
</script>

<template>
  <v-navigation-drawer
    v-model="uiStore.sidebarVisible"
    :temporary="uiStore.isMobile"
    :permanent="!uiStore.isMobile"
    width="256"
    color="surface"
    app
  >
    <SidebarNavigation />
  </v-navigation-drawer>
</template>
