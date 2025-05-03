import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { definePreset } from '@primeuix/themes'
import Nora from '@primeuix/themes/nora'
import PrimeVue from 'primevue/config'
import router from './router/index.js'

// Import PrimeIcons
import 'primeicons/primeicons.css'

// Import PrimeFlex for layout utilities
import 'primeflex/primeflex.css'

// Import our custom styles
import './style.css'
import App from './App.vue'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Card from 'primevue/card'


// Create app instance
const app = createApp(App)

// Create a custom preset based on Nora
const LyricFrenPreset = definePreset(Nora, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{zinc.950}',
          inverseColor: '#ffffff',
          hoverColor: '{zinc.900}',
          activeColor: '{zinc.800}'
        },
        highlight: {
          background: '{zinc.950}',
          focusBackground: '{zinc.700}',
          color: '#ffffff',
          focusColor: '#ffffff'
        }
      },
      dark: {
        primary: {
          color: '{zinc.50}',
          inverseColor: '{zinc.950}',
          hoverColor: '{zinc.100}',
          activeColor: '{zinc.200}'
        },
        highlight: {
          background: 'rgba(250, 250, 250, .16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)'
        }
      }
    }
  }
})

// Use plugins
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: LyricFrenPreset,
    options: {
      darkModeSelector: '.app-dark', // For future toggle support
    }
  },
  ripple: true,
  unstyled: false
})

// Add app-dark class to html element to enable dark mode by default
document.documentElement.classList.add('app-dark')

// Register PrimeVue components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Textarea', Textarea)
app.component('Select', Select)
app.component('Card', Card)

// Mount app
app.mount('#app')
