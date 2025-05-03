import express from 'express';
import { loadConfig, saveConfig, getSafeConfig } from '../config.js';

const router = express.Router();

// Get configuration (excluding sensitive data)
router.get('/', (req, res) => {
  const config = loadConfig();
  res.json(getSafeConfig(config));
});

// Update configuration
router.put('/', (req, res) => {
  const newConfig = req.body;
  
  // Validate configuration
  if (!newConfig) {
    return res.status(400).json({ error: 'Invalid configuration' });
  }
  
  // Save configuration
  const success = saveConfig(newConfig);
  if (success) {
    res.json({ success: true, message: 'Configuration updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

export default router;
