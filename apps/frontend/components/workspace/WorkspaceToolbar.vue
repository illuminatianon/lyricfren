<script setup>
import { computed, ref } from 'vue';
import { useWorkspaceManager } from '../../stores/workspaceManager.js';

const emit = defineEmits([
  'new-panel',
  'reset-layout',
  'save-all',
  'close-all',
]);

const workspaceManager = useWorkspaceManager();

// Component state
const showWorkspaceMenu = ref(false);

// Computed properties
const currentWorkspace = computed(() => workspaceManager.currentWorkspace);
const hasDirtyPanels = computed(() => workspaceManager.hasDirtyPanels);
const dirtyCount = computed(() => workspaceManager.dirtyPanels.length);

// Panel type options
const panelTypes = [
  { label: 'Lyric Editor', value: 'lyric', icon: 'mdi-file-document-edit' },
  { label: 'Prompt Editor', value: 'prompt', icon: 'mdi-comment-text' },
  { label: 'Style Editor', value: 'style', icon: 'mdi-palette' },
];

// Actions
const handleNewPanel = (type) => {
  emit('new-panel', type);
};

const handleResetLayout = () => {
  emit('reset-layout');
};

const handleSaveAll = () => {
  emit('save-all');
};

const handleCloseAll = () => {
  emit('close-all');
};

// Workspace actions (stubbed for now)
const handleSaveWorkspace = () => {
  // TODO: Show save workspace dialog
  console.log('Save workspace dialog');
};

const handleLoadWorkspace = () => {
  // TODO: Show load workspace dialog
  console.log('Load workspace dialog');
};

const handleExportWorkspace = () => {
  try {
    const exportData = workspaceManager.exportWorkspace();
    const filename = `${currentWorkspace.value.name.replace(/[^a-z0-9]/gi, '_')}_workspace.json`;

    // Use helper function to download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
};

const handleImportWorkspace = () => {
  // TODO: Show import workspace dialog
  console.log('Import workspace dialog');
};
</script>

<template>
  <div class="workspace-toolbar d-flex align-center justify-space-between px-3 py-2 bg-surface border-b">
    <!-- Left Section: Panel Actions -->
    <div class="d-flex align-center ga-2">
      <!-- New Panel Button -->
      <v-btn-group
        variant="outlined"
        size="small"
      >
        <v-btn
          prepend-icon="mdi-plus"
          @click="handleNewPanel('lyric')"
        >
          New
        </v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-chevron-down"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item
              v-for="type in panelTypes"
              :key="type.value"
              @click="handleNewPanel(type.value)"
            >
              <template v-slot:prepend>
                <v-icon :icon="type.icon" />
              </template>
              <v-list-item-title>{{ type.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn-group>

      <!-- Layout Actions -->
      <v-btn
        prepend-icon="mdi-refresh"
        size="small"
        variant="outlined"
        @click="handleResetLayout"
      >
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          Reset all panel widths to auto-size
        </v-tooltip>
        Reset Layout
      </v-btn>

      <v-divider
        vertical
        class="mx-2"
      />

      <!-- Save Actions -->
      <v-btn
        prepend-icon="mdi-content-save"
        size="small"
        :color="hasDirtyPanels ? 'warning' : 'default'"
        :variant="hasDirtyPanels ? 'elevated' : 'outlined'"
        :disabled="!hasDirtyPanels"
        @click="handleSaveAll"
      >
        {{ hasDirtyPanels ? `Save All (${dirtyCount})` : 'Save All' }}
      </v-btn>

      <v-btn
        prepend-icon="mdi-close"
        size="small"
        color="error"
        variant="outlined"
        @click="handleCloseAll"
      >
        Close All
      </v-btn>
    </div>

    <!-- Center Section: Workspace Name -->
    <div class="d-flex align-center ga-2">
      <v-icon
        icon="mdi-folder"
        color="medium-emphasis"
      />
      <span class="font-weight-medium">{{ currentWorkspace.name }}</span>
      <v-badge
        v-if="hasDirtyPanels"
        :content="dirtyCount"
        color="warning"
        inline
      />
    </div>

    <!-- Right Section: Workspace Actions -->
    <div class="d-flex align-center ga-2">
      <!-- Workspace Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            size="small"
            variant="outlined"
            v-bind="props"
          />
        </template>

        <v-list>
          <v-list-item @click="handleSaveWorkspace">
            <template v-slot:prepend>
              <v-icon icon="mdi-content-save" />
            </template>
            <v-list-item-title>Save Workspace</v-list-item-title>
          </v-list-item>

          <v-list-item @click="handleLoadWorkspace">
            <template v-slot:prepend>
              <v-icon icon="mdi-folder-open" />
            </template>
            <v-list-item-title>Load Workspace</v-list-item-title>
          </v-list-item>

          <v-divider />

          <v-list-item @click="handleExportWorkspace">
            <template v-slot:prepend>
              <v-icon icon="mdi-download" />
            </template>
            <v-list-item-title>Export Workspace</v-list-item-title>
          </v-list-item>

          <v-list-item @click="handleImportWorkspace">
            <template v-slot:prepend>
              <v-icon icon="mdi-upload" />
            </template>
            <v-list-item-title>Import Workspace</v-list-item-title>
          </v-list-item>

          <v-divider />

          <v-list-item @click="() => console.log('Workspace settings')">
            <template v-slot:prepend>
              <v-icon icon="mdi-cog" />
            </template>
            <v-list-item-title>Workspace Settings</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<style scoped>
.workspace-toolbar {
  height: 48px;
  flex-shrink: 0;
  background: var(--surface-section);
}

.workspace-toolbar .p-button {
  height: 32px;
}

.workspace-toolbar .p-button.p-button-sm {
  padding: 0.375rem 0.75rem;
}

.workspace-toolbar .p-divider {
  height: 24px;
  margin: 0 0.5rem;
}

.workspace-toolbar .p-badge {
  margin-left: 0.25rem;
}
</style>
