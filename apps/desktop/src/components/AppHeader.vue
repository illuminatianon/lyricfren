<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useWorkspaceManager } from '../stores/workspaceManager.js';

const route = useRoute();
const workspaceManager = useWorkspaceManager();

// Component state
const showWorkspaceMenu = ref(false);

// Computed properties
const currentWorkspace = computed(() => workspaceManager.currentWorkspace);
const hasDirtyPanels = computed(() => workspaceManager.hasDirtyPanels);
const dirtyCount = computed(() => workspaceManager.dirtyPanels.length);
const isWorkspaceRoute = computed(() => route.name === 'workspace');

// Panel type options
const panelTypes = [
  { label: 'Lyric Editor', value: 'lyric', icon: 'mdi-file-document-edit' },
  { label: 'Prompt Editor', value: 'prompt', icon: 'mdi-comment-text' },
  { label: 'Style Editor', value: 'style', icon: 'mdi-palette' },
];

// Workspace actions
const handleNewPanel = (type) => {
  workspaceManager.addPanel(type, {
    title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    content: '',
  });
};

const handleResetLayout = () => {
  workspaceManager.resetPanelWidths();
};

const handleSaveAll = () => {
  workspaceManager.saveAllPanels();
};

const handleCloseAll = () => {
  workspaceManager.closeAllPanels();
};

// Workspace actions (stubbed for now)
const handleSaveWorkspace = () => {
  console.log('Save workspace dialog');
};

const handleLoadWorkspace = () => {
  console.log('Load workspace dialog');
};

const handleExportWorkspace = () => {
  console.log('Export workspace');
};

const handleImportWorkspace = () => {
  console.log('Import workspace dialog');
};
</script>

<template>
  <v-app-bar
    elevation="1"
    color="surface"
    app
  >
    <div class="d-flex justify-space-between align-center w-100 px-4">
      <!-- Left Section: Workspace Name -->
      <div class="d-flex align-center">
        <v-icon
          icon="mdi-folder"
          color="medium-emphasis"
          class="mr-2"
        />
        <div class="text-h5 font-weight-bold">{{ currentWorkspace.name }}</div>
        <v-badge
          v-if="hasDirtyPanels"
          :content="dirtyCount"
          color="warning"
          inline
          class="ml-2"
        />
      </div>

      <!-- Center Section: Workspace Controls (only show on workspace route) -->
      <div
        v-if="isWorkspaceRoute"
        class="d-flex align-center ga-2"
      >
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
          {{ hasDirtyPanels ? `Save (${dirtyCount})` : 'Save All' }}
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

      <!-- Right Section: Workspace Menu -->
      <div class="d-flex align-center ga-2">
        <v-btn
          v-if="isWorkspaceRoute"
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

        <!-- Workspace Menu -->
        <v-menu v-if="isWorkspaceRoute">
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
                <v-icon icon="mdi-export" />
              </template>
              <v-list-item-title>Export Workspace</v-list-item-title>
            </v-list-item>

            <v-list-item @click="handleImportWorkspace">
              <template v-slot:prepend>
                <v-icon icon="mdi-import" />
              </template>
              <v-list-item-title>Import Workspace</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-app-bar>
</template>
