import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getUserDataPath } from '../config.js';

/**
 * Simple file-based database service
 */
class DbService {
  constructor () {
    // Initialize collections
    this.collections = {
      styles: {
        filename: 'prompts.json',
        defaultData: {
          styles: [
            {
              id: uuidv4(),
              name: 'Default Style',
              systemPrompt: 'You are a helpful assistant that writes song lyrics. Create lyrics that are creative, engaging, and follow standard song structure with verses, chorus, and possibly a bridge. Use imagery and metaphor to convey emotions effectively.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: uuidv4(),
              name: 'Pop Style',
              systemPrompt: 'You are a pop songwriter. Create catchy, upbeat lyrics with simple, memorable hooks. Focus on relatable themes like love, relationships, and personal growth. Use contemporary language and keep verses concise, with a strong chorus that repeats effectively.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: uuidv4(),
              name: 'Hip Hop Style',
              systemPrompt: 'You are a hip hop lyricist. Create rhythmic, flow-focused lyrics with clever wordplay, metaphors, and internal rhymes. Balance storytelling with braggadocio, and consider social commentary when appropriate. Use authentic language that fits the genre\'s conventions.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
      },
      // Add more collections as needed
    };
  }

  /**
   * Initialize the database
   */
  initialize () {
    // Ensure each collection file exists
    for (const [name, collection] of Object.entries(this.collections)) {
      const filePath = getUserDataPath(collection.filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(collection.defaultData, null, 2), 'utf8');
        console.log(`Created default ${name} file at ${filePath}`);
      }
    }
  }

  /**
   * Get all items from a collection
   * @param {string} collectionName - Name of the collection
   * @returns {Array} Array of items
   */
  getAll (collectionName) {
    try {
      const collection = this.collections[ collectionName ];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      const filePath = getUserDataPath(collection.filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data[ collectionName ];
    } catch (error) {
      console.error(`Error reading ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get an item by ID
   * @param {string} collectionName - Name of the collection
   * @param {string} id - ID of the item
   * @returns {Object|null} The item or null if not found
   */
  getById (collectionName, id) {
    try {
      const collection = this.collections[ collectionName ];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      const filePath = getUserDataPath(collection.filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data[ collectionName ].find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error reading ${collectionName} item:`, error);
      throw error;
    }
  }

  /**
   * Create a new item
   * @param {string} collectionName - Name of the collection
   * @param {Object} item - Item to create
   * @returns {Object} Created item
   */
  create (collectionName, item) {
    try {
      const collection = this.collections[ collectionName ];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      const filePath = getUserDataPath(collection.filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const newItem = {
        id: uuidv4(),
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      data[ collectionName ].push(newItem);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

      return newItem;
    } catch (error) {
      console.error(`Error creating ${collectionName} item:`, error);
      throw error;
    }
  }

  /**
   * Update an item
   * @param {string} collectionName - Name of the collection
   * @param {string} id - ID of the item
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated item or null if not found
   */
  update (collectionName, id, updates) {
    try {
      const collection = this.collections[ collectionName ];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      const filePath = getUserDataPath(collection.filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const index = data[ collectionName ].findIndex(item => item.id === id);
      if (index === -1) {
        return null;
      }

      data[ collectionName ][ index ] = {
        ...data[ collectionName ][ index ],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

      return data[ collectionName ][ index ];
    } catch (error) {
      console.error(`Error updating ${collectionName} item:`, error);
      throw error;
    }
  }

  /**
   * Delete an item
   * @param {string} collectionName - Name of the collection
   * @param {string} id - ID of the item
   * @returns {boolean} True if deleted, false if not found
   */
  delete (collectionName, id) {
    try {
      const collection = this.collections[ collectionName ];
      if (!collection) {
        throw new Error(`Collection ${collectionName} not found`);
      }

      const filePath = getUserDataPath(collection.filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const index = data[ collectionName ].findIndex(item => item.id === id);
      if (index === -1) {
        return false;
      }

      data[ collectionName ].splice(index, 1);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionName} item:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const db = new DbService();

export default db;
