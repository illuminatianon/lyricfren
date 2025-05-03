/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{vue,js,ts,jsx,tsx}',
  ],
  // Use media strategy for dark mode (always on in our case)
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Defer to PrimeVue Nora theme colors
      }
    },
  },
  plugins: [],
}
