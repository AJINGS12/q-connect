/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matches your uploaded color palette exactly
        primary: '#008080',    // Teal
        secondary: '#2D5A27',  // Deep Green
        tertiary: '#C5A059',   // Gold/Mustard
        neutralMain: '#5F6368', // Grey text
        bgLight: '#F8F9FA',
      },
      fontFamily: {
        // Use these in your classNames (e.g., font-display)
        display: ['Noto Serif', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}