import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { generateId } from '../utils/helpers.js';
import workspaceService from '../services/workspaceService.js';

export const useWorkspaceManager = defineStore('workspaceManager', () => {
  // Current workspace state - using reactive for deep reactivity
  const currentWorkspace = reactive({
    id: generateId(),
    name: 'Untitled Workspace',
    description: '',
    created: new Date(),
    modified: new Date(),
    version: '1.0.0',

    layout: {
      panelOrder: [],
      panelWidths: {},
      globalSidebarWidth: 300,
      workspaceWidth: 0,
      resetToAuto: true,
    },

    panels: {},

    ui: {
      activePanel: null,
      workspaceToolbarVisible: true,
      statusBarVisible: false,
    },
  });

  // Computed properties
  const activePanels = computed(() => {
    return currentWorkspace.layout.panelOrder.map(id =>
      currentWorkspace.panels[ id ],
    ).filter(Boolean);
  });

  const dirtyPanels = computed(() => {
    return Object.values(currentWorkspace.panels).filter(panel => panel.isDirty);
  });

  const hasDirtyPanels = computed(() => dirtyPanels.value.length > 0);

  // Panel management
  const addPanel = (type, data = {}) => {
    const panelId = generateId();
    currentWorkspace.panels[ panelId ] = {
      id: panelId,
      type,
      title: data.title || `New ${type}`,
      width: null, // null means auto-size
      sidebarOpen: false,
      sidebarWidth: currentWorkspace.layout.globalSidebarWidth,
      data: {
        metadata: {
          title: data.title || `New ${type}`,
          description: '',
          created: new Date(),
          modified: new Date(),
          author: null,
        },
        tags: [],
        history: [],
        content: data.content || '',
        settings: data.settings || {},
        ...data,
      },
      isDirty: false,
      lastSaved: null,
      scrollPosition: 0,
      cursorPosition: null,
      sidebarConfig: {
        activeTab: null,
        collapsedSections: [],
        componentStates: {},
      },
    };
    currentWorkspace.layout.panelOrder.push(panelId);
    currentWorkspace.ui.activePanel = panelId;
    updateWorkspaceModified();

    return panelId;
  };

  const removePanel = async (panelId) => {
    const panel = currentWorkspace.panels[ panelId ];
    if (!panel) return false;

    // Check for unsaved changes
    if (panel.isDirty) {
      const confirmed = confirm(`Panel "${panel.title}" has unsaved changes. Close anyway?`);
      if (!confirmed) return false;
    }

    // Remove from panels and order
    delete currentWorkspace.panels[ panelId ];
    const orderIndex = currentWorkspace.layout.panelOrder.indexOf(panelId);
    if (orderIndex > -1) {
      currentWorkspace.layout.panelOrder.splice(orderIndex, 1);
    }

    // Remove width override
    delete currentWorkspace.layout.panelWidths[ panelId ];

    // Update active panel
    if (currentWorkspace.ui.activePanel === panelId) {
      const remainingPanels = currentWorkspace.layout.panelOrder;
      currentWorkspace.ui.activePanel = remainingPanels.length > 0 ? remainingPanels[ 0 ] : null;
    }

    updateWorkspaceModified();
    return true;
  };

  const reorderPanels = (newOrder) => {
    currentWorkspace.layout.panelOrder = [...newOrder];
    updateWorkspaceModified();
  };

  const duplicatePanel = (panelId) => {
    const originalPanel = currentWorkspace.panels[ panelId ];
    if (!originalPanel) return null;

    const newPanelId = generateId();
    currentWorkspace.panels[ newPanelId ] = {
      ...JSON.parse(JSON.stringify(originalPanel)), // Deep clone
      id: newPanelId,
      title: `${originalPanel.title} (Copy)`,
      data: {
        ...originalPanel.data,
        metadata: {
          ...originalPanel.data.metadata,
          title: `${originalPanel.data.metadata.title} (Copy)`,
          created: new Date(),
          modified: new Date(),
        },
      },
      isDirty: true,
      lastSaved: null,
    };

    // Insert after original panel
    const originalIndex = currentWorkspace.layout.panelOrder.indexOf(panelId);
    currentWorkspace.layout.panelOrder.splice(originalIndex + 1, 0, newPanelId);

    updateWorkspaceModified();
    return newPanelId;
  };

  // Layout management
  const setPanelWidth = (panelId, width) => {
    if (width === null || width === undefined) {
      delete currentWorkspace.layout.panelWidths[ panelId ];
    } else {
      currentWorkspace.layout.panelWidths[ panelId ] = width;
    }
    currentWorkspace.layout.resetToAuto = false;
    updateWorkspaceModified();
  };

  const resetPanelWidths = () => {
    currentWorkspace.layout.panelWidths = {};
    currentWorkspace.layout.resetToAuto = true;
    updateWorkspaceModified();
  };

  const togglePanelSidebar = (panelId) => {
    const panel = currentWorkspace.panels[ panelId ];
    if (panel) {
      panel.sidebarOpen = !panel.sidebarOpen;
      updateWorkspaceModified();
    }
  };

  const setPanelSidebarWidth = (panelId, width) => {
    const panel = currentWorkspace.panels[ panelId ];
    if (panel) {
      panel.sidebarWidth = width;
      updateWorkspaceModified();
    }
  };

  // State tracking
  const markPanelDirty = (panelId, isDirty = true) => {
    const panel = currentWorkspace.panels[ panelId ];
    if (panel) {
      panel.isDirty = isDirty;
      if (isDirty) {
        panel.data.metadata.modified = new Date();
      }
      updateWorkspaceModified();
    }
  };

  const updatePanelData = (panelId, data) => {
    const panel = currentWorkspace.panels[ panelId ];
    if (panel) {
      Object.assign(panel.data, data);
      markPanelDirty(panelId, true);
    }
  };

  const savePanelState = async (panelId) => {
    const panel = currentWorkspace.panels[ panelId ];
    if (panel) {
      // TODO: Implement actual saving logic
      console.log('STUB: Saving panel state', panelId);
      panel.isDirty = false;
      panel.lastSaved = new Date();
      updateWorkspaceModified();
    }
  };

  const setActivePanel = (panelId) => {
    if (currentWorkspace.panels[ panelId ]) {
      currentWorkspace.ui.activePanel = panelId;
    }
  };

  // Workspace metadata
  const updateWorkspaceMetadata = (metadata) => {
    Object.assign(currentWorkspace, metadata);
    updateWorkspaceModified();
  };

  const updateWorkspaceModified = () => {
    currentWorkspace.modified = new Date();
    scheduleAutoSave();
  };

  // Auto-save functionality
  let autoSaveTimeout = null;
  const autoSaveDelay = 2000; // 2 seconds

  const scheduleAutoSave = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    autoSaveTimeout = setTimeout(() => {
      saveWorkspace();
    }, autoSaveDelay);
  };

  // Persistence
  const saveWorkspace = async (name) => {
    try {
      if (name) {
        currentWorkspace.name = name;
      }

      updateWorkspaceModified();

      // Save to file system
      const workspaceId = await workspaceService.saveWorkspace(currentWorkspace);
      console.log('Workspace saved successfully:', currentWorkspace.name);

      return workspaceId;
    } catch (error) {
      console.error('Failed to save workspace:', error);
      throw error;
    }
  };

  const loadWorkspace = async (workspaceId) => {
    try {
      console.log('Loading workspace:', workspaceId);

      const workspaceData = await workspaceService.loadWorkspace(workspaceId);

      if (!workspaceData) {
        throw new Error(`Workspace ${workspaceId} not found`);
      }

      // Replace current workspace with loaded data
      Object.assign(currentWorkspace, workspaceData);

      console.log('Workspace loaded successfully:', currentWorkspace.name);
      return workspaceData;
    } catch (error) {
      console.error('Failed to load workspace:', error);
      throw error;
    }
  };

  const exportWorkspace = () => {
    return {
      version: '1.0.0',
      workspace: currentWorkspace,
      metadata: {
        exportedAt: new Date(),
        exportedBy: null,
        lyricFrenVersion: '1.0.0',
        includesContent: true,
      },
    };
  };

  const importWorkspace = async (workspaceData) => {
    // TODO: Validate workspace data format
    console.log('STUB: Importing workspace', workspaceData);

    if (workspaceData.workspace) {
      Object.assign(currentWorkspace, {
        ...workspaceData.workspace,
        id: generateId(), // Generate new ID for imported workspace
        modified: new Date(),
      });
    }
  };

  const listWorkspaces = async () => {
    try {
      console.log('Listing workspaces');
      return await workspaceService.listWorkspaces();
    } catch (error) {
      console.error('Failed to list workspaces:', error);
      throw error;
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      console.log('Deleting workspace:', workspaceId);
      return await workspaceService.deleteWorkspace(workspaceId);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  };

  const duplicateWorkspace = async (workspaceId, newName) => {
    try {
      console.log('Duplicating workspace:', workspaceId, 'as', newName);
      return await workspaceService.duplicateWorkspace(workspaceId, newName);
    } catch (error) {
      console.error('Failed to duplicate workspace:', error);
      throw error;
    }
  };

  // Bulk operations
  const saveAllPanels = async () => {
    const dirtyPanelIds = dirtyPanels.value.map(panel => panel.id);

    for (const panelId of dirtyPanelIds) {
      await savePanelState(panelId);
    }

    console.log(`Saved ${dirtyPanelIds.length} panels`);
  };

  const closeAllPanels = async () => {
    if (hasDirtyPanels.value) {
      const confirmed = confirm('Some panels have unsaved changes. Close all anyway?');
      if (!confirmed) return false;
    }

    currentWorkspace.panels = {};
    currentWorkspace.layout.panelOrder = [];
    currentWorkspace.layout.panelWidths = {};
    currentWorkspace.ui.activePanel = null;

    updateWorkspaceModified();
    return true;
  };

  // Workspace creation and initialization
  const createNewWorkspace = (name = 'Untitled Workspace', description = '') => {
    Object.assign(currentWorkspace, {
      id: generateId(),
      name,
      description,
      created: new Date(),
      modified: new Date(),
      version: '1.0.0',
      layout: {
        panelOrder: [],
        panelWidths: {},
        globalSidebarWidth: 300,
        workspaceWidth: 0,
        resetToAuto: true,
      },
      panels: {},
      ui: {
        activePanel: null,
        workspaceToolbarVisible: true,
        statusBarVisible: false,
      },
    });

    console.log('Created new workspace:', name);
    return currentWorkspace.id;
  };

  // Initialize workspace on store creation
  const initializeWorkspace = async () => {
    try {
      // Try to load the most recent workspace
      const workspaces = await listWorkspaces();
      if (workspaces.length > 0) {
        const mostRecent = workspaces[0]; // Already sorted by modified date
        await loadWorkspace(mostRecent.id);
        console.log('Loaded most recent workspace:', mostRecent.name);
      } else {
        // Create a default workspace if none exist
        createNewWorkspace();
        await saveWorkspace();
        console.log('Created default workspace');
      }
    } catch (error) {
      console.warn('Failed to initialize workspace, creating new one:', error);
      // Always ensure we have a valid workspace, even if persistence fails
      createNewWorkspace();
      // Try to save the new workspace, but don't fail if it doesn't work
      try {
        await saveWorkspace();
      } catch (saveError) {
        console.warn('Failed to save default workspace:', saveError);
      }
    }
  };

  return {
    // State
    currentWorkspace,
    activePanels,
    dirtyPanels,
    hasDirtyPanels,

    // Panel management
    addPanel,
    removePanel,
    reorderPanels,
    duplicatePanel,

    // Layout management
    setPanelWidth,
    resetPanelWidths,
    togglePanelSidebar,
    setPanelSidebarWidth,

    // State tracking
    markPanelDirty,
    updatePanelData,
    savePanelState,
    setActivePanel,

    // Workspace management
    updateWorkspaceMetadata,
    saveWorkspace,
    loadWorkspace,
    exportWorkspace,
    importWorkspace,
    listWorkspaces,
    deleteWorkspace,
    duplicateWorkspace,
    createNewWorkspace,
    initializeWorkspace,

    // Bulk operations
    saveAllPanels,
    closeAllPanels,
  };
});
