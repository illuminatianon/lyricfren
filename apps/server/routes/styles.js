import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');
const promptsFile = join(dataDir, 'prompts.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize prompts file if it doesn't exist
if (!fs.existsSync(promptsFile)) {
  fs.writeFileSync(promptsFile, JSON.stringify({
    styles: [
      {
        id: uuidv4(),
        name: 'Default Style',
        systemPrompt: 'You are a helpful assistant that writes song lyrics.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }), 'utf8');
}

const router = express.Router();

// Get all styles
router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
    res.json(data.styles);
  } catch (error) {
    console.error('Error reading styles:', error);
    res.status(500).json({ error: 'Failed to read styles' });
  }
});

// Get style by ID
router.get('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
    const style = data.styles.find(s => s.id === req.params.id);
    
    if (!style) {
      return res.status(404).json({ error: 'Style not found' });
    }
    
    res.json(style);
  } catch (error) {
    console.error('Error reading style:', error);
    res.status(500).json({ error: 'Failed to read style' });
  }
});

// Create new style
router.post('/', (req, res) => {
  try {
    const { name, systemPrompt } = req.body;
    
    if (!name || !systemPrompt) {
      return res.status(400).json({ error: 'Name and systemPrompt are required' });
    }
    
    const data = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
    
    const newStyle = {
      id: uuidv4(),
      name,
      systemPrompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.styles.push(newStyle);
    fs.writeFileSync(promptsFile, JSON.stringify(data, null, 2), 'utf8');
    
    res.status(201).json(newStyle);
  } catch (error) {
    console.error('Error creating style:', error);
    res.status(500).json({ error: 'Failed to create style' });
  }
});

// Update style
router.put('/:id', (req, res) => {
  try {
    const { name, systemPrompt } = req.body;
    
    if (!name || !systemPrompt) {
      return res.status(400).json({ error: 'Name and systemPrompt are required' });
    }
    
    const data = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
    const styleIndex = data.styles.findIndex(s => s.id === req.params.id);
    
    if (styleIndex === -1) {
      return res.status(404).json({ error: 'Style not found' });
    }
    
    data.styles[styleIndex] = {
      ...data.styles[styleIndex],
      name,
      systemPrompt,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(promptsFile, JSON.stringify(data, null, 2), 'utf8');
    
    res.json(data.styles[styleIndex]);
  } catch (error) {
    console.error('Error updating style:', error);
    res.status(500).json({ error: 'Failed to update style' });
  }
});

// Delete style
router.delete('/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
    const styleIndex = data.styles.findIndex(s => s.id === req.params.id);
    
    if (styleIndex === -1) {
      return res.status(404).json({ error: 'Style not found' });
    }
    
    data.styles.splice(styleIndex, 1);
    fs.writeFileSync(promptsFile, JSON.stringify(data, null, 2), 'utf8');
    
    res.json({ success: true, message: 'Style deleted successfully' });
  } catch (error) {
    console.error('Error deleting style:', error);
    res.status(500).json({ error: 'Failed to delete style' });
  }
});

export default router;
