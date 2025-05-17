<script setup>
import { useUIStore } from '../stores/ui';
import SidebarNavigation from './SidebarNavigation.vue';

const uiStore = useUIStore();
</script>

<template>
  <!-- Mobile overlay -->
  <div
    v-if="uiStore.sidebarVisible && uiStore.isMobile"
    class="fixed top-0 left-0 w-full h-full bg-black-alpha-50 z-1"
    @click="uiStore.toggleSidebar"
  ></div>

  <!-- Sidebar column -->
  <div
    class="col-fixed transition-all transition-duration-300"
    :class="{
      'w-0': !uiStore.sidebarVisible || uiStore.isMobile,
      'w-16rem': uiStore.sidebarVisible && !uiStore.isMobile
    }"
  >
    <aside
      class="app-sidebar shadow-2 fixed md:static top-0 bottom-0 left-0 z-2 h-full w-16rem"
      :class="{ 
        '-translate-x-100': !uiStore.sidebarVisible, 
        'translate-x-0': uiStore.sidebarVisible 
      }"
    >
      <!-- Sidebar header space -->
      <div class="h-2rem"></div>
      <SidebarNavigation />
    </aside>
  </div>
</template>
