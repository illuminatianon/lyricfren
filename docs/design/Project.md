# Project Design Document

This document outlines the design for the `ProjectEntity`, `ProjectRepository`, and `Tools`.

## Project Entity

A `ProjectEntity` represents the state of a project at a specific point in time. It extends the base `Entity` and includes project-specific metadata and content.

```typescript
interface ProjectEntity extends Entity {
  metadata: {
    // Base repository metadata
    id: string;
    slug: string;
    created: Date;
    // Project-specific metadata
    title: string;
    description: string;
    author: string;
  };
  content: any; // Project-specific content
  tools: Record<string, any>; // The *data state* of the tools associated with the project
}
```

## Project Repository

The `ProjectRepository` is a concrete implementation of the base `Repository`. It is responsible for managing the versioned data of a `ProjectEntity`.

### Responsibilities

*   **Persistence**: Saves and retrieves the core data of `ProjectEntity` objects.
*   **Metadata Management**: Handles both base `Repository` metadata and `ProjectMetadata`.
*   **Tool Data State**: Persists the essential *data state* of any associated `Tools` within the `metadata.json` file. It does **not** track UI state like panel size or position.

### `metadata.json` Structure

This file contains the versioned data for the project.

```json
{
  "id": "immutable-unique-hash",
  "slug": "project-slug",
  "created": "2024-01-15T10:30:00Z",
  "project": {
    "title": "My Awesome Project",
    "description": "A brief description of the project.",
    "author": "J. Doe"
  },
  "tools": {
    "editor": {
      "text": "The versioned text content of the editor."
    },
    "conversation": {
      "history": [
        // The versioned history of the conversation.
      ]
    }
  }
}
```

## Tools

Tools are self-contained, modular components that provide specific functionality to a project. They separate their critical data state from their transient UI state.

*   **Data State**: Managed by the `ProjectRepository` and versioned in `metadata.json`. This is the core information the tool operates on.
*   **UI State**: Managed by the `Workspace` (e.g., in `workspace.json`) and is not versioned. This includes panel position, size, visibility, scroll position, etc.
