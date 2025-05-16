<script setup>
import { ref, onMounted } from 'vue';
import AppHeader from "./AppHeader.vue";
import { useSettingsStore } from "./stores/settings";

const sidebarVisible = ref(false);
const settingsStore = useSettingsStore();

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

// Load settings on app mount
onMounted(() => {
  settingsStore.fetchConfig();
});
</script>

<template>
  <div class="flex flex-column min-h-screen">
    <!-- Header -->
    <AppHeader @toggle-sidebar="toggleSidebar" class="app-header" />

    <div class="flex flex-1 relative">
      <!-- Sidebar -->
      <aside
        class="app-sidebar w-16rem shadow-2 transition-all transition-duration-300 fixed md:static top-0 bottom-0 left-0 z-1 h-full md:h-auto"
        :class="{ '-translate-x-100 md:translate-x-0': !sidebarVisible, 'translate-x-0': sidebarVisible }"
      >
        <div class="flex justify-content-end md:hidden">
          <Button icon="pi pi-times" text @click="toggleSidebar" />
        </div>
        <nav class="mt-4">
          <ul class="list-none p-0 m-0">
            <li class="mb-2">
              <router-link to="/" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors">
                <i class="pi pi-home mr-2"></i>
                Home
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/prompt" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors">
                <i class="pi pi-pencil mr-2"></i>
                Prompt
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/settings" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors">
                <i class="pi pi-cog mr-2"></i>
                Settings
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-3 md:p-4 lg:p-5">
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

