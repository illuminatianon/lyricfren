/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // or 'media' if you want to respect system preferences
  // We're using explicit dark colors in our components
  theme: {
    extend: {
      colors: {
        // Keep the default Tailwind colors since they're used throughout the app
      }
    },
  },
  plugins: [],
}
