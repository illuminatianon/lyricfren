import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
    // ✏️ force a single copy of CM6 modules
    dedupe: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/theme-one-dark',
      '@codemirror/commands',
    ],
  },
  css: {
    postcss: { plugins: [autoprefixer] },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: { port: 5173 },
});
