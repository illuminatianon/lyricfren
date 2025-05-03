/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{vue,js,ts,jsx,tsx}',
  ],
  // We're not using Tailwind's dark mode feature since we're using explicit dark colors
  theme: {
    extend: {
      colors: {
        // Keep the default Tailwind colors since they're used throughout the app
      }
    },
  },
  plugins: [],
}
