# Multi-Panel Editor Workspace Design

## Overview

The Multi-Panel Editor Workspace introduces a flexible, card-based interface for managing multiple editor instances within LyricFren. This system provides resizable panels with collapsible sidebars, allowing users to customize their editing environment based on their workflow needs.

## Formalized Component Language

### Core Components

#### **EditorWorkspace** (Host Component)
- **Role**: Container and orchestrator for multiple editor panels
- **Responsibilities**: Panel layout management, resizing, panel lifecycle, workspace state
- **UI Elements**: Flexbox panel container, resize handles, global workspace actions
- **Layout**: Dynamic flexbox that adapts when sidebars open/close

#### **EditorPanel** (Card-based Container)
- **Role**: Card wrapper for editor instances with integrated toolbar and sidebar
- **Responsibilities**: Panel UI structure, sidebar toggle, action management
- **UI Structure**:
  - **Header**: Title + action icons + overflow menu
  - **Body**: Two-column layout (main content + collapsible sidebar)
  - **Resize Handle**: For panel width adjustment

#### **EditorInstance** (Content Implementation)
- **Role**: Specific editor implementation (LyricEditor, PromptEditor, etc.)
- **Responsibilities**: Content-specific editing, validation, specialized features
- **Examples**: LyricEditorInstance, PromptEditorInstance, StyleEditorInstance

### Supporting Components

#### **PanelHeader** (Card Title Bar)
- **Role**: Panel title and action management
- **UI Elements**: Title, primary action icons, overflow dropdown menu
- **Actions**: Save, export, settings, close, sidebar toggle

#### **PanelSidebar** (Collapsible Secondary UI)
- **Role**: Secondary tools and metadata for each editor
- **State**: Hidden by default, toggleable, resizable
- **Content**: Standardized sidebar components + editor-specific tools
- **Component System**: Pluggable sidebar widgets with data binding

#### **WorkspaceManager** (Service)
- **Role**: State management for workspace layout and panel operations
- **Responsibilities**: Panel creation, closing, resizing, layout persistence, drag/drop reordering
- **State Tracking**: Panel configurations, widths, order, sidebar states, workspace metadata
- **Persistence Ready**: Prepared for backend integration with save/load workspace functionality

#### **SidebarComponentRegistry** (Service)
- **Role**: Registry for standardized sidebar components
- **Responsibilities**: Component registration, data binding, common widget library

## Architecture

### Component Hierarchy
```
EditorWorkspace (Host)
├── WorkspaceToolbar
│   ├── NewPanelButton
│   ├── ResetLayoutButton (auto-resize all panels)
│   └── WorkspaceActions (save all, export, etc.)
├── PanelContainer (flexbox layout with drag/drop)
│   ├── EditorPanel (draggable, resizable card)
│   │   ├── DragHandle (for panel reordering)
│   │   ├── PanelHeader
│   │   │   ├── Title
│   │   │   ├── ActionIcons (save, export, etc.)
│   │   │   ├── OverflowMenu (additional actions)
│   │   │   └── SidebarToggle
│   │   ├── PanelBody (two-column layout)
│   │   │   ├── MainContent (EditorInstance)
│   │   │   └── PanelSidebar (collapsible)
│   │   │       ├── StandardSidebarComponents
│   │   │       │   ├── MetadataWidget (title, description)
│   │   │       │   ├── TagsWidget
│   │   │       │   └── TimestampWidget
│   │   │       └── EditorSpecificComponents
│   │   └── ResizeHandle
│   └── EditorPanel (additional panels...)
└── WorkspaceStatus (optional status bar)
```

### Data Flow
```
EditorWorkspace → WorkspaceManager → EditorPanel → EditorInstance
       ↑                ↓                ↓            ↓
   UI Events      Workspace State   Panel State   Content State
```

### Layout Behavior
- **Default**: Panels use standard flexbox distribution (flex: 1)
- **Sidebar Open**: Panel grows to accommodate sidebar width
- **Manual Resize**: Users can drag resize handles to set explicit widths
- **Auto-Reset**: "Reset Layout" button clears manual widths, returns to flex
- **Drag Reorder**: Panels can be dragged to reorder within workspace
- **Responsive**: Layout adapts to available screen space

## EditorPanel Interface

