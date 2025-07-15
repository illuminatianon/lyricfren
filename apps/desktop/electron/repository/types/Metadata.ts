/**
 * Global metadata interface for repositories
 */
export interface GlobalMetadata {
  title: string;
  slug: string;
  id: string;
  description: string;
  created: Date;
  author: string;
}

/**
 * Fork metadata interface for tracking repository forks
 */
export interface ForkMetadata {
  sourceRepositoryId: string;
  sourceRevision: string;
  forkedAt: string; // ISO date string
}
