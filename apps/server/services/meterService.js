import cmuDictionaryService from './cmuDictService.js';

class MeterService {
  /**
   * Estimate syllables for words not in the dictionary
   * This is a very basic estimation and not very accurate
   * @param {string} word - The word to estimate syllables for
   * @returns {number} - The estimated number of syllables
   */
  estimateSyllables (word) {
    // Count vowel groups as syllables
    const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
    let count = 0;
    let prevIsVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[ i ]);
      if (isVowel && !prevIsVowel) {
        count++;
      }
      prevIsVowel = isVowel;
    }

    // Handle silent e at the end
    if (word.length > 2 && word.endsWith('E') && !vowels.includes(word[ word.length - 2 ])) {
      count = Math.max(1, count - 1);
    }

    return count || 1; // Ensure at least 1 syllable
  }

  /**
   * Count syllables in a word using the CMU dictionary
   * @param {string} word - The word to count syllables for
   * @returns {number} - The number of syllables
   */
  countSyllables (word) {
    // Try to get from dictionary
    const dictCount = cmuDictionaryService.getSyllableCount(word);

    if (dictCount !== null) {
      return dictCount;
    }

    // Fall back to estimation
    return this.estimateSyllables(word.toUpperCase());
  }

  /**
   * Count syllables in a line of text
   * @param {string} line - The line of text
   * @returns {number} - The total syllable count
   */
  countLineMetrics (line) {
    // Trim the line to handle trailing spaces
    const trimmedLine = line.trim();

    // Skip lines that are empty
    if (trimmedLine === '') {
      return 0;
    }

    // Skip section markers - check for complete section markers like [verse 1]
    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
      return 0;
    }

    // Remove any embedded section markers like [rising tension] within the line
    const withoutSectionMarkers = trimmedLine.replace(/\[.*?\]/g, '');

    // If after removing section markers the line is empty, return 0
    if (withoutSectionMarkers.trim() === '') {
      return 0;
    }

    // Remove all standalone punctuation (punctuation surrounded by spaces)
    const cleanedLine = withoutSectionMarkers.replace(/\s+[^\w\s'-]+\s+/g, ' ');

    // Remove punctuation attached to words (except apostrophes and hyphens)
    const cleanedWords = cleanedLine.replace(/[^\w\s'-]+/g, '');

    // Split the line into words and count syllables
    const words = cleanedWords.split(/\s+/).filter(word => word.length > 0);
    let totalSyllables = 0;

    for (const word of words) {
      totalSyllables += this.countSyllables(word);
    }

    return totalSyllables;
  }

  /**
   * Process text and return syllable counts for each line
   * @param {string} text - The text to analyze
   * @returns {Array} - Array of [line, syllableCount] pairs
   */
  processText (text) {
    // Split the text into lines
    const lines = text.split('\n');
    const result = [];

    // Process each line
    for (const line of lines) {
      const syllableCount = this.countLineMetrics(line);
      result.push([line, syllableCount]);
    }

    return result;
  }
}

// Create a singleton instance
const meterService = new MeterService();

export default meterService;
