import fs from 'fs-extra';
import * as path from 'path';

/**
 * Atomically read a JSON file
 */
export async function readJsonFile<T = any>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Failed to read JSON file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Atomically write a JSON file
 */
export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  try {
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write JSON file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    throw new Error(`Failed to ensure directory ${dirPath}: ${(error as Error).message}`);
  }
}

/**
 * Copy a file from source to destination
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  try {
    await fs.copy(src, dest);
  } catch (error) {
    throw new Error(`Failed to copy file from ${src} to ${dest}: ${(error as Error).message}`);
  }
}

/**
 * Rename/move a file or directory
 */
export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  try {
    await fs.move(oldPath, newPath);
  } catch (error) {
    throw new Error(`Failed to rename ${oldPath} to ${newPath}: ${(error as Error).message}`);
  }
}

/**
 * Check if a file or directory exists
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a text file
 */
export async function readTextFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Failed to read text file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Write a text file
 */
export async function writeTextFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write text file ${filePath}: ${(error as Error).message}`);
  }
}
