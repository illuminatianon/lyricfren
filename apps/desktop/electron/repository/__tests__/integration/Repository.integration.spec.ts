import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import fs from 'fs-extra';
import * as os from 'os';
import { SongRepository, SongContent, SongMetadata } from '../../examples/SongRepository';
import { Entity } from '../../types';

/**
 * Integration tests for the Repository system
 * These tests use real Git operations (not mocked) to verify end-to-end functionality
 */
describe('Repository Integration Tests', () => {
  let tempDir: string;
  let repository: SongRepository;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-integration-test-'));
    repository = new SongRepository(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should create and initialize a new repository', async () => {
    await repository.initialize();

    // Verify repository structure
    expect(await fs.pathExists(path.join(tempDir, '.git'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, 'metadata.json'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, 'lyrics.md'))).toBe(true);

    // Verify initial content
    const lyricsContent = await fs.readFile(path.join(tempDir, 'lyrics.md'), 'utf-8');
    expect(lyricsContent).toContain('[Verse 1]');
    expect(lyricsContent).toContain('[Chorus]');

    // Verify metadata
    const metadata = await fs.readJson(path.join(tempDir, 'metadata.json'));
    expect(metadata.id).toBeDefined();
    expect(metadata.created).toBeDefined();
  });

  it('should save and retrieve entities with real Git commits', async () => {
    await repository.initialize();

    // Get initial entity
    const initialEntity = await repository.getLatest();
    expect(initialEntity.content.lyrics).toContain('[Verse 1]');

    // Modify the entity
    const modifiedLyrics = `# My Test Song

[Verse 1]
This is the first verse
Of my test song

[Chorus]
This is the chorus
Everyone sings along

[Verse 2]
This is the second verse
The story continues on
`;

    const modifiedEntity: Entity<SongContent, SongMetadata> = {
      ...initialEntity,
      content: {
        lyrics: modifiedLyrics,
        structure: ['Verse 1', 'Chorus', 'Verse 2'],
        sections: {
          'Verse 1': 'This is the first verse\nOf my test song',
          'Chorus': 'This is the chorus\nEveryone sings along',
          'Verse 2': 'This is the second verse\nThe story continues on'
        }
      },
      metadata: {
        ...initialEntity.metadata,
        title: 'My Test Song',
        genre: 'Rock',
        tags: ['test', 'rock'],
        collaborators: ['Test User']
      },
      changes: {
        content: true,
        metadata: true,
        fields: ['content', 'metadata']
      }
    };

    // Save the modified entity
    const savedEntity = await repository.save(modifiedEntity);

    // Verify the save was successful
    expect(savedEntity.isDirty).toBe(false);
    expect(savedEntity.changes.content).toBe(false);
    expect(savedEntity.changes.metadata).toBe(false);
    expect(savedEntity.content.lyrics).toBe(modifiedLyrics);
    expect(savedEntity.metadata.title).toBe('My Test Song');

    // Verify the file was actually written
    const fileContent = await fs.readFile(path.join(tempDir, 'lyrics.md'), 'utf-8');
    expect(fileContent).toBe(modifiedLyrics);

    // Verify we can retrieve the same entity
    const retrievedEntity = await repository.getLatest();
    expect(retrievedEntity.content.lyrics).toBe(modifiedLyrics);
    expect(retrievedEntity.metadata.title).toBe('My Test Song');
  });

  it('should handle repository forking', async () => {
    await repository.initialize();

    // Create some content
    const entity = await repository.getLatest();
    const modifiedEntity: Entity<SongContent, SongMetadata> = {
      ...entity,
      content: {
        ...entity.content,
        lyrics: '# Original Song\n\n[Verse 1]\nOriginal content\n'
      },
      changes: { content: true, metadata: false, fields: ['content'] }
    };

    const savedEntity = await repository.save(modifiedEntity);

    // Fork the repository
    const forkPath = path.join(tempDir, '..', 'fork-test');
    try {
      const forkedRepo = await repository.fork(savedEntity.revisionId, forkPath);

      // Verify fork structure
      expect(await fs.pathExists(path.join(forkPath, '.git'))).toBe(true);
      expect(await fs.pathExists(path.join(forkPath, 'metadata.json'))).toBe(true);
      expect(await fs.pathExists(path.join(forkPath, 'lyrics.md'))).toBe(true);

      // Verify fork content matches original
      const forkContent = await fs.readFile(path.join(forkPath, 'lyrics.md'), 'utf-8');
      expect(forkContent).toBe('# Original Song\n\n[Verse 1]\nOriginal content\n');

      // Verify fork metadata
      const forkMetadata = await fs.readJson(path.join(forkPath, 'metadata.json'));
      expect(forkMetadata.fork).toBeDefined();
      expect(forkMetadata.fork.sourceRevision).toBe(savedEntity.revisionId);

      // Verify fork is independent
      await forkedRepo.initialize();
      const forkEntity = await forkedRepo.getLatest();
      expect(forkEntity.repositoryId).not.toBe(entity.repositoryId);

    } finally {
      await fs.remove(forkPath);
    }
  });

  it('should detect dirty state correctly', async () => {
    await repository.initialize();

    // Initially clean
    expect(await repository.isDirty()).toBe(false);

    // Manually modify file outside of repository
    const lyricsPath = path.join(tempDir, 'lyrics.md');
    await fs.writeFile(lyricsPath, '# Manually modified\n\nExternal change\n');

    // Should now be dirty
    expect(await repository.isDirty()).toBe(true);
  });

  it('should handle song-specific functionality', async () => {
    await repository.initialize();

    const entity = await repository.getLatest();

    // Test song structure parsing
    expect(entity.content.structure).toContain('Verse 1');
    expect(entity.content.structure).toContain('Chorus');
    expect(entity.content.sections).toBeDefined();

    // Test validation
    const errors = repository.validateStructure(entity.content);
    expect(errors).toHaveLength(0); // Default content should be valid

    // Test statistics
    const stats = repository.getStatistics(entity.content);
    expect(stats.sectionCount).toBeGreaterThan(0);
    expect(stats.totalLines).toBeGreaterThan(0);
  });
});
