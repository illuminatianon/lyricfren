import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

class CMUDictionaryService {
  constructor () {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Path to the CMU dictionary
    this.cmuDictPath = path.join(__dirname, '..', 'vendor', 'cmudict', 'cmudict-0.7b.json');

    // Load the dictionary
    this.loadDictionary();
  }


  loadDictionary () {
    try {
      const dictData = fs.readFileSync(this.cmuDictPath, 'utf8');
      this.cmuDict = JSON.parse(dictData);
      console.log(`Loaded CMU dictionary with ${Object.keys(this.cmuDict).length} words`);
    } catch (error) {
      console.error('Error loading CMU dictionary:', error);
      this.cmuDict = {};
    }
  }

  getSyllableCount (word) {
    // Clean the word - remove punctuation except apostrophes and dashes
    const cleanWord = word.replace(/[^\w'-]/g, '').toUpperCase();

    // Check if the word is in the CMU dictionary
    if (this.cmuDict[ cleanWord ]) {
      return this.cmuDict[ cleanWord ];
    }

    // Return null if not found
    return null;
  }
}

// Create a singleton instance
const cmuDictionaryService = new CMUDictionaryService();

export default cmuDictionaryService;
