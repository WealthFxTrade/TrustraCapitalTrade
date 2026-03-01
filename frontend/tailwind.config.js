/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // High-end Terminal Palette
        yellow: {
          500: '#EAB308', // The core accent color
          400: '#FACC15',
          200: '#FEF08A',
        },
        // Match the deep space background from the code
        slate: {
          950: '#020617', 
          900: '#0f172a',
        },
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
      },
      fontFamily: {
        // 'Inter' is great, but we add 'JetBrains Mono' for that code-terminal feel
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // Adds the glowing effect seen on the Node cards
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'yellow-glow': '0 0 20px rgba(234, 179, 8, 0.15)',
      },
      animation: {
        // Adds the smooth entry animation used in the pages
        'in': 'fade-in 0.7s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // Adding the animation plugin for 'animate-in' classes
    require("tailwindcss-animate"),
  ],
};

