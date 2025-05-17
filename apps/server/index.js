import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import stylesRoutes from './routes/styles.js';
import configRoutes from './routes/config.js';
import meterRoutes from './routes/meter.js';
import { loadConfig } from './config.js';
import db from './services/db.js';
import http from 'http';
import { EventEmitter } from 'events';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000; // Changed to 3001 to avoid conflicts
const isDevelopment = process.env.NODE_ENV !== 'production';

// Increase max listeners to avoid warnings
EventEmitter.defaultMaxListeners = 30;

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
app.use('/api/meter', meterRoutes);

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

  // Create a single proxy middleware instance with better configuration
  const viteProxy = createProxyMiddleware({
    target: 'http://localhost:5173', // Default Vite dev server port
    changeOrigin: true,
    ws: true, // Support WebSocket
    logLevel: 'silent', // Reduce log noise
    pathRewrite: { '^/(?!api)': '/' }, // Don't rewrite /api paths
    onError: (err, req, res) => {
      console.log('Proxy error:', err.message);
      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });
      res.end('Proxy error: ' + err.message);
    }
  });

  // Only proxy non-API requests to the Vite dev server
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    return viteProxy(req, res, next);
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

// Create HTTP server
const server = http.createServer(app);

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the application using this port or use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Frontend ${isDevelopment ? 'proxied to Vite dev server' : 'served from static files'}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
