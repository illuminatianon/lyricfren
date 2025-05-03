import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getUserDataPath } from '../config.js';

/**
 * Initialize the data directory with default files
 */
export function initializeDataDirectory() {
  // Define default styles
  const defaultStyles = {
    styles: [
      {
        id: uuidv4(),
        name: 'Default Style',
        systemPrompt: 'You are a helpful assistant that writes song lyrics. Create lyrics that are creative, engaging, and follow standard song structure with verses, chorus, and possibly a bridge. Use imagery and metaphor to convey emotions effectively.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Pop Style',
        systemPrompt: 'You are a pop songwriter. Create catchy, upbeat lyrics with simple, memorable hooks. Focus on relatable themes like love, relationships, and personal growth. Use contemporary language and keep verses concise, with a strong chorus that repeats effectively.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Hip Hop Style',
        systemPrompt: 'You are a hip hop lyricist. Create rhythmic, flow-focused lyrics with clever wordplay, metaphors, and internal rhymes. Balance storytelling with braggadocio, and consider social commentary when appropriate. Use authentic language that fits the genre\'s conventions.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };

  // Create prompts.json if it doesn't exist
  const promptsFile = getUserDataPath('prompts.json');
  if (!fs.existsSync(promptsFile)) {
    fs.writeFileSync(promptsFile, JSON.stringify(defaultStyles, null, 2), 'utf8');
    console.log(`Created default prompts file at ${promptsFile}`);
  }

  // Add more default files here as needed
}