import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import { Repository, EntityMismatchError } from '../../core/Repository';
import { Entity } from '../../types';

// Mock the Git class since dugite isn't available yet
vi.mock('../../utils/git', () => ({
  Git: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue('abc123'),
    getStatus: vi.fn().mockResolvedValue({ isClean: true, modifiedFiles: [], untrackedFiles: [] }),
    getHistory: vi.fn().mockResolvedValue([{
      sha: 'abc123',
      message: 'REPO_INIT',
      author: 'Test User',
      date: new Date('2024-01-01T00:00:00Z')
    }]),
    show: vi.fn().mockImplementation((revision: string, filePath: string) => {
      if (filePath === 'content.txt') {
        return Promise.resolve('Modified content');
      } else if (filePath === 'metadata.json') {
        return Promise.resolve(JSON.stringify({
          title: 'Test Repository',
          slug: 'test-repository',
          id: 'test-id',
          description: 'Test description',
          created: new Date('2024-01-01T00:00:00Z'),
          author: 'Test User'
        }));
      }
      return Promise.resolve('');
    }),
    addTag: vi.fn().mockResolvedValue(undefined)
  })),
  GitError: class GitError extends Error { },
  RepositoryCorruptError: class RepositoryCorruptError extends Error { }
}));

// Test implementation of Repository
interface TestContent {
  text: string;
  lines: string[];
}

interface TestMetadata {
  title: string;
  tags: string[];
}

class TestRepository extends Repository<TestContent, TestMetadata> {
  protected getContentFileName(): string {
    return 'content.txt';
  }

  protected getDefaultContent(): string {
    return 'Default test content';
  }

  protected async parseContent(content: string): Promise<TestContent> {
    return {
      text: content,
      lines: content.split('\n')
    };
  }

  protected serializeContent(content: TestContent): string {
    return content.text;
  }

  protected createInstance(path: string): Repository<TestContent, TestMetadata> {
    return new TestRepository(path);
  }
}

