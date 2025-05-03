<script setup>
const emit = defineEmits(['toggle-sidebar']);

const toggleSidebar = () => {
  emit('toggle-sidebar');
};
</script>

<template>
  <header class="bg-slate-800 text-white p-4 shadow-md">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <!-- Mobile menu button -->
        <button
          @click="toggleSidebar"
          class="md:hidden text-white focus:outline-none"
        >
          <i class="pi pi-bars text-xl"></i>
        </button>

        <!-- Logo/Title -->
        <div class="text-xl font-bold">LyricFren</div>
      </div>

      <!-- Right side actions -->
      <div>
        <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
          Settings
        </button>
      </div>
    </div>
  </header>
</template>