/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        game: ['Orbitron', 'sans-serif'],
      },
      colors: {
        'game-primary': '#FF3E88',
        'game-secondary': '#2D1B69',
        'game-dark': '#0f172a',
        'game-light': '#cbd5e1',
        'game-accent': '#22d3ee',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'cyber-pattern': "url('/src/assets/cyber-bg.png')",
      },
    },
  },
  plugins: [],
} 