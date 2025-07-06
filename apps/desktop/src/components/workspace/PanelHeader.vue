<script setup>
import { computed, ref } from 'vue';
import InlineEditor from '../common/InlineEditor.vue';

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
  'close',
  'drag-start',
  'drag-end',
  'title-change',
]);

// Component state
const showOverflowMenu = ref(false);

// Computed properties
const displayTitle = computed(() => {
  return props.title;
});

// Action handlers
const handleSidebarToggle = () => {
  emit('sidebar-toggle');
};

const handleClose = () => {
  console.log('PanelHeader: handleClose called');
  emit('close');
};

const handleTitleChange = (newTitle) => {
  emit('title-change', newTitle);
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
    <template #prepend>
      <v-btn
        size="small"
        class="sidebar-toggle"
        @click="handleSidebarToggle"
      >
        <v-icon :icon="sidebarOpen ? 'mdi-close' : 'mdi-menu'" />
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          {{ sidebarOpen ? 'Close sidebar' : 'Open sidebar' }}
        </v-tooltip>
      </v-btn>
    </template>

    <!-- Title -->
    <v-toolbar-title class="panel-title flex-grow-1">
      <div class="d-flex align-center">
        <InlineEditor
          :model-value="title"
          placeholder="Panel title..."
          :max-length="50"
          class="flex-grow-1"
          :class="{ 'text-warning': isDirty }"
          @update:model-value="handleTitleChange"
        />
        <span v-if="isDirty" class="text-warning font-weight-bold ml-2">•</span>
      </div>
    </v-toolbar-title>

    <v-spacer />

    <v-toolbar-items>
      <!-- Panel Actions -->
      <template v-if="primaryActions.length > 0">
        <!-- Primary Save Button -->
        <v-btn
          :prepend-icon="primaryActions[0]?.icon || 'mdi-content-save'"
          :color="primaryActions[0]?.severity === 'warning' ? 'warning' : 'default'"
          :disabled="primaryActions[0]?.disabled || false"
          variant="outlined"
          size="small"
          class="mr-1"
          @click="handleActionClick(primaryActions[0])"
        >
          {{ primaryActions[ 0 ]?.label || 'Save' }}
        </v-btn>

        <!-- More Actions Menu -->
        <v-menu v-if="[...primaryActions.slice(1), ...overflowActions].length > 0">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              size="small"
              variant="outlined"
              class="mr-2"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
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
      </template>

      <!-- Close Panel Button -->
      <v-btn
        size="small"
        variant="text"
        @click="handleClose"
        :color="isDirty ? 'warning' : 'default'"
      >
        <v-icon>mdi-close</v-icon>
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          {{ isDirty ? 'Close panel (unsaved changes)' : 'Close panel' }}
        </v-tooltip>
      </v-btn>

    </v-toolbar-items>

  </v-toolbar>
</template>

<style scoped>
.panel-header {
  height: 48px !important;
  background: rgb(var(--v-theme-surface-variant)) !important;
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

.sidebar-toggle {
  font-size: 0.875rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  color: rgb(var(--v-theme-primary));
}

.panel-header:hover .sidebar-toggle {
  opacity: 1;
}

.panel-title {
  color: rgb(var(--v-theme-on-surface));
  max-width: 300px;
  font-weight: 600;
}


.panel-header .p-button {
  height: 32px;
  min-width: 32px;
}

/* Ensure buttons don't wrap */
.panel-header > div:last-child {
  flex-shrink: 0;
}


</style>