### Panel Structure
```typescript
interface EditorPanelProps {
  id: string;           // Unique panel identifier
  title: string;        // Display name in header
  type: EditorType;     // Editor type (lyric, prompt, style, etc.)
  isDirty: boolean;     // Has unsaved changes
  canClose: boolean;    // Can this panel be closed
  canResize: boolean;   // Can this panel be resized
  sidebarOpen: boolean; // Is sidebar currently open
  minWidth: number;     // Minimum panel width
  maxWidth?: number;    // Maximum panel width (optional)
  data?: any;           // Panel-specific data
}
```

### Panel Methods
```typescript
interface EditorPanelMethods {
  save(): Promise<boolean>;
  load(data: any): Promise<void>;
  canClose(): Promise<boolean>;
  getContent(): any;
  setContent(content: any): void;
  focus(): void;
  blur(): void;
  toggleSidebar(): void;
  resize(width: number): void;
}
```

### Panel Events
```typescript
interface EditorPanelEvents {
  'content-changed': (content: any) => void;
  'dirty-changed': (isDirty: boolean) => void;
  'title-changed': (title: string) => void;
  'sidebar-toggled': (isOpen: boolean) => void;
  'resize-requested': (width: number) => void;
  'close-requested': () => void;
  'save-requested': () => void;
  'save-as-requested': () => void;
}
```

### Card Layout Structure
```vue
<Card class="editor-panel">
  <template #header>
    <PanelHeader
      :title="title"
      :isDirty="isDirty"
      :actions="primaryActions"
      :overflowActions="secondaryActions"
      @sidebar-toggle="toggleSidebar"
    />
  </template>

  <template #content>
    <div class="panel-body">
      <div class="main-content">
        <EditorInstance />
      </div>
      <PanelSidebar
        v-if="sidebarOpen"
        :content="sidebarContent"
        @close="closeSidebar"
      />
    </div>
  </template>
</Card>
```

## Editor Types & Layouts

### LyricEditorPanel
- **Purpose**: Lyric composition with meter analysis
- **Main Content**: CodeMirror with syllable counting gutter
- **Sidebar Content**:
  - Title/description metadata
  - Meter analysis settings
  - Export options
  - LLM assistance tools
- **Header Actions**: Save, Clear, Export, Sidebar Toggle
- **Data Structure**: `{ content: string, title: string, description: string, meterEnabled: boolean }`

### PromptEditorPanel
- **Purpose**: AI prompt composition and management
- **Main Content**: Rich text editor for prompt composition
- **Sidebar Content**:
  - Style selection dropdown
  - Prompt templates library
  - Generation history
  - Parameter settings (temperature, tokens, etc.)
- **Header Actions**: Save, Generate, Template, History, Sidebar Toggle
- **Data Structure**: `{ prompt: string, styleId: string, parameters: {}, history: [] }`

### StyleEditorPanel
- **Purpose**: System prompt editing and management
- **Main Content**: Code editor for system prompt text
- **Sidebar Content**:
  - Style metadata (name, description, tags)
  - Testing interface
  - Usage examples
  - Version history
- **Header Actions**: Save, Test, Duplicate, Delete, Sidebar Toggle
- **Data Structure**: `{ name: string, systemPrompt: string, metadata: {}, examples: [] }`

## Standardized Sidebar Component System

### Core Sidebar Components

#### **MetadataWidget**
- **Purpose**: Standard title, description, and basic metadata fields
- **Data Binding**: Automatically binds to `editorData.metadata`
- **Fields**: Title (string), Description (textarea), Created/Modified timestamps
- **Validation**: Required field indicators, character limits

#### **TagsWidget**
- **Purpose**: Tag management for categorization and search
- **Data Binding**: Binds to `editorData.tags` array
- **Features**: Tag autocomplete, color coding, tag suggestions
- **UI**: Chip-based display with add/remove functionality

#### **ExportWidget**
- **Purpose**: Export options and format selection
- **Data Binding**: Uses editor content and metadata
- **Formats**: JSON, plain text, markdown, PDF (editor-specific)
- **Options**: Include metadata, custom formatting

#### **HistoryWidget**
- **Purpose**: Version history and change tracking
- **Data Binding**: Binds to `editorData.history` array
- **Features**: Timeline view, diff comparison, restore points
- **Actions**: Create checkpoint, restore version, view changes

