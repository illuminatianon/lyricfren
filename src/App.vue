<script setup>
import { ref } from 'vue';

const sidebarVisible = ref(false);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-slate-800 text-white p-4 shadow-md">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          </div>  
      </div>
    </header>

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
          <!-- Your main content here -->
          <h2 class="text-2xl font-bold mb-4">Welcome to LyricFren</h2>
          <p>Your friendly Suno companion</p>
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

<style scoped>
/* Additional custom styles can go here */
</style>
