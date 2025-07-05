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

    <!-- Left Section: Panel Actions -->
    <div class="flex align-items-center gap-2">
      <!-- Panel Actions Split Button -->
      <SplitButton
        :icon="primaryActions[0]?.icon || 'pi pi-save'"
        :label="primaryActions[0]?.label || 'Save'"
        :severity="primaryActions[0]?.severity || 'secondary'"
        :disabled="primaryActions[0]?.disabled || false"
        size="small"
        :model="[...primaryActions.slice(1), ...overflowActions].map(action => ({
          ...action,
          command: () => handleActionClick(action)
        }))"
        @click="handleActionClick(primaryActions[0])"
      />
    </div>

    <!-- Right Section: Controls -->
    <div class="flex align-items-center gap-1">
      <!-- Sidebar Toggle -->
      <Button
        :icon="sidebarOpen ? 'pi pi-angle-right' : 'pi pi-angle-left'"
        severity="secondary"
        size="small"
        text
        @click="handleSidebarToggle"
        v-tooltip="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
      />
    </div>
  </div>
</template>

<style scoped>
.panel-header {
  height: 48px;
  background: var(--blue-50);
  border-bottom: 1px solid var(--blue-100);
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.panel-header.draggable {
  cursor: grab;
}

.panel-header.draggable:active {
  cursor: grabbing;
}

.drag-handle {
  font-size: 0.875rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  color: var(--blue-600);
}

.panel-header:hover .drag-handle {
  opacity: 1;
}

.panel-title {
  color: var(--blue-800);
  max-width: 300px;
  font-weight: 600;
}

.panel-title.dirty {
  color: var(--orange-600);
}

.panel-title.dirty::after {
  content: " •";
  color: var(--orange-500);
  font-weight: bold;
}

.panel-header .p-button {
  height: 32px;
  min-width: 32px;
}

.panel-header .p-button.p-button-sm {
  padding: 0.375rem 0.75rem;
}

.panel-header .p-button.p-button-text {
  padding: 0.375rem;
  color: var(--blue-700);
}

.panel-header .p-button.p-button-text:hover {
  background: var(--blue-100);
}

/* Ensure buttons don't wrap */
.panel-header > div:last-child {
  flex-shrink: 0;
}

/* Split button styling */
.panel-header :deep(.p-splitbutton) {
  background: var(--surface-0);
  border: 1px solid var(--blue-200);
}

.panel-header :deep(.p-splitbutton .p-button) {
  background: transparent;
  border: none;
  color: var(--blue-700);
}

.panel-header :deep(.p-splitbutton .p-button:hover) {
  background: var(--blue-100);
}
</style>