### Editor-Specific Sidebar Configurations

#### **LyricEditor Sidebar**
```typescript
const lyricSidebarConfig = {
  standard: [
    { component: 'MetadataWidget', order: 1 },
    { component: 'TagsWidget', order: 2 },
    { component: 'ExportWidget', order: 4 }
  ],
  custom: [
    { component: 'MeterSettingsWidget', order: 3 },
    { component: 'LLMAssistantWidget', order: 5 },
    { component: 'RhymeHelperWidget', order: 6 }
  ]
}
```

#### **PromptEditor Sidebar**
```typescript
const promptSidebarConfig = {
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
}
```

#### **StyleEditor Sidebar**
```typescript
const styleSidebarConfig = {
  standard: [
    { component: 'MetadataWidget', order: 1 },
    { component: 'TagsWidget', order: 2 },
    { component: 'ExportWidget', order: 5 }
  ],
  custom: [
    { component: 'StyleTestingWidget', order: 3 },
    { component: 'ExampleLibraryWidget', order: 4 },
    { component: 'UsageStatsWidget', order: 6 }
  ]
}
```

### Sidebar Component Interface

#### **Component Registration**
```typescript
interface SidebarComponent {
  name: string;
  component: Vue.Component;
  dataBinding: string;        // Path to data in editorData
  validation?: ValidationRules;
  permissions?: string[];     // Required permissions
  dependencies?: string[];    // Other components this depends on
}

// Registration example
SidebarComponentRegistry.register({
  name: 'MetadataWidget',
  component: MetadataWidget,
  dataBinding: 'metadata',
  validation: {
    title: { required: true, maxLength: 100 },
    description: { maxLength: 500 }
  }
});
```

#### **Data Binding System**
```typescript
interface EditorDataModel {
  // Standard fields (available to all editors)
  metadata: {
    title: string;
    description: string;
    created: Date;
    modified: Date;
    author?: string;
  };
  tags: string[];
  history: HistoryEntry[];

  // Editor-specific data
  content: any;              // Main editor content
  settings: any;             // Editor-specific settings
  [key: string]: any;        // Additional custom fields
}
```

#### **Component Communication**
```typescript
interface SidebarComponentProps {
  editorData: EditorDataModel;
  readonly: boolean;
  compact: boolean;          // For responsive layouts
}

interface SidebarComponentEvents {
  'data-changed': (path: string, value: any) => void;
  'validation-error': (field: string, error: string) => void;
  'action-requested': (action: string, payload?: any) => void;
}
```

## Workspace Persistence System

### WorkspaceManager State Structure

```typescript
interface WorkspaceState {
  // Workspace metadata
  id: string;
  name: string;
  description?: string;
  created: Date;
  modified: Date;
  version: string;

  // Layout configuration
  layout: {
    panelOrder: string[];           // Array of panel IDs in display order
    panelWidths: Record<string, number>;  // Manual width overrides
    globalSidebarWidth: number;     // Default sidebar width
    workspaceWidth: number;         // Total workspace width
    resetToAuto: boolean;           // Whether to use auto-sizing
  };

  // Panel configurations
  panels: Record<string, PanelState>;

  // UI state
  ui: {
    activePanel?: string;           // Currently focused panel
    workspaceToolbarVisible: boolean;
    statusBarVisible: boolean;
  };
}

interface PanelState {
  id: string;
  type: EditorType;               // 'lyric', 'prompt', 'style', etc.
  title: string;

  // Panel layout
  width?: number;                 // Manual width override
  sidebarOpen: boolean;
  sidebarWidth?: number;

  // Panel data
  data: EditorDataModel;          // Full editor data including content

  // Panel UI state
  isDirty: boolean;
  lastSaved?: Date;
  scrollPosition?: number;
  cursorPosition?: any;           // Editor-specific cursor state

  // Sidebar configuration
  sidebarConfig: {
    activeTab?: string;           // If sidebar has tabs
    collapsedSections: string[];  // Which sidebar sections are collapsed
    componentStates: Record<string, any>; // Component-specific states
  };
}
```

### WorkspaceManager Methods

