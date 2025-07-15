# Repository Design Document

This document outlines a proposal for a new repository-based file handling system.

## Core Concepts

### Repository

* The `Repository` is a new abstraction that provides data persistence using an internal `git` repository.
* It defines the semantics for all versioning operations, such as creating revisions and applying tags.
* The base `Repository` will be extensible to create more specialized repositories, such as a `ProjectRepository`.
* Each `Repository` is self-contained within its own folder with a `.git` directory, preventing conflicts between
  repositories.

#### Proposed TypeScript Class
```typescript
abstract class Repository {
  protected id: string;
  protected path: string;
  protected metadata: GlobalMetadata;

  constructor(path: string);

  abstract getEntity(revision?: string): Entity;
  abstract save(entity: Entity): Entity;
  abstract fork(revision: string): Repository;
  isDirty(): boolean;
  // other methods
}
```
#### Content vs Metadata

* **CONTENT**: The primary data that the Repository is responsible for tracking (e.g., for a `SongRepository`, this would be the markdown file containing lyrics).
* **METADATA**: Both Repository internals (title, slug, ID, etc.) and any additional data associated with the specific Repository type.

#### Initial Limitations

The initial implementation of the `Repository` will not support the following `git` features:

* Branches
* Merging
* Remotes

#### Filesystem Isolation Principle

To avoid git conflicts and ensure data integrity, the Repository system follows strict filesystem isolation:

* **Read-Only Operations**: All read operations (`getRevision()`) work with in-memory copies only
* **Write Operations**: Filesystem changes ONLY occur during:
  - `Repository::save(revision)` - Commits changes to git
  - `Repository::fork(revision)` - Creates a new repository
* **Memory-Only Modifications**: When consumers modify a Revision, all changes remain in memory until explicitly saved
* **No Working Directory Conflicts**: This design completely avoids:
  - Stashing requirements
  - Merge conflicts
  - Uncommitted changes blocking operations
  - Need for git reset/checkout operations
* **Atomic Operations**: Each save operation is atomic - it either fully succeeds or fails with no partial state

#### Forks

A "Fork" is essentially a "Save As" operation for an Entity:

* Takes a specific Entity (at any revision) and creates a new, independent Repository from it
* The new Repository starts fresh with only the forked Entity as its initial state
* No history from the source Repository is carried over (clean slate)
* Fork origin metadata is stored in the `metadata.json` file under a `fork` key:
  ```json
  {
    "fork": {
      "sourceRepositoryId": "hash-of-source-repo",
      "sourceRevision": "git-commit-hash",
      "forkedAt": "2024-01-15T10:30:00Z"
    }
  }
  ```

#### Proposed Interface
```typescript
interface ForkMetadata {
  sourceRepositoryId: string;
  sourceRevision: string;
  forkedAt: string; // ISO date string
}
```

This design allows users to take any point in a Repository's history and start a new, independent line of development.

#### Git Simplification Strategy

By limiting git features and filesystem access, the Repository system avoids common git pitfalls:

* **No Branches = No Merge Conflicts**: Linear history only
* **No Remotes = No Pull/Push/Rebase Issues**: Self-contained repositories
* **No Working Directory Modifications = No Stashing**: All work happens in memory
* **Atomic Saves = No Partial States**: Operations either complete or fail entirely
* **Single HEAD = No Detached HEAD States**: Repository always has a clear current state

#### Revision Signature Strategy

* The system will use a set of standardized, parsable messages for the subject line of each revision.
* These messages will correspond to specific operations (e.g., `PROJECT_CREATE`, `METADATA_UPDATE`).
* Multiple operations can be combined in a single revision using comma separation:
  `CONTENT_UPDATE,METADATA_UPDATE,TAG_CREATE`
* Operations that trigger auto-tagging (like `CONTENT_UPDATE`) implicitly include `METADATA_UPDATE` and `TAG_CREATE` in
  their signature
* The body of the revision can be used for additional, freeform details if necessary.

#### Global Metadata

