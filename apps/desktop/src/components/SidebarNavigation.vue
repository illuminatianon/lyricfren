<script setup>
import NavItem from './NavItem.vue';

// Navigation items data
const navItems = [
  { to: '/workspace', label: 'Workspace', icon: 'mdi-view-dashboard' },
  { to: '/home', label: 'Home', icon: 'mdi-home' },
];
</script>

<template>
  <v-list
    nav
    class="mt-4"
  >
    <NavItem
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :label="item.label"
      :icon="item.icon"
    />
  </v-list>
</template>
