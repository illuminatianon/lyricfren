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
    show: vi.fn(),
    addTag: vi.fn().mockResolvedValue(undefined)
  })),
  GitError: class GitError extends Error {},
  RepositoryCorruptError: class RepositoryCorruptError extends Error {}
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
});
