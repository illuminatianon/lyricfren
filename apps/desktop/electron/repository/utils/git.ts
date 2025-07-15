import { GitProcess } from 'dugite';

/**
 * Custom Git errors
 */
export class GitError extends Error {
  constructor(message: string, public readonly exitCode?: number) {
    super(message);
    this.name = 'GitError';
  }
}

export class RepositoryCorruptError extends GitError {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryCorruptError';
  }
}

/**
 * Git status result
 */
export interface GitStatus {
  isClean: boolean;
  modifiedFiles: string[];
  untrackedFiles: string[];
}

/**
 * Git commit info
 */
export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: Date;
}

/**
 * Git wrapper class for repository operations
 */
export class Git {
  constructor(private repositoryPath: string) { }

  /**
   * Initialize a new git repository
   */
  async init(): Promise<void> {
    const result = await GitProcess.exec(['init'], this.repositoryPath);
    if (result.exitCode !== 0) {
      throw new GitError(`Failed to initialize repository: ${result.stderr}`, result.exitCode);
    }
  }

  /**
   * Create a commit with the given message
   */
  async commit(message: string): Promise<string> {
    // First add all changes
    const addResult = await GitProcess.exec(['add', '.'], this.repositoryPath);
    if (addResult.exitCode !== 0) {
      throw new GitError(`Failed to stage changes: ${addResult.stderr}`, addResult.exitCode);
    }

    // Then commit
    const commitResult = await GitProcess.exec(['commit', '-m', message], this.repositoryPath);
    if (commitResult.exitCode !== 0) {
      throw new GitError(`Failed to commit: ${commitResult.stderr}`, commitResult.exitCode);
    }

    // Get the commit SHA
    const shaResult = await GitProcess.exec(['rev-parse', 'HEAD'], this.repositoryPath);
    if (shaResult.exitCode !== 0) {
      throw new GitError(`Failed to get commit SHA: ${shaResult.stderr}`, shaResult.exitCode);
    }

    return shaResult.stdout.trim();
  }

  /**
   * Get repository status
   */
  async getStatus(): Promise<GitStatus> {
    const result = await GitProcess.exec(['status', '--porcelain'], this.repositoryPath);
    if (result.exitCode !== 0) {
      throw new GitError(`Failed to get status: ${result.stderr}`, result.exitCode);
    }

    // Parse the porcelain output
    const lines = result.stdout.split('\n').filter(line => line.length > 0);
    const modifiedFiles: string[] = [];
    const untrackedFiles: string[] = [];

    for (const line of lines) {
      if (line.length < 3) continue;

      const status = line.substring(0, 2);
      const filename = line.substring(3);

      if (status === '??') {
        untrackedFiles.push(filename);
      } else {
        modifiedFiles.push(filename);
      }
    }

    return {
      isClean: lines.length === 0,
      modifiedFiles,
      untrackedFiles
    };
  }

  /**
   * Get file content from a specific revision
   */
  async show(revision: string, filePath: string): Promise<string> {
    const result = await GitProcess.exec(['show', `${revision}:${filePath}`], this.repositoryPath);
    if (result.exitCode !== 0) {
      throw new GitError(`Failed to show file ${filePath} at revision ${revision}: ${result.stderr}`, result.exitCode);
    }
    return result.stdout;
  }

  /**
   * Add a tag to a specific revision
   */
  async addTag(tagName: string, revision?: string): Promise<void> {
    const args = ['tag', tagName];
    if (revision) {
      args.push(revision);
    }

    const result = await GitProcess.exec(args, this.repositoryPath);
    if (result.exitCode !== 0) {
      throw new GitError(`Failed to create tag ${tagName}: ${result.stderr}`, result.exitCode);
    }
  }

  /**
   * Get commit history
   */
  async getHistory(limit?: number): Promise<GitCommit[]> {
    const args = ['log', '--pretty=format:%H|%s|%an|%ai'];
    if (limit) {
      args.push(`-${limit}`);
    }

    const result = await GitProcess.exec(args, this.repositoryPath);
    if (result.exitCode !== 0) {
      throw new GitError(`Failed to get history: ${result.stderr}`, result.exitCode);
    }

    // Handle empty history (no commits yet)
    if (!result.stdout.trim()) {
      return [];
    }

    return result.stdout.trim().split('\n').map(line => {
      const [sha, message, author, date] = line.split('|');
      return {
        sha,
        message,
        author,
        date: new Date(date)
      };
    });
  }
}
