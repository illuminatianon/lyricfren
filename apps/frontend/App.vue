<script setup>
import { ref, onMounted } from 'vue';
import AppHeader from "./AppHeader.vue";
import StyleEditor from "./components/StyleEditor.vue";
import PromptComposer from "./components/PromptComposer.vue";
import ResultDisplay from "./components/ResultDisplay.vue";
import { useSettingsStore } from "./stores/settings";

const sidebarVisible = ref(false);
const generatedResult = ref('');
const settingsStore = useSettingsStore();

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

const handleResult = (result) => {
  generatedResult.value = result;
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
            <li class="mb-2"><a href="#" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors">Home</a></li>
            <li class="mb-2"><a href="#" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors">Lyrics</a></li>
            <li class="mb-2"><a href="#" class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors">Settings</a></li>
          </ul>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-3 md:p-4 lg:p-5">
        <div class="container mx-auto">
          <div class="mb-5 text-center md:text-left">
            <h2 class="text-3xl font-bold mb-2 text-primary">LyricFren - Style Prompting</h2>
            <p class="text-lg text-color-secondary">Your friendly Suno companion</p>
          </div>

          <div class="grid">
            <div class="col-12 md:col-6 lg:col-4 p-2">
              <!-- Style Editor -->
              <Card class="h-full">
                <template #content>
                  <StyleEditor />
                </template>
              </Card>
            </div>

            <div class="col-12 md:col-6 lg:col-4 p-2">
              <!-- Prompt Composer -->
              <Card class="h-full">
                <template #content>
                  <PromptComposer @result="handleResult" />
                </template>
              </Card>
            </div>

            <div class="col-12 md:col-6 lg:col-4 p-2">
              <!-- Result Display -->
              <Card class="h-full">
                <template #content>
                  <ResultDisplay :result="generatedResult" />
                </template>
              </Card>
            </div>
          </div>
        </div>
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

