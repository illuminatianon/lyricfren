<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWorkspaceManager } from '../../stores/workspaceManager.js';
import BaseEditorPanel from './BaseEditorPanel.vue';
import WorkspaceToolbar from './WorkspaceToolbar.vue';

const workspaceManager = useWorkspaceManager();
const workspaceContainer = ref(null);

// Computed properties
const activePanels = computed(() => workspaceManager.activePanels);
const currentWorkspace = computed(() => workspaceManager.currentWorkspace);

// Panel width calculations
const getPanelStyle = (panel) => {
  const manualWidth = currentWorkspace.value.layout.panelWidths[panel.id];

  if (manualWidth) {
    return {
      width: `${manualWidth}px`,
      flexShrink: 0,
      flexGrow: 0
    };
  }

  // Auto-sizing with flexbox
  return {
    flex: 1,
    minWidth: '300px'
  };
};

// Drag and drop for panel reordering
const draggedPanel = ref(null);
const dragOverPanel = ref(null);

const handleDragStart = (event, panelId) => {
  draggedPanel.value = panelId;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', panelId);
};

const handleDragOver = (event, panelId) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  dragOverPanel.value = panelId;
};

const handleDragLeave = () => {
  dragOverPanel.value = null;
};

const handleDrop = (event, targetPanelId) => {
  event.preventDefault();

  const sourcePanelId = draggedPanel.value;
  if (sourcePanelId && sourcePanelId !== targetPanelId) {
    const currentOrder = [...currentWorkspace.value.layout.panelOrder];
    const sourceIndex = currentOrder.indexOf(sourcePanelId);
    const targetIndex = currentOrder.indexOf(targetPanelId);

    if (sourceIndex > -1 && targetIndex > -1) {
      // Remove source panel and insert at target position
      currentOrder.splice(sourceIndex, 1);
      const newTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      currentOrder.splice(newTargetIndex, 0, sourcePanelId);

      workspaceManager.reorderPanels(currentOrder);
    }
  }

  draggedPanel.value = null;
  dragOverPanel.value = null;
};

const handleDragEnd = () => {
  draggedPanel.value = null;
  dragOverPanel.value = null;
};

// Panel resizing
const resizingPanel = ref(null);
const resizeStartX = ref(0);
const resizeStartWidth = ref(0);
const currentResizeWidth = ref(0);
let resizeAnimationFrame = null;

const startResize = (event, panelId) => {
  resizingPanel.value = panelId;
  resizeStartX.value = event.clientX;

  const panel = currentWorkspace.value.panels[panelId];
  const currentWidth = currentWorkspace.value.layout.panelWidths[panelId];

  if (currentWidth) {
    resizeStartWidth.value = currentWidth;
  } else {
    // Calculate current auto width
    const panelElement = event.target.closest('.editor-panel-container');
    resizeStartWidth.value = panelElement ? panelElement.offsetWidth : 400;
  }

  currentResizeWidth.value = resizeStartWidth.value;

  // Add visual feedback class
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';

  document.addEventListener('mousemove', handleResize, { passive: true });
  document.addEventListener('mouseup', stopResize);
  event.preventDefault();
};

const handleResize = (event) => {
  if (!resizingPanel.value) return;

  // Cancel previous animation frame
  if (resizeAnimationFrame) {
    cancelAnimationFrame(resizeAnimationFrame);
  }

  // Use requestAnimationFrame to throttle updates
  resizeAnimationFrame = requestAnimationFrame(() => {
    const deltaX = event.clientX - resizeStartX.value;
    const newWidth = Math.max(250, resizeStartWidth.value + deltaX); // Min width 250px

    currentResizeWidth.value = newWidth;

    // Update the DOM directly for immediate visual feedback
    const panelElement = document.querySelector(`[data-panel-id="${resizingPanel.value}"]`);
    if (panelElement) {
      panelElement.style.width = `${newWidth}px`;
      panelElement.style.flexShrink = '0';
      panelElement.style.flexGrow = '0';
    }
  });
};

const stopResize = () => {
  if (resizeAnimationFrame) {
    cancelAnimationFrame(resizeAnimationFrame);
    resizeAnimationFrame = null;
  }

  // Update the workspace manager with final width
  if (resizingPanel.value && currentResizeWidth.value) {
    workspaceManager.setPanelWidth(resizingPanel.value, currentResizeWidth.value);
  }

  resizingPanel.value = null;

  // Reset cursor and selection
  document.body.style.cursor = '';
  document.body.style.userSelect = '';

  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
};

