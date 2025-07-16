# Workspace Design Document

This document outlines the design for the `Workspace`, which acts as a top-level container for managing projects and their UI layout.

## Core Concepts

The `Workspace` is a directory that contains a collection of Project Repositories and a configuration file. It is **not** a repository itself.

### Responsibilities

*   **Project Aggregation**: It provides a single location to group related projects.
*   **UI State Persistence**: It saves and restores the state of the user interface. This is its primary role.
*   **Project Discovery**: It is responsible for scanning its subdirectories to find and load existing Project Repositories.

## Directory Structure

A Workspace is simply a folder on the filesystem.

```
my-workspace/
├── workspace.json        # Configuration for projects and UI layout
├── songs/
│   └── my-song-project/  # A self-contained SongRepository
└── prompts/
    └── my-prompt-project/ # A self-contained PromptRepository
```

## `workspace.json` Configuration File

This unversioned file is the heart of the Workspace. It tracks which projects are part of the workspace and, crucially, stores all UI-related state.

```json
{
  "version": 1,
  "projects": [
    {
      "id": "prompt-repo-id",
      "type": "prompt",
      "path": "prompts/my-prompt-project"
    }
  ],
  "layout": {
    "type": "grid",
    "split": "vertical",
    "children": [
      {
        "type": "panel",
        "projectId": "prompt-repo-id",
        "toolId": "editor",
        "uiState": { "width": "50%" }
      },
      {
        "type": "grid",
        "split": "horizontal",
        "children": [
          {
            "type": "panel",
            "projectId": "prompt-repo-id",
            "toolId": "conversation",
            "uiState": { "height": "70%", "visible": true }
          },
          {
            "type": "panel",
            "projectId": "prompt-repo-id",
            "toolId": "metadata",
            "uiState": { "height": "30%", "visible": false }
          }
        ]
      }
    ]
  }
}
```

By giving the `Workspace` the sole responsibility for UI state, we keep the `ProjectRepository`'s history clean and focused on meaningful data changes.
