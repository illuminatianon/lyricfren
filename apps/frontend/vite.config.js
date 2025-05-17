import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import autoprefixer from 'autoprefixer'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    Components({ resolvers: [ PrimeVueResolver() ] })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    },
    // ✏️ force a single copy of CM6 modules
    dedupe: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/theme-one-dark',
      '@codemirror/commands'
    ]
  },
  css: {
    postcss: { plugins: [autoprefixer] }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: { port: 5173 }
})
