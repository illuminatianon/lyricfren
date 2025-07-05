<script setup>
import { ref, computed, watch } from 'vue';
import { useWorkspaceManager } from '../../stores/workspaceManager.js';
import PanelHeader from './PanelHeader.vue';
import PanelSidebar from './PanelSidebar.vue';

const props = defineProps({
  panel: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'close',
  'focus',
  'drag-start',
  'drag-end'
]);

const workspaceManager = useWorkspaceManager();

// Component refs
const panelElement = ref(null);
const mainContentElement = ref(null);

// Computed properties
const panelData = computed(() => props.panel.data);
const isDirty = computed(() => props.panel.isDirty);
const sidebarOpen = computed(() => props.panel.sidebarOpen);

// Panel actions
const primaryActions = computed(() => [
  {
    icon: 'pi pi-save',
    label: 'Save',
    severity: isDirty.value ? 'warning' : 'secondary',
    disabled: !isDirty.value,
    command: handleSave
  },
  {
    icon: 'pi pi-copy',
    label: 'Duplicate',
    severity: 'secondary',
    command: handleDuplicate
  }
]);

const overflowActions = computed(() => [
  {
    label: 'Export',
    icon: 'pi pi-download',
    command: handleExport
  },
  {
    label: 'Panel Settings',
    icon: 'pi pi-cog',
    command: handleSettings
  },
  { separator: true },
  {
    label: 'Close Panel',
    icon: 'pi pi-times',
    command: handleClose
  }
]);

// Action handlers
const handleSave = async () => {
  try {
    await workspaceManager.savePanelState(props.panel.id);
    console.log('Panel saved:', props.panel.title);
  } catch (error) {
    console.error('Save failed:', error);
  }
};

const handleDuplicate = () => {
  const newPanelId = workspaceManager.duplicatePanel(props.panel.id);
  if (newPanelId) {
    console.log('Panel duplicated:', newPanelId);
  }
};

const handleExport = () => {
  // TODO: Implement panel-specific export
  console.log('Export panel:', props.panel.id);
};

const handleSettings = () => {
  // TODO: Show panel settings dialog
  console.log('Panel settings:', props.panel.id);
};

const handleClose = () => {
  emit('close', props.panel.id);
};

const handleFocus = () => {
  emit('focus', props.panel.id);
};

const handleSidebarToggle = () => {
  workspaceManager.togglePanelSidebar(props.panel.id);
};

// Content change handling
const handleContentChange = (newContent) => {
  workspaceManager.updatePanelData(props.panel.id, { content: newContent });
};

const handleMetadataChange = (field, value) => {
  const metadata = { ...panelData.value.metadata, [field]: value };
  workspaceManager.updatePanelData(props.panel.id, { metadata });
};

// Drag and drop
const handleDragStart = (event) => {
  emit('drag-start', event);
};

const handleDragEnd = (event) => {
  emit('drag-end', event);
};

// Focus management
watch(() => props.isActive, (isActive) => {
  if (isActive && mainContentElement.value) {
    // Focus the main content when panel becomes active
    const focusableElement = mainContentElement.value.querySelector('input, textarea, [contenteditable], [tabindex]:not([tabindex="-1"])');
    if (focusableElement) {
      focusableElement.focus();
    }
  }
});

// Get editor component based on panel type
const getEditorComponent = () => {
  switch (props.panel.type) {
    case 'lyric':
      return 'LyricEditorInstance';
    case 'prompt':
      return 'PromptEditorInstance';
    case 'style':
      return 'StyleEditorInstance';
    default:
      return 'div'; // Fallback
  }
};

