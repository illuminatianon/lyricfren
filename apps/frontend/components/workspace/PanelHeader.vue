<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  isDirty: {
    type: Boolean,
    default: false,
  },
  primaryActions: {
    type: Array,
    default: () => [],
  },
  overflowActions: {
    type: Array,
    default: () => [],
  },
  sidebarOpen: {
    type: Boolean,
    default: false,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'sidebar-toggle',
  'drag-start',
  'drag-end',
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
  <v-toolbar
    class="panel-header"
    :class="{ 'draggable': draggable }"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    density="compact"
    flat
  >
    <!-- Drag Handle -->
    <v-icon
      v-if="draggable"
      icon="mdi-drag-horizontal"
      color="medium-emphasis"
      class="drag-handle cursor-move mr-2"
    >
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        Drag to reorder panel
      </v-tooltip>
    </v-icon>

    <!-- Title -->
    <v-toolbar-title
      class="panel-title text-truncate"
      :class="{ 'dirty': isDirty }"
      :title="title"
    >
      {{ displayTitle }}
    </v-toolbar-title>

    <v-spacer />

    <!-- Panel Actions -->
    <v-btn-group
      v-if="primaryActions.length > 0"
      variant="outlined"
      size="small"
      class="mr-2"
    >
      <v-btn
        :prepend-icon="primaryActions[0]?.icon || 'mdi-content-save'"
        :color="primaryActions[0]?.severity === 'warning' ? 'warning' : 'default'"
        :disabled="primaryActions[0]?.disabled || false"
        @click="handleActionClick(primaryActions[0])"
      >
        {{ primaryActions[ 0 ]?.label || 'Save' }}
      </v-btn>
      <v-menu v-if="[...primaryActions.slice(1), ...overflowActions].length > 0">
        <template v-slot:activator="{ props }">
          <v-btn
            icon="chevron-down"
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

    <!-- Sidebar Toggle -->
    <v-btn
      :icon="sidebarOpen ? 'mdi-chevron-right' : 'mdi-chevron-left'"
      variant="text"
      size="small"
      @click="handleSidebarToggle"
    >
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        {{ sidebarOpen ? 'Close sidebar' : 'Open sidebar' }}
      </v-tooltip>
    </v-btn>
  </v-toolbar>
</template>

<style scoped>
.panel-header {
  height: 48px;
  background: rgb(var(--v-theme-surface-variant));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
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
  color: rgb(var(--v-theme-primary));
}

.panel-header:hover .drag-handle {
  opacity: 1;
}

.panel-title {
  color: rgb(var(--v-theme-on-surface));
  max-width: 300px;
  font-weight: 600;
}

.panel-title.dirty {
  color: rgb(var(--v-theme-warning));
}

.panel-title.dirty::after {
  content: " •";
  color: rgb(var(--v-theme-warning));
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
  color: rgb(var(--v-theme-primary));
}

.panel-header .p-button.p-button-text:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

/* Ensure buttons don't wrap */
.panel-header > div:last-child {
  flex-shrink: 0;
}


</style>
