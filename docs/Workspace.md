# Workspace Design Document

This document outlines the design for the `Workspace`, a special type of repository responsible for managing a collection of other repositories (e.g., `ProjectRepository` instances).

## Core Concepts

The `Workspace` acts as a top-level container for projects. Its primary role is to discover, manage, and persist the state of multiple independent repositories within it.

### Nested Repositories

A `Workspace` contains other repositories. To avoid issues with nested `.git` directories, the `Workspace` repository will adopt the following strategy:

1.  **`.gitignore`**: The `Workspace`'s `.gitignore` file will explicitly ignore all subdirectories that are themselves repositories. For example, it will contain entries like `songs/*/`, `styles/*/`, and `prompts/*/`. This prevents the `Workspace`'s git history from tracking the files within the projects.
2.  **Manifest**: The `Workspace` will maintain a manifest file (e.g., `workspace.json` in its root) that lists the repositories it manages. This manifest will be the primary "content" tracked by the `Workspace` repository.

## Workspace Repository

The `WorkspaceRepository` extends the base `Repository`.

### Responsibilities

*   **Project Discovery**: Scans its subdirectories (e.g., `songs/`, `styles/`, `prompts/`) to discover project repositories.
*   **Manifest Management**: Maintains the `workspace.json` manifest, tracking all known projects.
*   **Project Lifecycle**: Provides methods for creating new projects within the appropriate subdirectory. When a new project is created, the `WorkspaceRepository` initializes the new project's repository and adds it to the manifest.

### Directory Structure

```
workspace-slug/
├── .git/                 # Workspace's own git repository
├── .gitignore            # Ignores project directories (e.g., "songs/*/")
├── workspace.json        # Manifest of all projects managed by the workspace
├── songs/
│   └── my-song-project/  # A self-contained SongRepository
│       ├── .git/
│       └── ...
├── styles/
│   └── my-style-project/ # A self-contained StyleRepository
│       ├── .git/
│       └── ...
└── prompts/
    └── my-prompt-project/ # A self-contained PromptRepository
        ├── .git/
        └── ...
```

### `workspace.json` Manifest

This file acts as the main content for the `Workspace`. It stores references to the projects.

```json
{
  "version": 1,
  "projects": [
    {
      "id": "song-repo-id",
      "type": "song",
      "path": "songs/my-song-project"
    },
    {
      "id": "style-repo-id",
      "type": "style",
      "path": "styles/my-style-project"
    }
  ]
}
```

## Workspace Entity

When a `WorkspaceRepository` is loaded, it produces a `WorkspaceEntity`.

```typescript
interface WorkspaceEntity extends Entity {
  content: {
    projects: ProjectReference[];
  };
}

interface ProjectReference {
  id: string;
  type: string;
  path: string;
}
```

The `WorkspaceEntity`'s `content` is not a simple file but a structured list of references to the projects it contains. The application can then use these references to load the individual project repositories as needed.
