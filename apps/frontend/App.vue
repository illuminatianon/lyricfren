<script setup>
import { ref, computed, onMounted } from 'vue';
import AppHeader from "./AppHeader.vue";
import { useSettingsStore } from "./stores/settings";

const sidebarVisible = ref(true);
const windowWidth = ref(window.innerWidth);
const settingsStore = useSettingsStore();

// Computed property to check if we're on mobile
const isMobile = computed(() => windowWidth.value < 768);

const toggleSidebar = () => {
  // Simply toggle the sidebar visibility regardless of screen size
  sidebarVisible.value = !sidebarVisible.value;
  console.log('Sidebar toggled:', sidebarVisible.value);
};

// Check window width and load settings on app mount
onMounted(() => {
  // Set initial sidebar visibility based on screen size
  sidebarVisible.value = !isMobile.value;

  // Update window width on resize
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
  };

  // Add resize listener
  window.addEventListener('resize', handleResize);

  // Load settings
  settingsStore.fetchConfig();
});
</script>

<template>
  <div class="min-h-screen flex flex-column">
    <!-- Header -->
    <AppHeader
      @toggle-sidebar="toggleSidebar"
      :sidebarVisible="sidebarVisible"
      :isMobile="isMobile"
      class="app-header"
    />

    <!-- Mobile overlay -->
    <div
      v-if="sidebarVisible && isMobile"
      class="fixed top-0 left-0 w-full h-full bg-black-alpha-50 z-1"
      @click="toggleSidebar"
    ></div>

    <div class="flex-1 grid grid-nogutter">
      <!-- Sidebar column -->
      <div
        class="col-fixed transition-all transition-duration-300"
        :class="{
          'w-0': !sidebarVisible || isMobile,
          'w-16rem': sidebarVisible && !isMobile
        }"
      >
        <aside
          class="app-sidebar shadow-2 fixed md:static top-0 bottom-0 left-0 z-2 h-full w-16rem"
          :class="{ '-translate-x-100': !sidebarVisible, 'translate-x-0': sidebarVisible }"
        >
          <!-- Sidebar header space -->
          <div class="h-2rem"></div>
          <nav class="mt-4">
            <ul class="list-none p-0 m-0">
              <li class="mb-2">
                <router-link to="/" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors" @click="isMobile && (sidebarVisible = false)">
                  <i class="pi pi-home mr-2"></i>
                  Home
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/prompt" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors" @click="isMobile && (sidebarVisible = false)">
                  <i class="pi pi-pencil mr-2"></i>
                  Prompt
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/settings" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors" @click="isMobile && (sidebarVisible = false)">
                  <i class="pi pi-cog mr-2"></i>
                  Settings
                </router-link>
              </li>
            </ul>
          </nav>
        </aside>
      </div>

      <!-- Main content column -->
      <div
        class="col transition-all transition-duration-300"
        :class="{ 'md:pl-0': !sidebarVisible || isMobile }"
      >
        <main class="p-3 md:p-4 lg:p-5">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Footer -->
    <footer class="app-footer text-sm">
      <div class="container mx-auto flex justify-content-between align-items-center">
        <div>© 2024 LyricFren</div>
        <div class="flex align-items-center">
          <span class="inline-block w-1rem h-1rem border-circle bg-green-500 mr-2"></span>
          <span>Status: Online</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global styles moved to style.css */
/* Custom styles for this component only */
</style>