// Get sidebar configuration based on panel type
const getSidebarConfig = () => {
  switch (props.panel.type) {
    case 'lyric':
      return {
        standard: [
          { component: 'MetadataWidget', order: 1 },
          { component: 'TagsWidget', order: 2 },
          { component: 'ExportWidget', order: 4 }
        ],
        custom: [
          { component: 'MeterSettingsWidget', order: 3 },
          { component: 'LLMAssistantWidget', order: 5 }
        ]
      };
    case 'prompt':
      return {
        standard: [
          { component: 'MetadataWidget', order: 1 },
          { component: 'TagsWidget', order: 2 },
          { component: 'HistoryWidget', order: 6 }
        ],
        custom: [
          { component: 'StyleSelectorWidget', order: 3 },
          { component: 'TemplateLibraryWidget', order: 4 },
          { component: 'GenerationSettingsWidget', order: 5 }
        ]
      };
    case 'style':
      return {
        standard: [
          { component: 'MetadataWidget', order: 1 },
          { component: 'TagsWidget', order: 2 },
          { component: 'ExportWidget', order: 5 }
        ],
        custom: [
          { component: 'StyleTestingWidget', order: 3 },
          { component: 'ExampleLibraryWidget', order: 4 }
        ]
      };
    default:
      return { standard: [], custom: [] };
  }
};
</script>

<template>
  <Card
    ref="panelElement"
    class="editor-panel h-full"
    :class="{
      'active': isActive,
      'dirty': isDirty,
      'sidebar-open': sidebarOpen
    }"
    @click="handleFocus"
  >
    <template #header>
      <PanelHeader
        :title="panel.data.metadata.title"
        :is-dirty="isDirty"
        :primary-actions="primaryActions"
        :overflow-actions="overflowActions"
        :sidebar-open="sidebarOpen"
        :draggable="true"
        @sidebar-toggle="handleSidebarToggle"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      />
    </template>

    <template #content>
      <div class="panel-body h-full flex">
        <!-- Main Content -->
        <div
          ref="mainContentElement"
          class="main-content flex-1"
          :class="{ 'with-sidebar': sidebarOpen }"
        >
          <!-- Dynamic Editor Component -->
          <component
            :is="getEditorComponent()"
            :panel-data="panelData"
            :is-active="isActive"
            @content-change="handleContentChange"
            @metadata-change="handleMetadataChange"
          />

          <!-- Fallback for unimplemented editors -->
          <div
            v-if="!['lyric', 'prompt', 'style'].includes(panel.type)"
            class="fallback-editor h-full flex align-items-center justify-content-center flex-column"
          >
            <i class="pi pi-exclamation-triangle text-4xl text-color-secondary mb-3"></i>
            <h4 class="text-color-secondary mb-2">Editor Not Implemented</h4>
            <p class="text-color-secondary">{{ panel.type }} editor is not yet available</p>
          </div>
        </div>

        <!-- Sidebar -->
        <PanelSidebar
          v-if="sidebarOpen"
          :panel="panel"
          :config="getSidebarConfig()"
          @close="handleSidebarToggle"
          @data-change="(path, value) => workspaceManager.updatePanelData(panel.id, { [path]: value })"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.editor-panel {
  height: 100%;
  border-radius: 8px;
  border: 1px solid var(--surface-500);
  margin: 0 4px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.editor-panel:first-child {
  margin-left: 8px;
}

.editor-panel:last-child {
  margin-right: 8px;
}

.editor-panel.active {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 0 0 2px var(--primary-200);
  transform: translateY(-1px);
}

.editor-panel.dirty {
  border-top: 3px solid var(--orange-400);
}

.editor-panel.sidebar-open {
  min-width: 600px;
}

.panel-body {
  height: calc(100% - 48px); /* Account for header height */
  overflow: hidden;
  background: white;
}

.main-content {
  min-width: 0; /* Allow flex child to shrink */
  height: 100%;
  overflow: hidden;
  background: white;
}

.main-content.with-sidebar {
  border-right: 1px solid var(--surface-200);
}

.fallback-editor {
  background: var(--surface-50);
  color: var(--text-color-secondary);
}

/* Remove default card styling */
:deep(.p-card) {
  height: 100%;
  box-shadow: none;
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-card-header) {
  padding: 0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

:deep(.p-card-content) {
  padding: 0;
  height: calc(100% - 48px);
  background: white;
}

:deep(.p-card-body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
}
</style>
