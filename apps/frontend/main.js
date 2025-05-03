import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { definePreset } from '@primeuix/themes'
import Nora from '@primeuix/themes/nora'
import PrimeVue from 'primevue/config'

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
import Dropdown from 'primevue/dropdown'
import Card from 'primevue/card'


// Create app instance
const app = createApp(App)

// Create a custom preset based on Nora
const LyricFrenPreset = definePreset(Nora, {
  // Customize the primary color palette if needed
  semantic: {
    // You can customize colors here if needed
  }
})

// Use plugins
app.use(createPinia())
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
app.component('Dropdown', Dropdown)
app.component('Card', Card)

// Mount app
app.mount('#app')
