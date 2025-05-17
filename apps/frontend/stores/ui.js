import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';

export const useUIStore = defineStore('ui', () => {
  // State
  const sidebarVisible = ref(true);
  const windowWidth = ref(window.innerWidth);

  // Computed
  const isMobile = computed(() => windowWidth.value < 768);

  // Actions
  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value;
    console.log('Sidebar toggled:', sidebarVisible.value);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile.value) {
      sidebarVisible.value = false;
    }
  };

  const closeSidebar = () => {
    sidebarVisible.value = false;
  };

  const initializeUI = () => {
    // Set initial sidebar visibility based on screen size
    sidebarVisible.value = !isMobile.value;

    // Update window width on resize
    const handleResize = () => {
      windowWidth.value = window.innerWidth;
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);
  };

  return {
    // State
    sidebarVisible,
    windowWidth,

    // Computed
    isMobile,

    // Actions
    toggleSidebar,
    closeSidebarOnMobile,
    closeSidebar,
    initializeUI
  };
});
