<script setup>
import { useUIStore } from '../stores/ui';

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  }
});

const uiStore = useUIStore();

const handleClick = () => {
  uiStore.closeSidebar();
};
</script>

<template>
  <li class="mb-2">
    <router-link
      :to="to"
      class="no-underline p-2 flex align-items-center hover:surface-hover border-round transition-colors"
      @click="handleClick"
    >
      <i v-if="icon" :class="`pi ${icon} mr-2`"></i>
      {{ label }}
    </router-link>
  </li>
</template>
