# Repository System Implementation

This directory contains the implementation of the Repository system as outlined in `/docs/Repository.md`.

## Current Status

### ✅ Completed
- **Types and Interfaces**: All TypeScript interfaces defined
  - `Entity<T, M>`: Generic entity interface
  - `GlobalMetadata`: Repository metadata structure
  - `ForkMetadata`: Fork tracking metadata
  - `RepositoryOperation`: Standardized operation enum
  - `Revision`, `Tag`, `Reference`: Supporting types

- **Utility Modules**: Core helper functions implemented
  - `utils/fs.ts`: Filesystem operations (JSON, text files, directories)
  - `utils/git.ts`: Git wrapper class structure (awaiting dugite)

- **Core Repository Class**: Abstract base class implemented
  - `core/Repository.ts`: Full abstract implementation
  - Initialization (new/existing repositories)
  - Entity CRUD operations
  - Dirty state detection
  - Fork functionality
  - Error handling with custom error types

- **Test Structure**: Comprehensive test suite created
  - Unit tests for filesystem utilities
  - Mock tests for Git utilities
  - Integration tests for Repository class
  - Test configuration with Vitest

### ⏳ Pending Dependencies
- **dugite**: Git operations library (needs installation)
- **fs-extra**: Enhanced filesystem operations (needs installation)
- **vitest**: Testing framework (needs installation)
- **@types/uuid**: TypeScript types (needs installation)
- **@types/fs-extra**: TypeScript types (needs installation)

## Installation

To complete the implementation, run:

```bash
cd apps/desktop
pnpm add dugite fs-extra
pnpm add -D vitest @types/uuid @types/fs-extra
```

## Directory Structure

```
repository/
├── __tests__/
│   ├── core/
│   │   └── Repository.spec.ts      # Repository class tests
│   └── utils/
│       ├── git.spec.ts             # Git utility tests
│       └── fs.spec.ts              # Filesystem utility tests
├── core/
│   └── Repository.ts               # Abstract Repository base class
├── types/
│   ├── index.ts                    # Type exports
│   ├── Entity.ts                   # Entity interface
│   ├── Metadata.ts                 # Metadata interfaces
│   └── Repository.ts               # Repository-specific types
└── utils/
    ├── git.ts                      # Git operations wrapper
    └── fs.ts                       # Filesystem utilities
```

## Usage Example

Once dependencies are installed, you can create domain-specific repositories:

```typescript
import { Repository } from './core/Repository';

interface SongContent {
  lyrics: string;
  structure: string[];
}

interface SongMetadata {
  title: string;
  genre: string;
  bpm?: number;
}

class SongRepository extends Repository<SongContent, SongMetadata> {
  protected getContentFileName(): string {
    return 'lyrics.md';
  }

  protected getDefaultContent(): string {
    return '# New Song\n\n[Verse 1]\n\n[Chorus]\n';
  }

  protected async parseContent(content: string): Promise<SongContent> {
    return {
      lyrics: content,
      structure: this.extractStructure(content)
    };
  }

  protected serializeContent(content: SongContent): string {
    return content.lyrics;
  }

  protected createInstance(path: string): Repository<SongContent, SongMetadata> {
    return new SongRepository(path);
  }

  private extractStructure(lyrics: string): string[] {
    // Extract [Verse], [Chorus], etc. from lyrics
    const matches = lyrics.match(/\[([^\]]+)\]/g) || [];
    return matches.map(match => match.slice(1, -1));
  }
}

// Usage
const songRepo = new SongRepository('/path/to/song');
await songRepo.initialize();

const song = await songRepo.getLatest();
// Modify song...
await songRepo.save(modifiedSong);
```

## Testing

Run tests with:

```bash
pnpm test
```

## Next Steps

1. **Install Dependencies**: Complete the dependency installation
2. **Implement Git Operations**: Replace placeholder Git methods with dugite implementations
3. **Add Auto-tagging**: Implement versioning strategies (semantic, incremental)
4. **Create Domain Repositories**: Build SongRepository, StyleRepository, etc.
5. **Integration Testing**: Test with real Git repositories
6. **Performance Optimization**: Add caching and optimize file operations

## Error Handling

The system includes comprehensive error handling:

- `EntityMismatchError`: Entity doesn't belong to repository
- `TagConflictError`: Duplicate tag names
- `RepositoryNotFoundError`: Repository doesn't exist
- `GitError`: Git operation failures
- `RepositoryCorruptError`: Git repository corruption

## Design Principles

- **Filesystem Isolation**: All operations are atomic
- **Linear History**: No branches or merges
- **Memory-Only Modifications**: Changes stay in memory until saved
- **Type Safety**: Full TypeScript support with generics
- **Extensibility**: Abstract base class for domain-specific implementations
