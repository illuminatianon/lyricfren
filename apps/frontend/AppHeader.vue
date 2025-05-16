<script setup>
const emit = defineEmits(['toggle-sidebar']);

const toggleSidebar = () => {
  emit('toggle-sidebar');
};
</script>

<template>
  <header>
    <div class="flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <!-- Mobile menu button -->
        <Button
          @click="toggleSidebar"
          icon="pi pi-bars"
          text
          class="md:hidden"
        />

        <!-- Logo/Title -->
        <div class="text-xl font-bold">LyricFren</div>
      </div>

      <!-- Right side actions -->
      <div>
        <router-link to="/settings">
          <Button label="Settings" icon="pi pi-cog" size="small" />
        </router-link>
      </div>
    </div>
  </header>
</template>