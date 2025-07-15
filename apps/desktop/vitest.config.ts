import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['electron/repository/__tests__/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'dist-electron']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
