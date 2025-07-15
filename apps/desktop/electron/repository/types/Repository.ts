/**
 * Standardized repository operations enum
 */
export enum RepositoryOperation {
  REPO_INIT = 'REPO_INIT',
  SLUG_UPDATE = 'SLUG_UPDATE',
  CONTENT_UPDATE = 'CONTENT_UPDATE',
  METADATA_UPDATE = 'METADATA_UPDATE',
  TAG_CREATE = 'TAG_CREATE',
  REPO_FORK = 'REPO_FORK',
  EXTERNAL_CHANGE = 'EXTERNAL_CHANGE',
}

/**
 * Revision interface representing a git commit
 */
export interface Revision {
  id: string; // SHA hash
  signature: string; // Operation signature
  message: string; // Commit message
  timestamp: Date;
  tags: string[];
}

/**
 * Tag interface for version management
 */
export interface Tag {
  name: string;
  revisionId: string;
  created: Date;
}

/**
 * Reference interface for pointing to projects or revisions
 */
export interface Reference {
  type: string;
  id: string;
  ref?: string; // revision hash or tag name
}
