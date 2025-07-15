# Implementation Plan for Repository System

## 1. Overview

This document provides a comprehensive plan for implementing the `Repository` system as outlined in `docs/Repository.md`. The goal is to create a robust, extensible, and well-tested backend foundation for versioned data management within the application.

The implementation will use **Dugite** for Git operations and will be written in TypeScript. The focus is exclusively on the backend logic; no frontend, UI, or database changes will be made unless specified.

This plan is designed to be executed by another LLM agent. It includes detailed checklists and context to ensure a successful implementation.

## 2. Key Objectives

- **Implement Core Abstraction**: Create the abstract `Repository` base class with Git persistence.
- **Adhere to Design Principles**: Strictly follow the principles of filesystem isolation, linear history (no branches/merges), and atomic operations.
- **Enable Extensibility**: Ensure the base class is abstract and designed for domain-specific extensions (e.g., `SongRepository`).
- **Comprehensive Testing**: Implement unit and integration tests to verify correctness, error handling, and edge cases.
- **Achieve Readiness**: Reach a state where the first domain-specific repository can be built upon this foundation.

## 3. Constraints & Assumptions

### Constraints
- **Git Interface**: All Git operations **must** use the `dugite` library.
- **File Scope**: All new code **must** be placed within a new `/apps/desktop/electron/repository` directory. No other files should be modified unless absolutely necessary (e.g., `tsconfig.json`).
- **Backend Only**: This task involves **no** frontend work (Vue, HTML, CSS).
- **Error Handling**: Implement error handling as specified in the "Error Handling" section of `Repository.md`.
- **Dependencies**: Use `pnpm` for package management.

### Assumptions
- **Environment**: The project runs in a Node.js environment with TypeScript.
- **Git Availability**: Git is installed and accessible in the system's PATH, as required by Dugite.
- **Testing Framework**: The project uses Vitest. Tests will be configured accordingly.
- **Filesystem**: Use `fs-extra` for robust filesystem operations.

## 4. Recommended Project Structure

Create the following directory structure inside `/apps/desktop/electron/`:

```
repository/
├── __tests__/
│   ├── core/
│   │   └── Repository.spec.ts
│   └── utils/
│       ├── git.spec.ts
│       └── fs.spec.ts
├── core/
│   └── Repository.ts
├── types/
│   ├── index.ts
│   ├── Entity.ts
│   ├── Metadata.ts
│   └── Repository.ts
└── utils/
    ├── git.ts
    └── fs.ts
```

## 5. Step-by-Step Implementation Plan

### Phase 1: Setup and Prerequisites

**Goal**: Prepare the development environment and install all necessary dependencies.

**Checklist**:
- [x] **Install Dependencies**:
  - `pnpm add dugite`
  - `pnpm add uuid`
  - `pnpm add fs-extra`
  - `pnpm add -D @types/uuid @types/fs-extra`
- [x] **Create Directory Structure**: Create the directories outlined in Section 4.
- [x] **Configure TypeScript**: If necessary, update `apps/desktop/tsconfig.json` to ensure the new `repository` directory is included in the build.
- [x] **Configure Testing**: Ensure Vitest is configured to find and run tests within the new `repository/__tests__` directory.

### Phase 2: Implement Types and Interfaces

**Goal**: Define all the data structures and types specified in `Repository.md`.

**Checklist**:
- [x] **`repository/types/Metadata.ts`**:
  - [x] Define and export `GlobalMetadata` interface.
  - [x] Define and export `ForkMetadata` interface.
- [x] **`repository/types/Entity.ts`**:
  - [x] Define and export the `Entity` interface. Use generics (`content: T`, `metadata: M`) to allow for type-safety in subclasses.
- [x] **`repository/types/Repository.ts`**:
  - [x] Define and export the `RepositoryOperation` enum.
  - [x] Define and export any other repository-specific types (e.g., `Revision`, `Tag`).
- [x] **`repository/types/index.ts`**:
  - [x] Export all types from the other files in this directory for easy importing.

### Phase 3: Implement Utility Helpers

**Goal**: Create wrapper modules for Git and filesystem operations to abstract away low-level details.

**Checklist**:
- [x] **`repository/utils/fs.ts`**:
  - [x] Implement functions for atomically reading/writing JSON files.
  - [x] Implement a function to ensure a directory exists.
  - [x] Implement file/directory renaming and copying functions.
- [x] **`repository/utils/git.ts`**:
  - [x] Create a `Git` class or a set of functions that wrap `dugite`.
  - [x] Implement `init(path)`.
  - [x] Implement `commit(path, message)`.
  - [x] Implement `getStatus(path)` to check for uncommitted changes.
  - [x] Implement `show(path, revision, file)` to get historical file content.
  - [x] Implement `addTag(path, name, revision)`.
  - [x] Implement `getHistory(path)`.
  - [x] Map Dugite errors to custom, more specific errors (e.g., `GitError`, `RepositoryCorruptError`).
