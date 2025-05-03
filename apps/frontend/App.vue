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
  <div class="flex flex-col min-h-screen bg-gray-900 text-white">
    <!-- Header -->
    <AppHeader @toggle-sidebar="toggleSidebar" />

    <div class="flex flex-1 relative">
      <!-- Sidebar -->
      <aside
        class="bg-gray-800 text-white w-64 p-4 shadow-lg transition-all duration-300 ease-in-out fixed md:static top-0 bottom-0 left-0 z-10 h-full md:h-auto"
        :class="{ '-translate-x-full md:translate-x-0': !sidebarVisible, 'translate-x-0': sidebarVisible }"
      >
        <div class="flex justify-end md:hidden">
          <button @click="toggleSidebar" class="text-white hover:text-blue-300">
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>
        <nav class="mt-6">
          <ul class="space-y-2">
            <li><a href="#" class="block p-2 hover:bg-gray-700 rounded transition-colors">Home</a></li>
            <li><a href="#" class="block p-2 hover:bg-gray-700 rounded transition-colors">Lyrics</a></li>
            <li><a href="#" class="block p-2 hover:bg-gray-700 rounded transition-colors">Settings</a></li>
          </ul>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-4 md:p-6 lg:p-8">
        <div class="container mx-auto max-w-7xl">
          <div class="mb-8 text-center md:text-left">
            <h2 class="text-3xl font-bold mb-2 text-blue-400">LyricFren - Style Prompting</h2>
            <p class="text-gray-400 text-lg">Your friendly Suno companion</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Style Editor -->
            <div class="bg-gray-800 rounded-lg p-4 shadow-lg">
              <StyleEditor class="h-full" />
            </div>

            <!-- Prompt Composer -->
            <div class="bg-gray-800 rounded-lg p-4 shadow-lg">
              <PromptComposer @result="handleResult" class="h-full" />
            </div>

            <!-- Result Display -->
            <div class="bg-gray-800 rounded-lg p-4 shadow-lg">
              <ResultDisplay :result="generatedResult" class="h-full" />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white p-3 text-sm border-t border-gray-700">
      <div class="container mx-auto flex justify-between items-center">
        <div>© 2024 LyricFren</div>
        <div class="flex items-center">
          <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          <span>Status: Online</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global styles moved to style.css */
/* Custom styles for this component only */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: #374151;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4B5563;
  border-radius: 0.25rem;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #6B7280;
}
</style>

