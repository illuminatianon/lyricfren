<script setup>
import { ref, onMounted } from 'vue';
import AppHeader from "./AppHeader.vue";
import { useSettingsStore } from "./stores/settings";

const sidebarVisible = ref(true);
const settingsStore = useSettingsStore();

const toggleSidebar = () => {
  // Simply toggle the sidebar visibility regardless of screen size
  sidebarVisible.value = !sidebarVisible.value;
  console.log('Sidebar toggled:', sidebarVisible.value);
};

// Check window width and load settings on app mount
onMounted(() => {
  // Set initial sidebar visibility based on screen size
  sidebarVisible.value = window.innerWidth >= 768;

  // We don't need a resize listener that automatically changes sidebar visibility
  // as it would override user's manual toggle preference

  // Load settings
  settingsStore.fetchConfig();
});
</script>

<template>
  <div class="flex flex-column min-h-screen">
    <!-- Header -->
    <AppHeader
      @toggle-sidebar="toggleSidebar"
      :sidebarVisible="sidebarVisible"
      class="app-header"
    />

    <div class="flex flex-1 relative">
      <!-- Mobile overlay -->
      <div
        v-if="sidebarVisible"
        class="fixed top-0 left-0 w-full h-full bg-black-alpha-50 md:hidden z-1"
        @click="toggleSidebar"
      ></div>

      <!-- Sidebar -->
      <aside
        class="app-sidebar w-16rem shadow-2 transition-all transition-duration-300 fixed md:relative top-0 bottom-0 left-0 z-2 h-full md:h-auto"
        :class="{ '-translate-x-100': !sidebarVisible, 'translate-x-0': sidebarVisible }"
      >
        <!-- Sidebar header space -->
        <div class="h-2rem"></div>
        <nav class="mt-4">
          <ul class="list-none p-0 m-0">
            <li class="mb-2">
              <router-link to="/" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors" @click="window.innerWidth < 768 && (sidebarVisible = false)">
                <i class="pi pi-home mr-2"></i>
                Home
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/prompt" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors" @click="window.innerWidth < 768 && (sidebarVisible = false)">
                <i class="pi pi-pencil mr-2"></i>
                Prompt
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/settings" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors" @click="window.innerWidth < 768 && (sidebarVisible = false)">
                <i class="pi pi-cog mr-2"></i>
                Settings
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-3 md:p-4 lg:p-5 transition-all transition-duration-300" :class="{ 'md:ml-0': !sidebarVisible, 'md:ml-16rem': sidebarVisible }">
        <router-view />
      </main>
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

