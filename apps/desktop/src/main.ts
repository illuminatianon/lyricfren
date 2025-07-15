import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import router from './router/index.js';

// Import Vuetify styles
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

// Import our custom styles
import './style.css';
import App from './App.vue';
// Import editor components for dynamic loading
import LyricEditorInstance from './components/editors/LyricEditorInstance.vue';
import PromptEditorInstance from './components/editors/PromptEditorInstance.vue';
import StyleEditorInstance from './components/editors/StyleEditorInstance.vue';
import SettingsEditorInstance from './components/editors/SettingsEditorInstance.vue';
import InlineEditor from './components/common/InlineEditor.vue';

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#38bdf8',
          secondary: '#64748b',
          accent: '#7dd3fc',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#06b6d4',
          success: '#10b981',
          surface: '#1e293b',
          background: '#0f172a',
          'on-surface': '#f8fafc',
          'on-background': '#f8fafc',
          'surface-variant': '#334155',
          'on-surface-variant': '#cbd5e1',
        },
      },
      light: {
        colors: {
          primary: '#0ea5e9',
          secondary: '#64748b',
          accent: '#0284c7',
          error: '#dc2626',
          warning: '#d97706',
          info: '#0891b2',
          success: '#059669',
          surface: '#ffffff',
          background: '#f8fafc',
          'on-surface': '#0f172a',
          'on-background': '#0f172a',
          'surface-variant': '#f1f5f9',
          'on-surface-variant': '#475569',
        },
      },
    },
  },
});

// Create app instance
const app = createApp(App);

// Register editor components globally
app.component('LyricEditorInstance', LyricEditorInstance);
app.component('PromptEditorInstance', PromptEditorInstance);
app.component('StyleEditorInstance', StyleEditorInstance);
app.component('SettingsEditorInstance', SettingsEditorInstance);
app.component('InlineEditor', InlineEditor);

// Use plugins
app.use(createPinia());
app.use(router);
app.use(vuetify);

// Mount app
app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer?.on('main-process-message', (_event, message) => {
    console.log(message)
  })
});
