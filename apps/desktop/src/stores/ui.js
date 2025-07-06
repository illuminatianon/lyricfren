import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  // State - sidebar is always visible in desktop app
  const sidebarVisible = ref(true);

  // Actions - keeping minimal interface for compatibility
  const toggleSidebar = () => {
    // In desktop app, sidebar is always visible, but keeping for compatibility
    console.log('Sidebar toggle requested (desktop app - always visible)');
  };

  const closeSidebar = () => {
    // In desktop app, sidebar is always visible, but keeping for compatibility
    console.log('Sidebar close requested (desktop app - always visible)');
  };

  const initializeUI = () => {
    // Desktop app initialization - sidebar always visible
    sidebarVisible.value = true;
    console.log('Desktop UI initialized');
  };

  return {
    // State
    sidebarVisible,

    // Actions
    toggleSidebar,
    closeSidebar,
    initializeUI,
  };
});