// Keyboard shortcuts
const handleKeydown = (event) => {
  // Ctrl/Cmd + S: Save all
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    workspaceManager.saveAllPanels();
  }

  // Ctrl/Cmd + W: Close active panel
  if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
    event.preventDefault();
    if (currentWorkspace.value.ui.activePanel) {
      workspaceManager.removePanel(currentWorkspace.value.ui.activePanel);
    }
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);

  // Initialize with a default panel if none exist
  if (activePanels.value.length === 0) {
    workspaceManager.addPanel('lyric', {
      title: 'New Lyric',
      content: ''
    });
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);

  // Clean up any pending animation frames
  if (resizeAnimationFrame) {
    cancelAnimationFrame(resizeAnimationFrame);
  }

  // Reset cursor and selection
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

// Panel actions
const handlePanelClose = (panelId) => {
  workspaceManager.removePanel(panelId);
};

const handlePanelFocus = (panelId) => {
  workspaceManager.setActivePanel(panelId);
};

const handleNewPanel = (type = 'lyric') => {
  workspaceManager.addPanel(type);
};
</script>

<template>
  <div class="editor-workspace h-100 d-flex flex-column">
    <!-- Workspace Toolbar -->
    <WorkspaceToolbar
      @new-panel="handleNewPanel"
      @reset-layout="workspaceManager.resetPanelWidths"
      @save-all="workspaceManager.saveAllPanels"
      @close-all="workspaceManager.closeAllPanels"
    />

    <!-- Panel Container -->
    <div
      ref="workspaceContainer"
      class="panel-container flex-grow-1 d-flex"
      :class="{ 'no-panels': activePanels.length === 0 }"
    >
      <!-- Empty State -->
      <div
        v-if="activePanels.length === 0"
        class="empty-workspace d-flex align-center justify-center flex-column w-100"
      >
        <v-icon icon="mdi-file-document-outline" size="96" color="medium-emphasis" class="mb-4" />
        <h3 class="text-medium-emphasis mb-2">No panels open</h3>
        <p class="text-medium-emphasis mb-4">Create a new panel to get started</p>
        <v-btn
          prepend-icon="mdi-plus"
          color="primary"
          @click="handleNewPanel('lyric')"
        >
          New Lyric Editor
        </v-btn>
      </div>

      <!-- Active Panels -->
      <template v-else>


        <div
          v-for="(panel, index) in activePanels"
          :key="panel.id"
          :data-panel-id="panel.id"
          class="editor-panel-container"
          :style="getPanelStyle(panel)"
          :class="{
            'active': currentWorkspace.ui.activePanel === panel.id,
            'drag-over': dragOverPanel === panel.id
          }"
          @dragover="handleDragOver($event, panel.id)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, panel.id)"
        >
          <BaseEditorPanel
            :panel="panel"
            :is-active="currentWorkspace.ui.activePanel === panel.id"
            @close="handlePanelClose"
            @focus="handlePanelFocus"
            @drag-start="handleDragStart($event, panel.id)"
            @drag-end="handleDragEnd"
          />

          <!-- Resize Handle -->
          <div
            v-if="index < activePanels.length - 1"
            class="resize-handle"
            @mousedown="startResize($event, panel.id)"
          >
            <div class="resize-handle-line"></div>
          </div>
        </div>
      </template>
    </div>

    <!-- Status Bar (optional) -->
    <div
      v-if="currentWorkspace.ui.statusBarVisible"
      class="workspace-status-bar d-flex align-center justify-space-between px-3 py-2 bg-surface border-t"
    >
      <div class="d-flex align-center ga-2">
        <span class="text-caption text-medium-emphasis">
          {{ activePanels.length }} panel{{ activePanels.length !== 1 ? 's' : '' }}
        </span>
        <span
          v-if="workspaceManager.hasDirtyPanels"
          class="text-sm text-orange-500"
        >
          • {{ workspaceManager.dirtyPanels.length }} unsaved
        </span>
      </div>

      <div class="flex align-items-center gap-2">
        <span class="text-sm text-color-secondary">
          {{ currentWorkspace.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-workspace {
  height: 100%;
  overflow: hidden;
}

.panel-container {
  min-height: 0; /* Allow flex children to shrink */
  gap: 0;
  background: var(--surface-50);
  padding: 8px 0;
}

.panel-container.no-panels {
  background: var(--surface-50);
}

.empty-workspace {
  width: 100%;
  height: 100%;
}

.editor-panel-container {
  position: relative;
  min-width: 250px;
  height: 100%;
  transition: all 0.2s ease;
}

.editor-panel-container.active {
  z-index: 1;
}

.editor-panel-container.drag-over {
  background: var(--primary-color-text);
  opacity: 0.1;
}

.resize-handle {
  position: absolute;
  top: 50%;
  right: -6px;
  width: 12px;
  height: 60px;
  cursor: col-resize;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.editor-panel-container:hover .resize-handle {
  opacity: 1;
}

.resize-handle:hover .resize-handle-line {
  background: var(--primary-400);
  width: 3px;
}

.resize-handle-line {
  width: 2px;
  height: 30px;
  background: var(--surface-400);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.workspace-status-bar {
  height: 32px;
  flex-shrink: 0;
}
</style>
