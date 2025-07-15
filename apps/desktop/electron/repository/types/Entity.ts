/**
 * Generic Entity interface that represents the actual content object managed by a Repository
 */
export interface Entity<T = any, M = any> {
  revisionId: string;
  repositoryId: string;
  timestamp: Date;
  content: T;
  metadata: M;

  version: {
    signature: string;
    message: string;
    tags: string[];
  };

  isDirty: boolean;
  changes: {
    content: boolean;
    metadata: boolean;
    fields: string[];
  };
}
