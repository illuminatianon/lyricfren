<script setup>
import { useUIStore } from '../stores/ui';

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
});

const uiStore = useUIStore();

const handleClick = () => {
  uiStore.closeSidebar();
};
</script>

<template>
  <v-list-item
    :to="to"
    :prepend-icon="icon"
    :title="label"
    @click="handleClick"
  />
</template>