```typescript
class WorkspaceManager {
  // State management
  getCurrentWorkspace(): WorkspaceState;
  updateWorkspaceMetadata(metadata: Partial<WorkspaceState>): void;

  // Panel management
  addPanel(type: EditorType, data?: any): string;  // Returns panel ID
  removePanel(panelId: string): Promise<boolean>;
  reorderPanels(newOrder: string[]): void;
  duplicatePanel(panelId: string): string;

  // Layout management
  setPanelWidth(panelId: string, width: number): void;
  resetPanelWidths(): void;                        // Clear manual widths
  togglePanelSidebar(panelId: string): void;
  setPanelSidebarWidth(panelId: string, width: number): void;

  // State tracking
  markPanelDirty(panelId: string, isDirty: boolean): void;
  updatePanelData(panelId: string, data: Partial<EditorDataModel>): void;
  savePanelState(panelId: string): Promise<void>;

  // Persistence (prepared for backend)
  saveWorkspace(name?: string): Promise<string>;   // Returns workspace ID
  loadWorkspace(workspaceId: string): Promise<void>;
  exportWorkspace(): WorkspaceExport;
  importWorkspace(workspaceData: WorkspaceExport): Promise<void>;

  // Workspace management
  listWorkspaces(): Promise<WorkspaceSummary[]>;
  deleteWorkspace(workspaceId: string): Promise<void>;
  duplicateWorkspace(workspaceId: string, newName: string): Promise<string>;
}
```

### Backend API Preparation (Stubbed)

```typescript
// Future API endpoints for workspace persistence
interface WorkspaceAPI {
  // Workspace CRUD
  'GET /api/workspaces': () => Promise<WorkspaceSummary[]>;
  'POST /api/workspaces': (workspace: WorkspaceState) => Promise<{ id: string }>;
  'GET /api/workspaces/:id': (id: string) => Promise<WorkspaceState>;
  'PUT /api/workspaces/:id': (id: string, workspace: WorkspaceState) => Promise<void>;
  'DELETE /api/workspaces/:id': (id: string) => Promise<void>;

  // Workspace operations
  'POST /api/workspaces/:id/duplicate': (id: string, name: string) => Promise<{ id: string }>;
  'POST /api/workspaces/import': (data: WorkspaceExport) => Promise<{ id: string }>;
  'GET /api/workspaces/:id/export': (id: string) => Promise<WorkspaceExport>;
}

// Stub implementations for current development
class WorkspaceAPIStub {
  private workspaces: Map<string, WorkspaceState> = new Map();

  async saveWorkspace(workspace: WorkspaceState): Promise<string> {
    // TODO: Replace with actual API call
    const id = workspace.id || generateId();
    this.workspaces.set(id, { ...workspace, id });
    console.log('STUB: Workspace saved locally', id);
    return id;
  }

  async loadWorkspace(id: string): Promise<WorkspaceState> {
    // TODO: Replace with actual API call
    const workspace = this.workspaces.get(id);
    if (!workspace) throw new Error(`Workspace ${id} not found`);
    console.log('STUB: Workspace loaded locally', id);
    return workspace;
  }

  async listWorkspaces(): Promise<WorkspaceSummary[]> {
    // TODO: Replace with actual API call
    console.log('STUB: Listing local workspaces');
    return Array.from(this.workspaces.values()).map(ws => ({
      id: ws.id,
      name: ws.name,
      description: ws.description,
      modified: ws.modified,
      panelCount: Object.keys(ws.panels).length
    }));
  }
}
```

### Workspace Export/Import Format

```typescript
interface WorkspaceExport {
  version: string;                    // Export format version
  workspace: WorkspaceState;          // Full workspace state
  metadata: {
    exportedAt: Date;
    exportedBy?: string;
    lyricFrenVersion: string;
    includesContent: boolean;         // Whether panel content is included
  };

  // Optional: Separate content for large workspaces
  panelContent?: Record<string, any>;
}

interface WorkspaceSummary {
  id: string;
  name: string;
  description?: string;
  modified: Date;
  panelCount: number;
  tags?: string[];
}
```

## Workspace Features

### Panel Management
- **New Panel Creation**: Via + button or programmatic API
- **Panel Closing**: With unsaved changes confirmation
- **Panel Resizing**: Drag handles between panels for manual width adjustment
- **Panel Reordering**: Drag and drop panels to reorder within workspace
- **Layout Reset**: "Reset Layout" button clears manual widths, returns to auto-sizing
- **Layout Persistence**: Restore panel layout, order, and sizes on app restart

