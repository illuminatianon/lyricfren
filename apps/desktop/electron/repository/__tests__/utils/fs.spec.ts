import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import {
  readJsonFile,
  writeJsonFile,
  ensureDirectory,
  copyFile,
  renameFile,
  exists,
  readTextFile,
  writeTextFile
} from '../../utils/fs';

describe('Filesystem Utilities', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('JSON file operations', () => {
    it('should write and read JSON files', async () => {
      const filePath = path.join(tempDir, 'test.json');
      const testData = { name: 'test', value: 42 };

      await writeJsonFile(filePath, testData);
      const result = await readJsonFile(filePath);

      expect(result).toEqual(testData);
    });

    it('should throw error for non-existent JSON file', async () => {
      const filePath = path.join(tempDir, 'nonexistent.json');
      
      await expect(readJsonFile(filePath)).rejects.toThrow('File not found');
    });

    it('should throw error for invalid JSON', async () => {
      const filePath = path.join(tempDir, 'invalid.json');
      await fs.writeFile(filePath, 'invalid json content');
      
      await expect(readJsonFile(filePath)).rejects.toThrow('Failed to read JSON file');
    });
  });

  describe('Text file operations', () => {
    it('should write and read text files', async () => {
      const filePath = path.join(tempDir, 'test.txt');
      const testContent = 'Hello, world!\nThis is a test.';

      await writeTextFile(filePath, testContent);
      const result = await readTextFile(filePath);

      expect(result).toBe(testContent);
    });

    it('should throw error for non-existent text file', async () => {
      const filePath = path.join(tempDir, 'nonexistent.txt');
      
      await expect(readTextFile(filePath)).rejects.toThrow('File not found');
    });
  });

  describe('Directory operations', () => {
    it('should ensure directory exists', async () => {
      const dirPath = path.join(tempDir, 'nested', 'directory');
      
      await ensureDirectory(dirPath);
      
      expect(await fs.pathExists(dirPath)).toBe(true);
    });

    it('should not fail if directory already exists', async () => {
      const dirPath = path.join(tempDir, 'existing');
      await fs.ensureDir(dirPath);
      
      await expect(ensureDirectory(dirPath)).resolves.not.toThrow();
    });
  });

  describe('File operations', () => {
    it('should copy files', async () => {
      const srcPath = path.join(tempDir, 'source.txt');
      const destPath = path.join(tempDir, 'destination.txt');
      const content = 'test content';

      await fs.writeFile(srcPath, content);
      await copyFile(srcPath, destPath);

      expect(await fs.readFile(destPath, 'utf-8')).toBe(content);
    });

    it('should rename files', async () => {
      const oldPath = path.join(tempDir, 'old.txt');
      const newPath = path.join(tempDir, 'new.txt');
      const content = 'test content';

      await fs.writeFile(oldPath, content);
      await renameFile(oldPath, newPath);

      expect(await fs.pathExists(oldPath)).toBe(false);
      expect(await fs.readFile(newPath, 'utf-8')).toBe(content);
    });

    it('should check file existence', async () => {
      const existingPath = path.join(tempDir, 'existing.txt');
      const nonExistentPath = path.join(tempDir, 'nonexistent.txt');

      await fs.writeFile(existingPath, 'content');

      expect(await exists(existingPath)).toBe(true);
      expect(await exists(nonExistentPath)).toBe(false);
    });
  });
});
