import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import stylesRoutes from './routes/styles.js';
import configRoutes from './routes/config.js';
import { loadConfig } from './config.js';
import db from './services/db.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Load configuration
const config = loadConfig();
console.log(`Using data directory: ${config.dataDir}`);

// Initialize database
db.initialize();

// API Routes - all under /api prefix
app.use('/api/styles', stylesRoutes);
app.use('/api/config', configRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LyricFren API is running',
    dataDir: config.dataDir
  });
});

// Handle frontend requests
if (isDevelopment) {
  // In development, proxy requests to Vite dev server
  // BUT exclude /api routes from being proxied
  console.log('Running in development mode - proxying to Vite dev server');

  // Only proxy non-API requests to the Vite dev server
  app.use('/', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }

    return createProxyMiddleware({
      target: 'http://localhost:5173', // Default Vite dev server port
      changeOrigin: true,
      ws: true, // Support WebSocket
    })(req, res, next);
  });
} else {
  // In production, serve static files from frontend build
  console.log('Running in production mode - serving static files');
  const frontendPath = join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));

  // Catch-all route to serve index.html for SPA
  // BUT exclude /api routes
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(join(frontendPath, 'index.html'));
  });
}

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend ${isDevelopment ? 'proxied to Vite dev server' : 'served from static files'}`);
});

export default app;