describe('Repository', () => {
  let tempDir: string;
  let repository: TestRepository;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-test-'));
    repository = new TestRepository(tempDir);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('Initialization', () => {
    it('should create new repository when none exists', async () => {
      await repository.initialize();

      // Check that metadata.json was created
      const metadataPath = path.join(tempDir, 'metadata.json');
      expect(await fs.pathExists(metadataPath)).toBe(true);

      // Check that content file was created
      const contentPath = path.join(tempDir, 'content.txt');
      expect(await fs.pathExists(contentPath)).toBe(true);

      const content = await fs.readFile(contentPath, 'utf-8');
      expect(content).toBe('Default test content');
    });

    it('should load existing repository', async () => {
      // Create existing metadata
      const existingMetadata = {
        title: 'Existing Repo',
        slug: 'existing-repo',
        id: 'existing-id',
        description: 'Test repo',
        created: new Date(),
        author: 'Test User'
      };

      await fs.writeJson(path.join(tempDir, 'metadata.json'), existingMetadata);
      await fs.writeFile(path.join(tempDir, 'content.txt'), 'Existing content');

      await repository.initialize();

      // Verify it loaded the existing metadata
      const latest = await repository.getLatest();
      expect(latest.repositoryId).toBe('existing-id');
    });
  });

  describe('Entity operations', () => {
    beforeEach(async () => {
      await repository.initialize();
    });

    it('should get latest entity', async () => {
      const entity = await repository.getLatest();

      expect(entity.repositoryId).toBeDefined();
      expect(entity.revisionId).toBe('abc123');
      expect(entity.content.text).toBe('Default test content');
      expect(entity.isDirty).toBe(false);
    });

    it('should validate repository ID when saving', async () => {
      const entity = await repository.getLatest();

      // Create entity with wrong repository ID
      const wrongEntity: Entity<TestContent, TestMetadata> = {
        ...entity,
        repositoryId: 'wrong-id'
      };

      await expect(repository.save(wrongEntity)).rejects.toThrow(EntityMismatchError);
    });

    it('should save entity and return new clean entity', async () => {
      const entity = await repository.getLatest();

      // Modify the entity
      const modifiedEntity: Entity<TestContent, TestMetadata> = {
        ...entity,
        content: {
          text: 'Modified content',
          lines: ['Modified content']
        },
        changes: {
          content: true,
          metadata: false,
          fields: ['content']
        }
      };

      const savedEntity = await repository.save(modifiedEntity);

      expect(savedEntity.isDirty).toBe(false);
      expect(savedEntity.changes.content).toBe(false);
      expect(savedEntity.content.text).toBe('Modified content');
    });
  });

  describe('Dirty state detection', () => {
    beforeEach(async () => {
      await repository.initialize();
    });

    it('should detect clean repository', async () => {
      const isDirty = await repository.isDirty();
      expect(isDirty).toBe(false);
    });

    // TODO: Add test for dirty state when Git mock is updated
  });

  describe('Historical retrieval', () => {
    beforeEach(async () => {
      await repository.initialize();
    });

    it('should get entity from specific revision', async () => {
      const entity = await repository.getByRevision('abc123');

      expect(entity.revisionId).toBe('abc123');
      expect(entity.repositoryId).toBeDefined();
      expect(entity.content.text).toBe('Modified content');
      expect(entity.isDirty).toBe(false);
    });

    it('should throw error for non-existent revision', async () => {
      // Mock git.show to throw an error for non-existent revision
      const mockGit = repository['git'] as any;
      mockGit.show.mockRejectedValueOnce(new Error('Revision not found'));

      await expect(repository.getByRevision('nonexistent')).rejects.toThrow();
    });
  });

  describe('Auto-tagging', () => {
    beforeEach(async () => {
      await repository.initialize();
    });

    it('should create auto-tag on content update', async () => {
      const entity = await repository.getLatest();

      // Modify content to trigger auto-tagging
      const modifiedEntity: Entity<TestContent, TestMetadata> = {
        ...entity,
        content: {
          text: 'Content for auto-tag',
          lines: ['Content for auto-tag']
        },
        changes: {
          content: true,
          metadata: false,
          fields: ['content']
        }
      };

      await repository.save(modifiedEntity);

      // Verify addTag was called
      const mockGit = repository['git'] as any;
      expect(mockGit.addTag).toHaveBeenCalled();
    });

    it('should not create auto-tag on metadata-only update', async () => {
      const entity = await repository.getLatest();

      // Modify only metadata
      const modifiedEntity: Entity<TestContent, TestMetadata> = {
        ...entity,
        metadata: {
          ...entity.metadata,
          description: 'Updated description'
        },
        changes: {
          content: false,
          metadata: true,
          fields: ['metadata']
        }
      };

      await repository.save(modifiedEntity);

      // Verify addTag was not called
      const mockGit = repository['git'] as any;
      expect(mockGit.addTag).not.toHaveBeenCalled();
    });
  });

  describe('Forking', () => {
    beforeEach(async () => {
      await repository.initialize();
    });

    it('should create fork at specific revision', async () => {
      const forkPath = path.join(tempDir, '..', 'fork-test');

      try {
        const forkedRepo = await repository.fork('abc123', forkPath);

        expect(forkedRepo).toBeInstanceOf(TestRepository);
        expect(await fs.pathExists(path.join(forkPath, 'metadata.json'))).toBe(true);
        expect(await fs.pathExists(path.join(forkPath, 'content.txt'))).toBe(true);

        // Check fork metadata
        const forkMetadata = await fs.readJson(path.join(forkPath, 'metadata.json'));
        expect(forkMetadata.fork).toBeDefined();
        expect(forkMetadata.fork.sourceRevision).toBe('abc123');
      } finally {
        await fs.remove(forkPath);
      }
    });
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      await repository.initialize();
    });

    it('should handle git operation failures gracefully', async () => {
      const mockGit = repository['git'] as any;
      mockGit.commit.mockRejectedValueOnce(new Error('Git commit failed'));

      const entity = await repository.getLatest();
      const modifiedEntity: Entity<TestContent, TestMetadata> = {
        ...entity,
        content: { text: 'New content', lines: ['New content'] },
        changes: { content: true, metadata: false, fields: ['content'] }
      };

      await expect(repository.save(modifiedEntity)).rejects.toThrow('Git commit failed');
    });

    it('should handle corrupted repository metadata', async () => {
      // Create corrupted metadata file
      const metadataPath = path.join(tempDir, 'metadata.json');
      await fs.writeFile(metadataPath, 'invalid json');

      const corruptedRepo = new TestRepository(tempDir);
      await expect(corruptedRepo.initialize()).rejects.toThrow();
    });

    it('should handle missing content file', async () => {
      // Remove content file after initialization
      await repository.initialize();
      const contentPath = path.join(tempDir, 'content.txt');
      await fs.remove(contentPath);

      await expect(repository.getLatest()).rejects.toThrow();
    });
  });
});
