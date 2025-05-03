import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Nora from '@primeuix/themes/nora'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'

// Create app instance
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: Nora
  }
})

// Register PrimeVue components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Textarea', Textarea)
app.component('Dropdown', Dropdown)

// Mount app
app.mount('#app')
