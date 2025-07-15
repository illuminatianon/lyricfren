import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Entity, GlobalMetadata, ForkMetadata, RepositoryOperation } from '../types';
import { Git, GitError, RepositoryCorruptError } from '../utils/git';
import { readJsonFile, writeJsonFile, readTextFile, writeTextFile, ensureDirectory, exists } from '../utils/fs';

/**
 * Custom repository errors
 */
export class EntityMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EntityMismatchError';
  }
}

export class TagConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagConflictError';
  }
}

export class RepositoryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryNotFoundError';
  }
}

/**
 * Abstract Repository base class
 * Provides Git-backed versioning for domain-specific entities
 */
export abstract class Repository<T = any, M = any> {
  protected id: string;
  protected path: string;
  protected metadata: GlobalMetadata & { fork?: ForkMetadata };
  protected git: Git;

  constructor(repositoryPath: string) {
    this.path = repositoryPath;
    this.git = new Git(repositoryPath);
  }

  /**
   * Initialize the repository (load existing or create new)
   */
  async initialize(): Promise<void> {
    const metadataPath = path.join(this.path, 'metadata.json');
    
    if (await exists(metadataPath)) {
      // Load existing repository
      await this.loadExistingRepository();
    } else {
      // Create new repository
      await this.createNewRepository();
    }

    // Check for dirty state
    if (await this.isDirty()) {
      console.warn(`Repository at ${this.path} has uncommitted changes`);
    }
  }