### Sidebar Behavior
- **Default State**: Sidebars hidden to maximize main content
- **Toggle Animation**: Smooth expand/collapse transitions
- **Auto-resize**: Panels grow when sidebar opens, shrink when closed
- **Responsive**: Sidebars stack below main content on mobile

### Panel Lifecycle
1. **Creation**: Panel instantiated with initial data and default layout
2. **Focus**: Panel receives focus, sidebar can be opened
3. **Blur**: Panel loses focus but remains visible
4. **Resize**: Panel width adjusted via drag handles or sidebar toggle
5. **Save**: Panel persists content and layout state
6. **Destruction**: Panel removed with cleanup

### Workspace Actions

#### **Panel Operations**
- **Save All**: Save all dirty panels to their respective storage
- **Close All**: Close all panels (with unsaved changes confirmation)
- **Reset Layout**: Clear manual panel widths, return to automatic flexbox sizing
- **Auto-Arrange**: Automatically distribute panels evenly across workspace

#### **Workspace Persistence (UI Ready, Backend Stubbed)**
- **Save Workspace**: Save current workspace state with name/description dialog
- **Load Workspace**: Browse and load saved workspaces from list dialog
- **New Workspace**: Create fresh workspace (with option to save current first)
- **Duplicate Workspace**: Clone current workspace with new name
- **Export Workspace**: Download workspace as JSON file
- **Import Workspace**: Upload and restore workspace from JSON file
- **Delete Workspace**: Remove saved workspace (with confirmation)

#### **Workspace Management UI**
- **Workspace Selector**: Dropdown in toolbar showing current workspace name
- **Workspace Browser**: Dialog with list of saved workspaces, search, and metadata
- **Save Dialog**: Name, description, tags for workspace saving
- **Import/Export Dialogs**: File selection and format options

#### **Global Settings**
- **Editor Preferences**: Default sidebar configurations, auto-save settings
- **Workspace Defaults**: Default panel types, layout preferences
- **Persistence Settings**: Auto-save frequency, backup options (for future)

## Implementation Plan

### ✅ Phase 1: Core Infrastructure (COMPLETED)
1. ✅ Create `EditorWorkspace` host component with flexbox layout
2. ✅ Define `EditorPanel` base interface and card structure
3. ✅ Implement `WorkspaceManager` service with full state tracking
4. ✅ Create `PanelHeader` with action icons and overflow menu
5. ✅ Set up workspace state structure and persistence interfaces

**Files Created:**
- `stores/workspaceManager.js` - Complete state management
- `components/workspace/EditorWorkspace.vue` - Host component with drag/drop
- `components/workspace/BaseEditorPanel.vue` - Panel card structure
- `components/workspace/PanelHeader.vue` - Action bar with drag handle
- `components/workspace/WorkspaceToolbar.vue` - Global workspace actions
- `utils/helpers.js` - ID generation and utilities
- `views/WorkspaceView.vue` - Main workspace view
- Updated `router/index.js` and `main.js` for integration

### ✅ Phase 2: Panel & Sidebar System (PARTIALLY COMPLETED)
1. ✅ Create `BaseEditorPanel` with two-column layout
2. ✅ Implement `PanelSidebar` collapsible component
3. 🔄 Implement `SidebarComponentRegistry` and standard widgets (basic widgets only)
4. ✅ Add resize handles and panel width management
5. ✅ Create sidebar toggle animations and responsive behavior

**Files Created:**
- `components/workspace/PanelSidebar.vue` - Collapsible sidebar with placeholder widgets
- `components/editors/LyricEditorInstance.vue` - Working lyric editor
- `components/editors/PromptEditorInstance.vue` - Placeholder editor
- `components/editors/StyleEditorInstance.vue` - Placeholder editor

**Current Status:**
- ✅ Basic sidebar functionality working
- ✅ MetadataWidget and TagsWidget implemented as placeholders
- ✅ Panel resizing and drag/drop working
- 🔄 Need full sidebar component registry system

## Known Issues & Fixes Needed

### 🐛 Current Issues
1. **Panel Creation Bug**: Only one panel can be open at a time - new panels replace existing ones
2. **Sidebar Widget System**: Need proper component registry for sidebar widgets
3. **Panel Focus Management**: Active panel highlighting needs improvement
4. **Export/Import**: Workspace persistence UI needs implementation

