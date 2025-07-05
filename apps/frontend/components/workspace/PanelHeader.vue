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
  <v-card-title
    class="panel-header d-flex align-center justify-space-between px-3 py-2"
    :class="{ 'draggable': draggable }"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Left Section: Title and Drag Handle -->
    <div class="d-flex align-center ga-2 flex-grow-1" style="min-width: 0">
      <!-- Drag Handle -->
      <v-icon
        v-if="draggable"
        icon="mdi-drag-horizontal"
        color="medium-emphasis"
        class="drag-handle cursor-move"
      >
        <v-tooltip activator="parent" location="bottom">
          Drag to reorder panel
        </v-tooltip>
      </v-icon>

      <!-- Title -->
      <h3
        class="panel-title text-h6 font-weight-medium ma-0 text-truncate"
        :class="{ 'dirty': isDirty }"
        :title="title"
      >
        {{ displayTitle }}
      </h3>
    </div>

    <!-- Center Section: Panel Actions -->
    <div class="d-flex align-center ga-2">
      <!-- Panel Actions Split Button -->
      <v-btn-group v-if="primaryActions.length > 0" variant="outlined" size="small">
        <v-btn
          :prepend-icon="primaryActions[0]?.icon || 'mdi-content-save'"
          :color="primaryActions[0]?.severity === 'warning' ? 'warning' : 'default'"
          :disabled="primaryActions[0]?.disabled || false"
          @click="handleActionClick(primaryActions[0])"
        >
          {{ primaryActions[0]?.label || 'Save' }}
        </v-btn>
        <v-menu v-if="[...primaryActions.slice(1), ...overflowActions].length > 0">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-chevron-down"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item
              v-for="action in [...primaryActions.slice(1), ...overflowActions]"
              :key="action.label"
              @click="handleActionClick(action)"
            >
              <template v-slot:prepend>
                <v-icon :icon="action.icon" />
              </template>
              <v-list-item-title>{{ action.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn-group>
    </div>

    <!-- Right Section: Controls -->
    <div class="d-flex align-center ga-1">
      <!-- Sidebar Toggle -->
      <v-btn
        :icon="sidebarOpen ? 'mdi-chevron-right' : 'mdi-chevron-left'"
        variant="text"
        size="small"
        @click="handleSidebarToggle"
      >
        <v-tooltip activator="parent" location="bottom">
          {{ sidebarOpen ? 'Close sidebar' : 'Open sidebar' }}
        </v-tooltip>
      </v-btn>
    </div>
  </v-card-title>
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
