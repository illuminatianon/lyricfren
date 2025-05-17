import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the CMU dictionary
const cmuDictPath = path.join(__dirname, '../../..', 'data', 'cmudict-0.7.json');

// Load the CMU dictionary
let cmuDict = {};
try {
  const dictData = fs.readFileSync(cmuDictPath, 'utf8');
  cmuDict = JSON.parse(dictData);
  console.log(`Loaded CMU dictionary with ${Object.keys(cmuDict).length} words`);
} catch (error) {
  console.error('Error loading CMU dictionary:', error);
}

/**
 * Count syllables in a word using the CMU dictionary
 * @param {string} word - The word to count syllables for
 * @returns {number} - The number of syllables
 */
function countSyllables(word) {
  // Clean the word - remove punctuation except apostrophes and dashes
  const cleanWord = word.replace(/[^\w'-]/g, '').toUpperCase();
  
  // Check if the word is in the CMU dictionary
  if (cmuDict[cleanWord]) {
    return cmuDict[cleanWord];
  }
  
  // If not found, try to estimate syllables (very basic)
  // This is a fallback and not very accurate
  return estimateSyllables(cleanWord);
}

/**
 * Estimate syllables for words not in the dictionary
 * This is a very basic estimation and not very accurate
 * @param {string} word - The word to estimate syllables for
 * @returns {number} - The estimated number of syllables
 */
function estimateSyllables(word) {
  // Count vowel groups as syllables
  const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
  let count = 0;
  let prevIsVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !prevIsVowel) {
      count++;
    }
    prevIsVowel = isVowel;
  }
  
  // Handle silent e at the end
  if (word.length > 2 && word.endsWith('E') && !vowels.includes(word[word.length - 2])) {
    count = Math.max(1, count - 1);
  }
  
  return count || 1; // Ensure at least 1 syllable
}

/**
 * Count syllables in a line of text
 * @param {string} line - The line of text
 * @returns {number} - The total syllable count
 */
function countLineMetrics(line) {
  // Skip lines that are section markers or empty
  if (line.trim() === '' || (line.startsWith('[') && line.endsWith(']'))) {
    return 0;
  }
  
  // Split the line into words and count syllables
  const words = line.split(/\s+/).filter(word => word.length > 0);
  let totalSyllables = 0;
  
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }
  
  return totalSyllables;
}

// POST endpoint to count syllables in text
router.post('/count', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Split the text into lines
    const lines = text.split('\n');
    const result = [];
    
    // Process each line
    for (const line of lines) {
      const syllableCount = countLineMetrics(line);
      result.push([line, syllableCount]);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error counting syllables:', error);
    res.status(500).json({ error: 'Failed to count syllables' });
  }
});

export default router;
