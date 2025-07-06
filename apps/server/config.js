import fs, { mkdirSync } from 'fs';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// User data directory in home folder
const userDataDir = join(homedir(), '.lyricfren');
const userConfigPath = join(userDataDir, 'config.yaml');
const userDataPath = join(userDataDir, 'data');

// Ensure user data directories exist
if (!fs.existsSync(userDataDir)) {
  mkdirSync(userDataDir, { recursive: true });
}
if (!fs.existsSync(userDataPath)) {
  mkdirSync(userDataPath, { recursive: true });
}

/**
 * Get path to a data file in the user data directory
 * @param {string} filename - Name of the file
 * @returns {string} Full path to the file
 */
export function getUserDataPath (filename) {
  return join(userDataPath, filename);
}

/**
 * Load configuration from config.yaml or environment variables
 * @returns {Object} Configuration object
 */
export function loadConfig () {
  let config = {
    openaiApiKey: process.env.LYRICFREN_OPENAI_KEY || '',
    defaultModelParams: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 512,
      topP: 1.0,
    },
    vibeBriefThreshold: 100,
    gitSyncEnabled: false,
    gitRepoPath: '',
    dataDir: userDataPath,
  };

  // Try to load from project config
  try {
    const projectConfigPath = join(rootDir, 'config.yaml');
    if (fs.existsSync(projectConfigPath)) {
      const fileConfig = yaml.load(fs.readFileSync(projectConfigPath, 'utf8'));
      config = { ...config, ...fileConfig };
    }
  } catch (error) {
    console.warn('Failed to load project config.yaml:', error.message);
  }

  // Try to load from user config (takes precedence)
  try {
    if (fs.existsSync(userConfigPath)) {
      const fileConfig = yaml.load(fs.readFileSync(userConfigPath, 'utf8'));
      config = { ...config, ...fileConfig };
    } else {
      // Create default user config if it doesn't exist
      fs.writeFileSync(userConfigPath, yaml.dump(config), 'utf8');
      console.log(`Created default config at ${userConfigPath}`);
    }
  } catch (error) {
    console.warn('Failed to load user config.yaml:', error.message);
  }

  // Environment variables take precedence over config files
  if (process.env.LYRICFREN_OPENAI_KEY) {
    config.openaiApiKey = process.env.LYRICFREN_OPENAI_KEY;
  }

  return config;
}

/**
 * Save configuration to config.yaml
 * @param {Object} config Configuration object
 * @returns {boolean} Success status
 */
export function saveConfig (config) {
  try {
    // Remove sensitive data before saving
    const configToSave = { ...config };

    // Save to user config
    fs.writeFileSync(userConfigPath, yaml.dump(configToSave), 'utf8');
    console.log(`Configuration saved to ${userConfigPath}`);
    return true;
  } catch (error) {
    console.error('Failed to save config.yaml:', error.message);
    return false;
  }
}

/**
 * Get safe configuration (without sensitive data)
 * @param {Object} config Full configuration object
 * @returns {Object} Safe configuration object
 */
export function getSafeConfig (config) {
  const safeConfig = { ...config };

  // Mask sensitive data
  if (safeConfig.openaiApiKey) {
    safeConfig.openaiApiKey = safeConfig.openaiApiKey.substring(0, 3) + '...' +
      safeConfig.openaiApiKey.substring(safeConfig.openaiApiKey.length - 3);
  }

  return safeConfig;
}
