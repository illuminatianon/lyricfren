# LyricFren Architecture

## 1. Overview

LyricFren is a desktop application for creative writing that provides a flexible, multi-panel workspace for managing and editing different types of content. The application is built with Electron and Vue.js, and it is designed to be a local-first application with the option for future cloud synchronization.

## 2. Core Concepts & Data Models

The entire application is centered around the concept of a **Workspace**. A workspace contains a collection of **Panels**, which are individual editor instances for different types of content.

### 2.1 Workspace

A workspace is the top-level container for all user data. It includes:

*   **id**: A unique identifier for the workspace.
*   **name**: A user-defined name for the workspace.
*   **layout**: An object that defines the arrangement of panels, including their order and widths.
*   **panels**: A collection of all the panels within the workspace.
*   **ui**: An object that stores the UI state of the workspace, such as the active panel and visibility of UI elements.

### 2.2 Panel

A panel is an individual editor instance within a workspace. Each panel has:

*   **id**: A unique identifier for the panel.
*   **type**: The type of editor (e.g., 'lyric', 'style', 'prompt').
*   **title**: A user-defined title for the panel.
*   **data**: An object that contains the actual content of the panel, including metadata, tags, history, and the main content.
*   **isDirty**: A boolean that indicates whether the panel has unsaved changes.

## 3. Architecture

LyricFren is an Electron application with a Vue.js frontend. The backend logic is running in the Electron main process, and the frontend communicates with it via IPC.

### 3.1 Frontend (Vue.js)

*   **Framework**: Vue 3 with the Composition API.
*   **UI Components**: A custom component library that provides the panel-based workspace interface.
*   **State Management**: Pinia is used for state management, with a central `workspaceManager` store that manages the entire application state.
*   **Styling**: Custom CSS with variables for theming.

### 3.2 Backend (Electron Main Process)

*   **Runtime**: The backend is implemented in the Electron main process, using Node.js.
*   **Communication**: The frontend communicates with the backend via IPC (Inter-Process Communication) using `ipcMain` and `ipcRenderer`.
*   **Services**: The core services, such as `meterService`, are now running in the main process and exposed to the renderer process via a preload script.
*   **Persistence**: The application is designed to be local-first, with the workspace state saved to the local filesystem. The persistence layer is currently stubbed out, but the intention is to use a local database or flat files.

## 4. Future Direction

The current architecture is a solid foundation for a multi-panel creative writing application. The next steps will be to:

*   Implement the persistence layer to save and load workspaces.
*   Define the data models for the different panel types (e.g., 'lyric', 'style', 'prompt').
*   Integrate with AI models for content generation.
*   Implement a system for versioning and history tracking for each panel.
