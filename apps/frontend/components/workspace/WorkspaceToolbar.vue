<script setup>
import { ref, computed } from 'vue';
import { useWorkspaceManager } from '../../stores/workspaceManager.js';

const emit = defineEmits([
  'new-panel',
  'reset-layout', 
  'save-all',
  'close-all'
]);

const workspaceManager = useWorkspaceManager();

// Component state
const showNewPanelMenu = ref(false);
const showWorkspaceMenu = ref(false);

// Computed properties
const currentWorkspace = computed(() => workspaceManager.currentWorkspace);
const hasDirtyPanels = computed(() => workspaceManager.hasDirtyPanels);
const dirtyCount = computed(() => workspaceManager.dirtyPanels.length);

// Panel type options
const panelTypes = [
  { label: 'Lyric Editor', value: 'lyric', icon: 'pi pi-file-edit' },
  { label: 'Prompt Editor', value: 'prompt', icon: 'pi pi-comment' },
  { label: 'Style Editor', value: 'style', icon: 'pi pi-palette' }
];

// Actions
const handleNewPanel = (type) => {
  emit('new-panel', type);
  showNewPanelMenu.value = false;
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
  <div class="workspace-toolbar flex align-items-center justify-content-between px-3 py-2 surface-section border-bottom-1 border-surface">
    <!-- Left Section: Panel Actions -->
    <div class="flex align-items-center gap-2">
      <!-- New Panel Button -->
      <div class="relative">
        <Button
          icon="pi pi-plus"
          label="New"
          size="small"
          @click="showNewPanelMenu = !showNewPanelMenu"
          aria-haspopup="true"
          aria-controls="new-panel-menu"
        />
        
        <Menu
          id="new-panel-menu"
          ref="newPanelMenu"
          :model="panelTypes.map(type => ({
            label: type.label,
            icon: type.icon,
            command: () => handleNewPanel(type.value)
          }))"
          :popup="true"
          v-model:visible="showNewPanelMenu"
        />
      </div>
      
      <!-- Layout Actions -->
      <Button
        icon="pi pi-refresh"
        label="Reset Layout"
        size="small"
        severity="secondary"
        @click="handleResetLayout"
        v-tooltip="'Reset all panel widths to auto-size'"
      />
      
      <Divider layout="vertical" />
      
      <!-- Save Actions -->
      <Button
        icon="pi pi-save"
        :label="hasDirtyPanels ? `Save All (${dirtyCount})` : 'Save All'"
        size="small"
        :severity="hasDirtyPanels ? 'warning' : 'secondary'"
        :disabled="!hasDirtyPanels"
        @click="handleSaveAll"
      />
      
      <Button
        icon="pi pi-times"
        label="Close All"
        size="small"
        severity="danger"
        outlined
        @click="handleCloseAll"
      />
    </div>
    
    <!-- Center Section: Workspace Name -->
    <div class="flex align-items-center gap-2">
      <i class="pi pi-folder text-color-secondary"></i>
      <span class="font-medium">{{ currentWorkspace.name }}</span>
      <Badge 
        v-if="hasDirtyPanels"
        :value="dirtyCount"
        severity="warning"
        size="small"
      />
    </div>
    
    <!-- Right Section: Workspace Actions -->
    <div class="flex align-items-center gap-2">
      <!-- Workspace Menu -->
      <div class="relative">
        <Button
          icon="pi pi-ellipsis-v"
          size="small"
          severity="secondary"
          outlined
          @click="showWorkspaceMenu = !showWorkspaceMenu"
          aria-haspopup="true"
          aria-controls="workspace-menu"
        />
        
        <Menu
          id="workspace-menu"
          ref="workspaceMenu"
          :model="[
            {
              label: 'Save Workspace',
              icon: 'pi pi-save',
              command: handleSaveWorkspace
            },
            {
              label: 'Load Workspace',
              icon: 'pi pi-folder-open',
              command: handleLoadWorkspace
            },
            { separator: true },
            {
              label: 'Export Workspace',
              icon: 'pi pi-download',
              command: handleExportWorkspace
            },
            {
              label: 'Import Workspace',
              icon: 'pi pi-upload',
              command: handleImportWorkspace
            },
            { separator: true },
            {
              label: 'Workspace Settings',
              icon: 'pi pi-cog',
              command: () => console.log('Workspace settings')
            }
          ]"
          :popup="true"
          v-model:visible="showWorkspaceMenu"
        />
      </div>
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
