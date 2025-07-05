<script setup>
import NavItem from './NavItem.vue';

// Navigation items data
const navItems = [
  { to: '/workspace', label: 'Workspace', icon: 'pi-th-large' },
  { to: '/meter', label: 'Meter', icon: 'pi-music' },
  { to: '/prompt', label: 'Prompt', icon: 'pi-pencil' },
  { to: '/home', label: 'Home', icon: 'pi-home' }
];
</script>

<template>
  <nav class="mt-4">
    <ul class="list-none p-0 m-0">
      <NavItem
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :icon="item.icon"
      />
    </ul>
  </nav>
</template>
