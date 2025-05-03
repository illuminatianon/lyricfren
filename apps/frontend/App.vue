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
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <div class="flex flex-1 relative">
      <!-- Sidebar -->
      <aside
        class="bg-slate-700 text-white w-64 p-4 shadow-lg transition-all duration-300 ease-in-out fixed md:static top-0 bottom-0 left-0 z-10 h-full md:h-auto"
        :class="{ '-translate-x-full md:translate-x-0': !sidebarVisible, 'translate-x-0': sidebarVisible }"
      >
        <div class="flex justify-end md:hidden">
          <button @click="toggleSidebar">
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>
        <nav class="mt-6">
          <ul class="space-y-2">
            <li><a href="#" class="block p-2 hover:bg-slate-600 rounded">Home</a></li>
            <li><a href="#" class="block p-2 hover:bg-slate-600 rounded">Lyrics</a></li>
            <li><a href="#" class="block p-2 hover:bg-slate-600 rounded">Settings</a></li>
          </ul>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-4">
        <div class="container mx-auto">
          <h2 class="text-2xl font-bold mb-4">LyricFren - Style Prompting</h2>
          <p class="mb-6">Your friendly Suno companion</p>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Style Editor -->
            <StyleEditor />

            <!-- Prompt Composer -->
            <PromptComposer @result="handleResult" />

            <!-- Result Display -->
            <ResultDisplay :result="generatedResult" />
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-slate-800 text-white p-3 text-sm">
      <div class="container mx-auto flex justify-between items-center">
        <div>© 2024 LyricFren</div>
        <div>Status: Online</div>
      </div>
    </footer>
  </div>
</template>

