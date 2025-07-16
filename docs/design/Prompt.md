# Prompt

This document outlines the design for the `Prompt` entity and its corresponding `PromptRepository`.

## Prompt Entity

A `Prompt` is a simple entity whose primary content is a blob of text intended for use with LLMs.

*   **Inheritance**: The `PromptEntity` extends the `ProjectEntity`.
*   **Content**: The `content` property of a `PromptEntity` will be a string.

```typescript
interface PromptEntity extends ProjectEntity {
  content: string;
}
```

## Prompt Repository

The `PromptRepository` will extend the `ProjectRepository` and is responsible for managing `PromptEntity` instances. It will handle the persistence of the prompt text and its associated metadata.
