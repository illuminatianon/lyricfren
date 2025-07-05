<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  isDirty: {
    type: Boolean,
    default: false
  },
  primaryActions: {
    type: Array,
    default: () => []
  },
  overflowActions: {
    type: Array,
    default: () => []
  },
  sidebarOpen: {
    type: Boolean,
    default: false
  },
  draggable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'sidebar-toggle',
  'drag-start',
  'drag-end'
]);

// Component state
const showOverflowMenu = ref(false);

// Computed properties
const displayTitle = computed(() => {
  return props.isDirty ? `${props.title} •` : props.title;
});

// Action handlers
const handleSidebarToggle = () => {
  emit('sidebar-toggle');
};

const handleDragStart = (event) => {
  if (props.draggable) {
    emit('drag-start', event);
  }
};

const handleDragEnd = (event) => {
  if (props.draggable) {
    emit('drag-end', event);
  }
};

const handleActionClick = (action) => {
  if (action.command && typeof action.command === 'function') {
    action.command();
  }
  showOverflowMenu.value = false;
};
</script>

<template>
  <div 
    class="panel-header flex align-items-center justify-content-between px-3 py-2"
    :class="{ 'draggable': draggable }"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Left Section: Title and Drag Handle -->
    <div class="flex align-items-center gap-2 flex-1 min-w-0">
      <!-- Drag Handle -->
      <i 
        v-if="draggable"
        class="pi pi-bars drag-handle text-color-secondary cursor-move"
        v-tooltip="'Drag to reorder panel'"
      ></i>
      
      <!-- Title -->
      <h3 
        class="panel-title text-lg font-medium m-0 text-overflow-ellipsis overflow-hidden white-space-nowrap"
        :class="{ 'dirty': isDirty }"
        :title="title"
      >
        {{ displayTitle }}
      </h3>
    </div>
    
    <!-- Right Section: Actions -->
    <div class="flex align-items-center gap-1">
      <!-- Primary Actions -->
      <template v-for="action in primaryActions" :key="action.label">
        <Button
          :icon="action.icon"
          :label="action.label"
          :severity="action.severity || 'secondary'"
          :disabled="action.disabled"
          size="small"
          outlined
          @click="handleActionClick(action)"
          v-tooltip="action.tooltip || action.label"
        />
      </template>
      
      <!-- Sidebar Toggle -->
      <Button
        :icon="sidebarOpen ? 'pi pi-angle-right' : 'pi pi-angle-left'"
        severity="secondary"
        size="small"
        text
        @click="handleSidebarToggle"
        v-tooltip="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
      />
      
      <!-- Overflow Menu -->
      <div class="relative" v-if="overflowActions.length > 0">
        <Button
          icon="pi pi-ellipsis-v"
          severity="secondary"
          size="small"
          text
          @click="showOverflowMenu = !showOverflowMenu"
          aria-haspopup="true"
          aria-controls="panel-overflow-menu"
        />
        
        <Menu
          id="panel-overflow-menu"
          :model="overflowActions.map(action => ({
            ...action,
            command: () => handleActionClick(action)
          }))"
          :popup="true"
          v-model:visible="showOverflowMenu"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-header {
  height: 48px;
  background: var(--surface-section);
  border-bottom: 1px solid var(--surface-border);
  flex-shrink: 0;
}

.panel-header.draggable {
  cursor: grab;
}

.panel-header.draggable:active {
  cursor: grabbing;
}

.drag-handle {
  font-size: 0.875rem;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.panel-header:hover .drag-handle {
  opacity: 1;
}

.panel-title {
  color: var(--text-color);
  max-width: 200px;
}

.panel-title.dirty {
  color: var(--orange-500);
}

.panel-header .p-button {
  height: 28px;
  min-width: 28px;
}

.panel-header .p-button.p-button-sm {
  padding: 0.25rem 0.5rem;
}

.panel-header .p-button.p-button-text {
  padding: 0.25rem;
}

/* Ensure buttons don't wrap */
.panel-header > div:last-child {
  flex-shrink: 0;
}
</style>
