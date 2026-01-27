/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',      // indigo-500
        primaryDark: '#4f46e5',  // indigo-600
      },
    },
  },
  plugins: [],
}
