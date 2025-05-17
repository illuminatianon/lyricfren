import express from 'express';
import meterService from '../services/meterService.js';

const router = express.Router();

// POST endpoint to count syllables in text
router.post('/count', (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = meterService.processText(text);
    res.json(result);
  } catch (error) {
    console.error('Error counting syllables:', error);
    res.status(500).json({ error: 'Failed to count syllables' });
  }
});

// POST endpoint to count syllables in a single line
router.post('/count-line', (req, res) => {
  try {
    const { line } = req.body;

    if (line === undefined) {
      return res.status(400).json({ error: 'Line parameter is required' });
    }

    const syllableCount = meterService.countLineMetrics(line);
    res.json({ line, syllableCount });
  } catch (error) {
    console.error('Error counting syllables for line:', error);
    res.status(500).json({ error: 'Failed to count syllables for line' });
  }
});

export default router;