* The `Repository` is also responsible for managing its own global metadata.
* **`title`**: The display name of the repository (e.g., "My Super Cool Song Collection").
* **`slug`**: A mutable, URL-friendly identifier used for the directory and file names (e.g., "
  my_super_cool_song_collection").
* **`ID`**: An immutable, unique hash assigned to the repository upon creation.
* **`description`**: A brief description of the repository.
* **`created`**: The date the repository was created.
* **`author`**: The user who created the repository.

#### Proposed Interface

```typescript
interface GlobalMetadata {
  title: string;
  slug: string;
  id: string;
  description: string;
  created: Date;
  author: string;
}
```

#### Repository Structure

Each Repository follows a standardized directory structure:

```
repository-slug/
├── .git/                 # Git repository data
├── content.md           # Primary content file (name/extension varies by repository type)
├── metadata.json        # Repository and type-specific metadata
└── assets/              # Optional: Additional files related to the content
```

#### Dirty State Detection

When a Repository is opened, it must check for uncommitted changes made externally:

* **Detection**: On initialization, Repository checks git status for any modifications to tracked files
* **Status**: Repository exposes a `isDirty()` method and `dirtyFiles` property
* **User Decision**: The application must prompt the user to either:
  - Save the external changes as a new revision
  - Discard the external changes and revert to the last commit
* **No Automatic Action**: Repository will NOT automatically commit or discard changes

#### Repository Operations

This section details the standardized operations that the `Repository` will perform.

#### Proposed Enum
```typescript
enum RepositoryOperation {
  REPO_INIT = 'REPO_INIT',
  SLUG_UPDATE = 'SLUG_UPDATE',
  CONTENT_UPDATE = 'CONTENT_UPDATE',
  METADATA_UPDATE = 'METADATA_UPDATE',
  TAG_CREATE = 'TAG_CREATE',
  REPO_FORK = 'REPO_FORK',
  EXTERNAL_CHANGE = 'EXTERNAL_CHANGE',
}
```

* **`REPO_INIT`**
  * **Description**: Initializes a new repository.
  * **Revision Signature**: `REPO_INIT`
  * **Revision Meta**: N/A
  * **Autotagged**: No

* **`SLUG_UPDATE`**
  * **Description**: Updates the `slug` for a project.
  * **Revision Signature**: `SLUG_UPDATE`
  * **Revision Meta**: "old slug, new slug"
  * **Autotagged**: No
  * **Operation**: Renames the project's folder and main file.

* **`CONTENT_UPDATE`**
  * **Description**: Updates the main content file of a project.
  * **Revision Signature**: `CONTENT_UPDATE`
  * **Revision Meta**: N/A
  * **Autotagged**: Yes

* **`METADATA_UPDATE`**
  * **Description**: Updates a project's `metadata.json` file.
  * **Revision Signature**: `METADATA_UPDATE`
  * **Revision Meta**: N/A
  * **Autotagged**: No

* **`TAG_CREATE`**
  * **Description**: Manually applies a tag to a revision.
  * **Revision Signature**: `TAG_CREATE`
  * **Revision Meta**: Tag name and revision hash.
  * **Autotagged**: No

* **`REPO_FORK`**
  * **Description**: Creates a new independent Repository from an existing one at a specific revision.
  * **Revision Signature**: `REPO_FORK`
  * **Revision Meta**: Source repository ID, source revision hash, fork date.
  * **Autotagged**: No
  * **Note**: This operation creates a new Repository, not a revision in the existing one. The REPO_FORK revision is
    created in the new repository.

* **`EXTERNAL_CHANGE`**
  * **Description**: Commits changes that were made outside of the Repository system.
  * **Revision Signature**: `EXTERNAL_CHANGE,CONTENT_UPDATE,METADATA_UPDATE`
  * **Revision Meta**: "External modifications detected and saved"
  * **Autotagged**: Yes (follows same rules as CONTENT_UPDATE)
  * **Note**: Used when Repository detects dirty state and user chooses to save external changes.

## Entities, Revisions & Versioning

The repository manages Entities through revisions and tags.

### Entities

An `Entity` is the actual content object that a Repository manages (e.g., a Song, Style, or any domain object). When you retrieve data from a Repository, you get an Entity - not just version metadata, but the actual thing itself.

Key characteristics:

* **Domain Objects**: Entities are the actual things being stored (Song, Style, etc.)
* **Immutable Snapshots**: Each Entity represents the complete state at a specific point in time
* **Self-contained**: Contains all CONTENT and METADATA from the Repository at that point
* **Detached**: While created from a Repository, Entities exist as independent objects
* **Persistable**: Contains enough information to be saved back to the Repository
* **No History Knowledge**: Entities only know their own revision ID and their parent Repository ID

### Revisions

A revision is a git commit that captures an Entity's state at a specific point in time. Each revision:
* Has a unique SHA hash identifier
* Records what changed via standardized commit messages
* Can be tagged for easy reference
* Forms part of the Repository's linear history

#### Entity Object Model

When calling `Repository::getEntity('xyz')` or `Repository::getEntity()` for latest, the returned Entity object includes:

```typescript
interface Entity {
  revisionId: string;
  repositoryId: string;
  timestamp: Date;
  content: any;
  metadata: object;

  version: {
    signature: string;
    message: string;
    tags: string[];
  };

  isDirty: boolean;
  changes: {
    content: boolean;
    metadata: boolean;
    fields: string[];
  };
}
```

#### Entity Dirty State

Entities track their own modifications to help consumers understand what has changed:

* **Immutability with Tracking**: While Entity data remains immutable (changes create copies), the Entity tracks
  that it has been modified
* **Change Detection**: When consumers modify content or metadata, the Entity automatically marks itself as dirty
* **Change Details**: The `changes` object provides granular information about what was modified
* **Consumer Helper**: This is primarily a convenience feature for consumers - Repository may or may not use this
  information when saving
* **Reset on Save**: When a dirty Entity is saved to Repository, a new clean Entity is created with a new revision

#### Type-Specific Entities

Each Repository type manages a corresponding Entity type:

* `SongRepository` → `Song` (Entity)
* `StyleRepository` → `Style` (Entity)
* Custom repositories follow the pattern: `FooRepository` → `Foo` (Entity)

The Entity IS the domain object - when you get a Song from SongRepository, you get an actual Song object with all its data, not just version information.

#### Entity Lifecycle

1. **Retrieval**: `entity = Repository::getEntity('xyz')` - Returns an immutable Entity object (memory copy)
   - For latest: `entity = Repository::getEntity()` or `Repository::getLatest()`
   - For specific version: `entity = Repository::getEntity('revision-id')` or `Repository::getByTag('v1.2')`
2. **Modification**: All changes occur in memory only:
   - Original Entity remains immutable
   - Modified data exists only in application memory
   - No filesystem changes occur during modification
   - Multiple Entities can be modified simultaneously without conflict
3. **Persistence**: `Repository::save(entity)` - The ONLY time filesystem changes occur:
   - Validates entity.repositoryId matches
   - Creates a new git commit (revision) with appropriate signature
   - Atomically updates CONTENT and METADATA files
   - Applies any configured auto-tagging strategies
   - Returns a new, clean Entity object representing the saved state with updated revisionId

#### File Access Strategy

The Repository uses different strategies for retrieving Entity data depending on whether it's the latest version or a
historical one:

**Latest Entity** (`Repository::getEntity()` or `Repository::getLatest()`):

- Reads CONTENT and METADATA directly from the file system
- No git operations required
- Still returns an immutable Entity object (data is copied, not referenced)
- Most efficient for common read operations

**Historical Entity** (`Repository::getEntity('abc123')` or `Repository::getByTag('v1.0')`):

- Uses git to retrieve file contents from the specified revision
- Does NOT move HEAD or change working directory
- May use temporary directories (e.g., `/tmp`) to extract historical file contents
- Returns the same immutable Entity object structure

**Important**: Regardless of source (filesystem or git history), all Entities are immutable. Even when loaded from
disk, the Entity object contains a copy of the data, ensuring changes don't affect the Repository's working directory.

### Tags

* **Tag**: A `Tag` is a human-readable label that points to a specific `Revision`. Tags are the primary mechanism for
  versioning projects.
* **Tagging Strategies**: The system will use configurable strategies to automatically apply tags to certain revisions (
  e.g., `CONTENT_UPDATE`).
  * **Autoincrement**: Applies an automatically increasing integer tag (e.g., `v1`, `v2`, `v3`).
  * **Semantic Versioning**: Applies a `semver` tag (e.g., `v1.2.3`).
  * These strategies will be extensible.
* **Tag Conflict Resolution**:
  * Tags must be unique within a repository
  * Attempting to create a duplicate tag will result in an error
  * Tags can be moved to different revisions using a `TAG_UPDATE` operation (which creates a new revision documenting
    the change)
  * Deleted tags are tracked in the revision history but removed from active use

## References

A "Reference" is a data structure that points to a specific project or a revision of a project.

* `type`: The type of project being referenced (e.g., "song", "style").
* `ID`: The immutable `ID` of the referenced project.
* `ref` (optional): A reference to a specific version, which can be:
  * A revision hash (for a "locked" reference).
  * A tag (e.g., `v1.2.3`).

#### Proposed Interface
```typescript
interface Reference {
  type: string;
  id: string;
  ref?: string;
}
```

If `ref` is not provided, the reference is "unlocked" and points to the latest revision of the project.

## Error Handling

The Repository system should handle the following error cases:

### Git Operation Failures

- **Corrupted Repository**: Detect and report when git operations fail due to corruption
- **Invalid Revision**: Handle references to non-existent commits or tags
- **Merge Conflicts**: Although merging is not supported, handle cases where git state becomes inconsistent

### Repository-Level Errors

- **Missing Required Files**: Handle cases where `content` or `metadata.json` are missing
- **Invalid Metadata**: Validate metadata structure and report malformed JSON
- **Duplicate Repository IDs**: Ensure unique IDs during repository creation
- **Invalid Slug Format**: Validate slugs match URL-friendly patterns (e.g., `/^[a-z0-9-_]+$/`)

### Operation-Specific Errors

- **Fork Failures**: Handle cases where source repository doesn't exist or revision is invalid
- **Tag Conflicts**: Prevent duplicate tag names within a repository
- **Content Update Failures**: Handle file system errors during content updates

### Entity-Repository Alignment

- **Repository ID Validation**: When `Repository::save(entity)` is called, the Repository MUST verify that `entity.repositoryId` matches its own ID
- **Misalignment Error**: Attempting to save an Entity with a different `repositoryId` is a critical error and must be rejected
- **Error Type**: This should throw a specific error type (e.g., `EntityMismatchError`) with clear messaging
- **No Cross-Repository Saves**: This prevents accidentally saving Entities to the wrong Repository
