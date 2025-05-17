<script setup>
import { useUIStore } from '../stores/ui';

const uiStore = useUIStore();
</script>

<template>
  <header>
    <div class="flex justify-content-between align-items-center">
      <div class="flex align-items-center gap-3">
        <!-- Hamburger menu button -->
        <Button
          @click="uiStore.toggleSidebar"
          :icon="uiStore.sidebarVisible && !uiStore.isMobile ? 'pi pi-times' : 'pi pi-bars'"
          text
          class="transition-all transition-duration-300"
          aria-label="Toggle sidebar"
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