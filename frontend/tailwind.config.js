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
        // Deep Space Palette: Matches the '020408' hex in your code
        dark: {
          950: '#020408', // Core Background
          900: '#0a0c10', // Card Background
          800: '#11141b', // Input Background
        },
        // Cyber Yellow: The Trustra Signature
        yellow: {
          500: '#EAB308', 
          400: '#FACC15',
          600: '#CA8A04',
        },
      },
      fontFamily: {
        // Using Inter for prose and JetBrains for the "Access Ciphers"
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
      },
      boxShadow: {
        // The "Institutional" depth effect
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.6)',
        'yellow-glow': '0 0 40px rgba(234, 179, 8, 0.1)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fade-in 0.7s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite', // For the Yield/Refresh icons
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // Ensure you have run: npm install tailwindcss-animate
    require("tailwindcss-animate"),
  ],
};
