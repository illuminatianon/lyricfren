<script setup>
import NavItem from './NavItem.vue';

// Navigation items data
const navItems = [
  { to: '/', label: 'Home', icon: 'pi-home' },
  { to: '/prompt', label: 'Prompt', icon: 'pi-pencil' },
  { to: '/settings', label: 'Settings', icon: 'pi-cog' }
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