  /**
   * Load an existing repository from disk
   */
  private async loadExistingRepository(): Promise<void> {
    try {
      this.metadata = await readJsonFile(path.join(this.path, 'metadata.json'));
      this.id = this.metadata.id;
    } catch (error) {
      throw new RepositoryNotFoundError(`Failed to load repository metadata: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new repository
   */
  private async createNewRepository(): Promise<void> {
    await ensureDirectory(this.path);
    
    this.id = uuidv4();
    this.metadata = {
      title: path.basename(this.path),
      slug: path.basename(this.path),
      id: this.id,
      description: '',
      created: new Date(),
      author: 'System' // TODO: Get from config
    };

    // Initialize git repository
    await this.git.init();

    // Create initial content
    const contentPath = path.join(this.path, this.getContentFileName());
    await writeTextFile(contentPath, this.getDefaultContent());

    // Save metadata
    await writeJsonFile(path.join(this.path, 'metadata.json'), this.metadata);

    // Create initial commit
    await this.git.commit(RepositoryOperation.REPO_INIT);
  }

  /**
   * Check if repository has uncommitted changes
   */
  async isDirty(): Promise<boolean> {
    try {
      const status = await this.git.getStatus();
      return !status.isClean;
    } catch (error) {
      if (error instanceof GitError) {
        throw new RepositoryCorruptError(`Failed to check repository status: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get the latest entity from filesystem
   */
  async getLatest(): Promise<Entity<T, M>> {
    const contentPath = path.join(this.path, this.getContentFileName());
    const metadataPath = path.join(this.path, 'metadata.json');

    const content = await this.parseContent(await readTextFile(contentPath));
    const metadata = await readJsonFile<M>(metadataPath);

    // Get current HEAD revision
    const history = await this.git.getHistory(1);
    const latestCommit = history[0];

    return {
      revisionId: latestCommit.sha,
      repositoryId: this.id,
      timestamp: latestCommit.date,
      content,
      metadata,
      version: {
        signature: latestCommit.message.split('\n')[0], // First line is signature
        message: latestCommit.message,
        tags: [] // TODO: Get tags for this revision
      },
      isDirty: false,
      changes: {
        content: false,
        metadata: false,
        fields: []
      }
    };
  }

  /**
   * Get an entity from a specific revision
   */
  async getByRevision(revisionId: string): Promise<Entity<T, M>> {
    try {
      const contentPath = this.getContentFileName();
      const metadataPath = 'metadata.json';

      const contentStr = await this.git.show(revisionId, contentPath);
      const metadataStr = await this.git.show(revisionId, metadataPath);

      const content = await this.parseContent(contentStr);
      const metadata = JSON.parse(metadataStr);

      // Get commit info
      const history = await this.git.getHistory();
      const commit = history.find(c => c.sha === revisionId);
      
      if (!commit) {
        throw new Error(`Revision ${revisionId} not found in history`);
      }

      return {
        revisionId,
        repositoryId: this.id,
        timestamp: commit.date,
        content,
        metadata,
        version: {
          signature: commit.message.split('\n')[0],
          message: commit.message,
          tags: [] // TODO: Get tags for this revision
        },
        isDirty: false,
        changes: {
          content: false,
          metadata: false,
          fields: []
        }
      };
    } catch (error) {
      if (error instanceof GitError) {
        throw new RepositoryCorruptError(`Failed to retrieve revision ${revisionId}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Save an entity to the repository
   */
  async save(entity: Entity<T, M>): Promise<Entity<T, M>> {
    // Validate entity belongs to this repository
    if (entity.repositoryId !== this.id) {
      throw new EntityMismatchError(
        `Entity repository ID ${entity.repositoryId} does not match repository ID ${this.id}`
      );
    }

    // Write content and metadata atomically
    const contentPath = path.join(this.path, this.getContentFileName());
    const metadataPath = path.join(this.path, 'metadata.json');

    await writeTextFile(contentPath, this.serializeContent(entity.content));
    await writeJsonFile(metadataPath, entity.metadata);

    // Create commit with appropriate signature
    const signature = this.determineOperationSignature(entity);
    const commitSha = await this.git.commit(signature);

    // Apply auto-tagging if needed
    if (signature.includes(RepositoryOperation.CONTENT_UPDATE)) {
      await this.applyAutoTag(commitSha);
    }

    // Return new clean entity
    return await this.getByRevision(commitSha);
  }

  /**
   * Fork this repository at a specific revision
   */
  async fork(revisionId: string, newPath: string): Promise<Repository<T, M>> {
    // Get the entity at the specified revision
    const sourceEntity = await this.getByRevision(revisionId);

    // Create new repository instance
    const forkedRepo = this.createInstance(newPath);
    await ensureDirectory(newPath);

    // Initialize new git repository
    await forkedRepo.git.init();

    // Set up fork metadata
    const forkMetadata: ForkMetadata = {
      sourceRepositoryId: this.id,
      sourceRevision: revisionId,
      forkedAt: new Date().toISOString()
    };

    const newMetadata = {
      ...sourceEntity.metadata,
      id: uuidv4(),
      fork: forkMetadata
    };

    // Write content and metadata
    const contentPath = path.join(newPath, forkedRepo.getContentFileName());
    const metadataPath = path.join(newPath, 'metadata.json');

    await writeTextFile(contentPath, forkedRepo.serializeContent(sourceEntity.content));
    await writeJsonFile(metadataPath, newMetadata);

    // Create initial commit in forked repository
    await forkedRepo.git.commit(RepositoryOperation.REPO_FORK);

    return forkedRepo;
  }

  // Abstract methods that subclasses must implement
  protected abstract getContentFileName(): string;
  protected abstract getDefaultContent(): string;
  protected abstract parseContent(content: string): Promise<T>;
  protected abstract serializeContent(content: T): string;
  protected abstract createInstance(path: string): Repository<T, M>;

  // Helper methods
  private determineOperationSignature(entity: Entity<T, M>): string {
    const operations: string[] = [];
    
    if (entity.changes.content) {
      operations.push(RepositoryOperation.CONTENT_UPDATE);
    }
    
    if (entity.changes.metadata) {
      operations.push(RepositoryOperation.METADATA_UPDATE);
    }

    return operations.length > 0 ? operations.join(',') : RepositoryOperation.METADATA_UPDATE;
  }

  private async applyAutoTag(commitSha: string): Promise<void> {
    // TODO: Implement auto-tagging strategy
    // For now, just increment version number
    const history = await this.git.getHistory();
    const versionNumber = history.length;
    const tagName = `v${versionNumber}`;
    
    try {
      await this.git.addTag(tagName, commitSha);
    } catch (error) {
      // Tag conflicts are non-fatal for auto-tagging
      console.warn(`Failed to create auto-tag ${tagName}: ${(error as Error).message}`);
    }
  }
}
