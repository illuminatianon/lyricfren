import { Repository } from '../core/Repository';

/**
 * Song content structure
 */
export interface SongContent {
  lyrics: string;
  structure: string[]; // [Verse 1, Chorus, Verse 2, etc.]
  sections: Record<string, string>; // { "Verse 1": "lyrics...", "Chorus": "lyrics..." }
}

/**
 * Song-specific metadata
 */
export interface SongMetadata {
  title: string;
  genre: string;
  bpm?: number;
  key?: string;
  timeSignature?: string;
  tags: string[];
  collaborators: string[];
  inspiration?: string;
  notes?: string;
}

/**
 * Example implementation of a Song Repository
 * This demonstrates how to extend the abstract Repository class
 */
export class SongRepository extends Repository<SongContent, SongMetadata> {
  protected getContentFileName(): string {
    return 'lyrics.md';
  }

  protected getDefaultContent(): string {
    return `# New Song

[Verse 1]


[Chorus]


[Verse 2]


[Bridge]


[Outro]

`;
  }

  protected async parseContent(content: string): Promise<SongContent> {
    const structure = this.extractStructure(content);
    const sections = this.extractSections(content);

    return {
      lyrics: content,
      structure,
      sections
    };
  }

  protected serializeContent(content: SongContent): string {
    return content.lyrics;
  }

  protected createInstance(path: string): Repository<SongContent, SongMetadata> {
    return new SongRepository(path);
  }

  /**
   * Extract song structure from lyrics (section headers like [Verse 1], [Chorus])
   */
  private extractStructure(lyrics: string): string[] {
    const sectionRegex = /^\[([^\]]+)\]/gm;
    const matches: string[] = [];
    let match;

    while ((match = sectionRegex.exec(lyrics)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  /**
   * Extract individual sections with their content
   */
  private extractSections(lyrics: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionRegex = /^\[([^\]]+)\]\s*\n((?:(?!\n\[)[^\n]*\n?)*)/gm;
    let match;

    while ((match = sectionRegex.exec(lyrics)) !== null) {
      const sectionName = match[1];
      const sectionContent = match[2].trim();
      sections[sectionName] = sectionContent;
    }

    return sections;
  }

  /**
   * Helper method to get default metadata for new songs
   */
  getDefaultMetadata(): Partial<SongMetadata> {
    return {
      title: 'Untitled Song',
      genre: 'Pop',
      tags: [],
      collaborators: [],
      notes: ''
    };
  }

  /**
   * Helper method to validate song structure
   */
  validateStructure(content: SongContent): string[] {
    const errors: string[] = [];

    if (!content.lyrics.trim()) {
      errors.push('Song lyrics cannot be empty');
    }

    if (content.structure.length === 0) {
      errors.push('Song must have at least one section');
    }

    // Check for common song structure issues
    const hasVerse = content.structure.some(section => section.toLowerCase().includes('verse'));
    const hasChorus = content.structure.some(section => section.toLowerCase().includes('chorus'));

    if (!hasVerse) {
      errors.push('Song should typically have at least one verse');
    }

    if (!hasChorus && content.structure.length > 1) {
      errors.push('Song with multiple sections should typically have a chorus');
    }

    return errors;
  }

  /**
   * Helper method to get song statistics
   */
  getStatistics(content: SongContent): {
    totalLines: number;
    totalWords: number;
    sectionCount: number;
    averageWordsPerSection: number;
  } {
    const totalLines = content.lyrics.split('\n').filter(line => line.trim()).length;
    const totalWords = content.lyrics.split(/\s+/).filter(word => word.trim()).length;
    const sectionCount = content.structure.length;
    const averageWordsPerSection = sectionCount > 0 ? Math.round(totalWords / sectionCount) : 0;

    return {
      totalLines,
      totalWords,
      sectionCount,
      averageWordsPerSection
    };
  }
}