- [x] **Unit Tests**:
  - [x] Write tests for `fs.ts` using a temporary directory.
  - [x] Write tests for `git.ts`, mocking `dugite` to test the wrapper logic without making real Git calls.

### Phase 4: Implement the Abstract `Repository` Class

**Goal**: Build the core `Repository.ts` abstract class, implementing all the logic from the design document.

**Checklist**:
- [x] **Class Definition**:
  - [x] Create `export abstract class Repository<T, M>`.
  - [x] Define protected properties: `id`, `path`, `metadata`, `git` (instance of the Git util).
- [x] **Constructor**:
  - [x] The constructor should accept a `path`.
  - [x] On instantiation, it should load `metadata.json` or initialize a new repository if one doesn't exist.
  - [x] It must call `isDirty()` to check for external changes upon loading.
- [x] **Core Methods**:
  - [x] `isDirty(): Promise<boolean>`: Implements dirty state detection.
  - [x] `getLatest(): Promise<Entity<T, M>>`: Reads directly from the filesystem.
  - [x] `getByRevision(revisionId: string): Promise<Entity<T, M>>`: Reads from Git history.
  - [x] `save(entity: Entity<T, M>): Promise<Entity<T, M>>`: The core persistence method.
    - Validates `entity.repositoryId`.
    - Atomically writes changes to `content` and `metadata.json`.
    - Creates a Git commit with the correct `RepositoryOperation` signature.
    - Applies auto-tags if required.
    - Returns a new, "clean" `Entity` instance representing the saved state.
  - [x] `fork(revisionId: string, newPath: string): Promise<Repository<T, M>>`:
    - Creates a new repository directory.
    - Copies the state from the specified `revisionId`.
    - Initializes a new Git repository.
    - Creates an initial commit with `REPO_FORK` signature and `fork` metadata.
- [x] **Abstract Methods**:
  - [x] Define abstract methods that subclasses must implement, such as `_getContentFileName()` or `_getDefaultContent()`.
- [x] **Error Handling**:
  - [x] Implement all error cases specified in the design doc, throwing custom errors (e.g., `EntityMismatchError`, `TagConflictError`).

### Phase 5: Testing the `Repository` Class

**Goal**: Write comprehensive integration tests for the `Repository` class to ensure it functions correctly.

**Checklist**:
- [x] **Setup**:
  - [x] Create a temporary directory for test repositories before each test.
  - [x] Clean up the temporary directory after each test.
  - [x] Create a concrete `TestRepository` class that extends `Repository` for testing purposes.
- [x] **Test Cases**:
  - [x] **Initialization**: Test creating a new repository and loading an existing one.
  - [x] **Save/Load**:
    - Create an entity, save it, and verify the commit history and file contents.
    - Load the latest entity and verify its data.
    - Modify the entity, save again, and check that a new revision is created.
  - [x] **Historical Retrieval**: Load an entity from a specific past revision and verify its content.
  - [x] **Dirty State**:
    - Manually change a file in the repo and test that `isDirty()` returns `true`.
    - Test the workflow for committing external changes.
  - [x] **Forking**:
    - Fork a repository at a specific revision.
    - Verify the new repository is independent and contains the correct `fork` metadata.
  - [x] **Tagging**:
    - Test that `CONTENT_UPDATE` triggers an auto-tag.
    - Test manual tag creation and conflict resolution.
  - [x] **Error Handling**:
    - Test saving an entity with the wrong `repositoryId`.
    - Test operations on a corrupted or non-existent repository.

## 6. Final Deliverables

- **Source Code**: ✅ A complete implementation within `/apps/desktop/electron/repository`.
- **Tests**: ✅ A comprehensive suite of unit and integration tests with high coverage.
- **Documentation**: 🟡 JSDoc comments are present, but a comprehensive README for the module is missing.
- **Verification**: ✅ A final, successful run of the test suite (`pnpm test`).

## TODO

- **`Repository.ts`**:
  - [ ] `// TODO: Get from config` for author in `createNewRepository`
  - [ ] `// TODO: Get tags for this revision` in `getLatest`
  - [ ] `// TODO: Get tags for this revision` in `getByRevision`
  - [ ] `// TODO: Implement auto-tagging strategy` in `applyAutoTag`
- **Documentation**:
  - [ ] Write a comprehensive `README.md` for the `repository` module, explaining its architecture, usage, and how to extend it.
- **Integration**:
  - [ ] The `SongRepository.ts` example is present, but there are no integration tests to verify it works as expected. Add integration tests for the example implementation.
