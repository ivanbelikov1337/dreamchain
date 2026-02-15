/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00d9ff',
        secondary: '#b537f2',
        dark: '#1a1410',
        'dark-secondary': '#2d2420',
        'dark-tertiary': '#1f1a15',
        'neon-blue': '#00d9ff',
        'neon-purple': '#b537f2',
        'neon-pink': '#ff006e',
        'neon-green': '#00ff41',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
