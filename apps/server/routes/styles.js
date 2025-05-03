import express from 'express';
import db from '../services/db.js';

const router = express.Router();

// Get all styles
router.get('/', (req, res) => {
  try {
    const styles = db.getAll('styles');
    res.json(styles);
  } catch (error) {
    console.error('Error reading styles:', error);
    res.status(500).json({ error: 'Failed to read styles' });
  }
});

// Get style by ID
router.get('/:id', (req, res) => {
  try {
    const style = db.getById('styles', req.params.id);

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

    const newStyle = db.create('styles', { name, systemPrompt });
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

    const updatedStyle = db.update('styles', req.params.id, { name, systemPrompt });

    if (!updatedStyle) {
      return res.status(404).json({ error: 'Style not found' });
    }

    res.json(updatedStyle);
  } catch (error) {
    console.error('Error updating style:', error);
    res.status(500).json({ error: 'Failed to update style' });
  }
});

// Delete style
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.delete('styles', req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Style not found' });
    }

    res.json({ success: true, message: 'Style deleted successfully' });
  } catch (error) {
    console.error('Error deleting style:', error);
    res.status(500).json({ error: 'Failed to delete style' });
  }
});

export default router;