### 🔧 Immediate Fixes Required
1. Fix panel creation to allow multiple panels
2. Implement proper sidebar component registry
3. Add panel focus visual indicators
4. Create workspace save/load dialogs

### Phase 3: Editor Migration
1. Extract common functionality from `LyricEditor`
2. Create `LyricEditorPanel` with sidebar configuration
3. Implement standard sidebar widgets (MetadataWidget, TagsWidget, etc.)
4. Refactor `LyricEditor` to fit new panel structure
5. Implement panel lifecycle methods and state management

### Phase 4: Additional Editors
1. Create `PromptEditorPanel` (replacing PromptComposer)
2. Create `StyleEditorPanel` (enhancing StyleEditor)
3. Implement editor-specific sidebar widgets
4. Add panel type registration system
5. Create drag/drop panel reordering

### Phase 5: Workspace Management UI
1. Create workspace persistence UI components (save/load dialogs)
2. Implement workspace browser and management interface
3. Add workspace selector to toolbar
4. Create export/import functionality with JSON format
5. Implement API stub service for development

### Phase 6: Advanced Features
1. Panel resizing with drag handles
2. Auto-arrange and reset layout functionality
3. Workspace duplication and deletion
4. Global actions and bulk operations
5. Prepare for backend integration (API endpoints defined)

## Technical Considerations

### State Management
- Use Pinia store for workspace layout management
- Each panel manages its own content and sidebar state
- Global editor preferences in separate store
- Panel resize states and sidebar visibility persistence

### Performance
- Lazy loading of panel content and sidebar components
- Virtual scrolling for large content in editors
- Debounced auto-save and resize functionality
- Efficient re-rendering when panels resize

### Accessibility
- Keyboard navigation for panel focus
- Screen reader support for panel states and sidebar content
- Focus management during panel operations
- ARIA labels for resize handles and action buttons

### Styling
- Consistent with PrimeVue Card and theming system
- Panel-specific styling isolation with scoped CSS
- Responsive design with sidebar stacking on mobile
- Smooth animations for sidebar toggle and panel resize

## File Structure
```
/components
├── workspace/
│   ├── EditorWorkspace.vue       # Host component with drag/drop support
│   ├── BaseEditorPanel.vue       # Abstract base panel with card layout
│   ├── PanelHeader.vue           # Card header with actions and drag handle
│   ├── PanelSidebar.vue          # Collapsible sidebar with component slots
│   ├── ResizeHandle.vue          # Panel resize control
│   └── DragHandle.vue            # Panel reordering drag handle
├── sidebar/
│   ├── widgets/
│   │   ├── MetadataWidget.vue    # Standard title/description fields
│   │   ├── TagsWidget.vue        # Tag management component
│   │   ├── ExportWidget.vue      # Export options component
│   │   ├── HistoryWidget.vue     # Version history component
│   │   └── BaseWidget.vue        # Abstract base for sidebar widgets
│   ├── lyric/
│   │   ├── MeterSettingsWidget.vue
│   │   ├── LLMAssistantWidget.vue
│   │   └── RhymeHelperWidget.vue
│   ├── prompt/
│   │   ├── StyleSelectorWidget.vue
│   │   ├── TemplateLibraryWidget.vue
│   │   └── GenerationSettingsWidget.vue
│   └── style/
│       ├── StyleTestingWidget.vue
│       ├── ExampleLibraryWidget.vue
│       └── UsageStatsWidget.vue
├── editors/
│   ├── LyricEditorPanel.vue      # Lyric editor with sidebar config
│   ├── PromptEditorPanel.vue     # Prompt editor with sidebar config
│   ├── StyleEditorPanel.vue      # Style editor with sidebar config
│   └── EditorInstance.vue        # Base editor content wrapper
/stores
├── workspaceManager.js           # Workspace layout, drag/drop, resize state
├── sidebarRegistry.js            # Sidebar component registration
└── editorPreferences.js          # Global editor settings
/services
├── editorRegistry.js             # Panel type registration and factory
├── dragDropService.js            # Panel reordering logic
└── layoutService.js              # Panel sizing and layout calculations
```

This design provides a flexible, extensible foundation for the tabbed editor system while maintaining clean separation of concerns and consistent user experience across different editor types.

