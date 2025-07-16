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
  tools: Record<string, any>; // State of the tools associated with the project
}
```

## Project Repository

The `ProjectRepository` is a concrete implementation of the base `Repository`. It is responsible for managing `ProjectEntity` instances.

### Responsibilities

*   **Persistence**: Saves and retrieves `ProjectEntity` objects.
*   **Metadata Management**: Handles both base `Repository` metadata and `ProjectMetadata`.
*   **Tool State**: Persists the state of any associated `Tools` within the `metadata.json` file.

### `metadata.json` Structure

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
      "text": "The content of the editor"
    },
    "conversation": {
      "history": []
    }
  }
}
```

## Tools

Tools are self-contained, modular components that provide specific functionality to a project. They typically define a `Panel` for their UI and manage their own state.

### Core Concepts

*   **Modularity**: Each tool is independent and can be added or removed from a project.
*   **State Management**: Tools are responsible for managing their own state. The `ProjectRepository` is only responsible for persisting it.
*   **UI**: Tools usually have an associated `Panel` that provides their user interface.
*   **Services**: Tools implement services that can be used by the project.

### Example: `Prompt` Tools

A `Prompt` project would utilize several tools:

*   **`EditorTool`**:
    *   **UI**: A `Panel` containing a CodeMirror editor.
    *   **Functionality**: Provides text editing features.
    *   **State**: The text content of the editor.
*   **`ConversationTool`**:
    *   **UI**: A `Panel` that displays a conversation with an LLM.
    *   **Functionality**: Drives a conversation with an LLM, using the content from the `EditorTool` as the input.
    *   **State**: The history of the conversation.
*   **Built-in Tools**:
    *   **Metadata Tool**: A `Panel` for viewing and editing the project's metadata (title, description, etc.).
    *   **History Tool**: A `Panel` for viewing the project's revision history.

### Tool State Persistence

*   The state of each tool is stored in the `tools` object within the `metadata.json` file.
*   The key for each tool's state is the tool's unique identifier (e.g., "editor", "conversation").
*   The `ProjectRepository` will serialize the tool's state to JSON when saving the project and deserialize it when loading the project. The tool itself is responsible for resolving its state from the deserialized object.
