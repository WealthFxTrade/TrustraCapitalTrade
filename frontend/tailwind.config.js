/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // added .mdx (common in some projects)
  ],
  darkMode: 'class', // or 'media' — choose one (class is more flexible)
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',     // indigo-500 — use as bg-primary
          dark: '#4f46e5',        // indigo-600 — use as bg-primary-dark or hover
          light: '#818cf8',       // indigo-400 — optional lighter variant
        },
        // You can add more semantic colors here
        success: '#10b981',   // green-500
        danger: '#ef4444',    // red-500
        warning: '#f59e0b',   // amber-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // nice modern stack
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [
    // Optional — add if you need forms or typography utilities
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}
