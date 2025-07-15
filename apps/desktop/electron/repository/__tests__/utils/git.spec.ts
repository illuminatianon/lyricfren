import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Git, GitError, RepositoryCorruptError } from '../../utils/git';

// Mock dugite for testing
vi.mock('dugite', () => ({
  GitProcess: {
    exec: vi.fn()
  }
}));

import { GitProcess } from 'dugite';

describe('Git Utilities', () => {
  let git: Git;
  const testRepoPath = '/test/repo/path';
  const mockGitProcess = vi.mocked(GitProcess);

  beforeEach(() => {
    git = new Git(testRepoPath);
    vi.clearAllMocks();
  });

  describe('Error classes', () => {
    it('should create GitError with message and exit code', () => {
      const error = new GitError('Test error', 1);
      expect(error.message).toBe('Test error');
      expect(error.exitCode).toBe(1);
      expect(error.name).toBe('GitError');
    });

    it('should create RepositoryCorruptError', () => {
      const error = new RepositoryCorruptError('Corrupt repo');
      expect(error.message).toBe('Corrupt repo');
      expect(error.name).toBe('RepositoryCorruptError');
    });
  });

  describe('Git operations', () => {
    describe('init', () => {
      it('should initialize repository successfully', async () => {
        mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });

        await expect(git.init()).resolves.toBeUndefined();
        expect(mockGitProcess.exec).toHaveBeenCalledWith(['init'], testRepoPath);
      });

      it('should throw GitError on failure', async () => {
        mockGitProcess.exec.mockResolvedValue({ exitCode: 1, stdout: '', stderr: 'Init failed' });

        await expect(git.init()).rejects.toThrow(GitError);
        await expect(git.init()).rejects.toThrow('Failed to initialize repository: Init failed');
      });
    });

    describe('commit', () => {
      it('should commit successfully and return SHA', async () => {
        mockGitProcess.exec
          .mockResolvedValueOnce({ exitCode: 0, stdout: '', stderr: '' }) // add
          .mockResolvedValueOnce({ exitCode: 0, stdout: '', stderr: '' }) // commit
          .mockResolvedValueOnce({ exitCode: 0, stdout: 'abc123\n', stderr: '' }); // rev-parse

        const sha = await git.commit('test message');

        expect(sha).toBe('abc123');
        expect(mockGitProcess.exec).toHaveBeenCalledWith(['add', '.'], testRepoPath);
        expect(mockGitProcess.exec).toHaveBeenCalledWith(['commit', '-m', 'test message'], testRepoPath);
        expect(mockGitProcess.exec).toHaveBeenCalledWith(['rev-parse', 'HEAD'], testRepoPath);
      });

      it('should throw GitError on add failure', async () => {
        mockGitProcess.exec.mockResolvedValue({ exitCode: 1, stdout: '', stderr: 'Add failed' });

        await expect(git.commit('test')).rejects.toThrow(GitError);
        await expect(git.commit('test')).rejects.toThrow('Failed to stage changes: Add failed');
      });
    });
  });

  describe('getStatus', () => {
    it('should return clean status for empty output', async () => {
      mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });

      const status = await git.getStatus();

      expect(status.isClean).toBe(true);
      expect(status.modifiedFiles).toEqual([]);
      expect(status.untrackedFiles).toEqual([]);
    });

    it('should parse modified and untracked files', async () => {
      const output = ' M file1.txt\n?? file2.txt\nA  file3.txt\n';
      mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: output, stderr: '' });

      const status = await git.getStatus();

      expect(status.isClean).toBe(false);
      expect(status.modifiedFiles).toEqual(['file1.txt', 'file3.txt']);
      expect(status.untrackedFiles).toEqual(['file2.txt']);
    });
  });

  describe('show', () => {
    it('should return file content from revision', async () => {
      const content = 'file content';
      mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: content, stderr: '' });

      const result = await git.show('abc123', 'file.txt');

      expect(result).toBe(content);
      expect(mockGitProcess.exec).toHaveBeenCalledWith(['show', 'abc123:file.txt'], testRepoPath);
    });
  });

  describe('addTag', () => {
    it('should create tag without revision', async () => {
      mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });

      await git.addTag('v1.0');

      expect(mockGitProcess.exec).toHaveBeenCalledWith(['tag', 'v1.0'], testRepoPath);
    });

    it('should create tag with specific revision', async () => {
      mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });

      await git.addTag('v1.0', 'abc123');

      expect(mockGitProcess.exec).toHaveBeenCalledWith(['tag', 'v1.0', 'abc123'], testRepoPath);
    });
  });

  describe('getHistory', () => {
    it('should return empty array for no commits', async () => {
      mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });

      const history = await git.getHistory();

      expect(history).toEqual([]);
    });

    it('should parse commit history', async () => {
      const output = 'abc123|Initial commit|John Doe|2023-01-01T00:00:00Z\ndef456|Second commit|Jane Doe|2023-01-02T00:00:00Z';
      mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: output, stderr: '' });

      const history = await git.getHistory();

      expect(history).toHaveLength(2);
      expect(history[0]).toEqual({
        sha: 'abc123',
        message: 'Initial commit',
        author: 'John Doe',
        date: new Date('2023-01-01T00:00:00Z')
      });
    });

    it('should respect limit parameter', async () => {
      mockGitProcess.exec.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });

      await git.getHistory(5);

      expect(mockGitProcess.exec).toHaveBeenCalledWith(['log', '--pretty=format:%H|%s|%an|%ai', '-5'], testRepoPath);
    });
  });
});
