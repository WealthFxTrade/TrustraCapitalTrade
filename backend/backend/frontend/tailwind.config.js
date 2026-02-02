/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // covers MDX if you use it
  ],

  darkMode: 'class', // 'class' is usually preferred over 'media'

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',     // bg-primary / text-primary
          dark: '#4f46e5',
          light: '#818cf8',
          50: '#eef2ff',
          100: '#e0e7ff',
          // You can add more shades later (tools like uicolors.app or tailwindcss.com/docs/customizing-colors)
        },

        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',

        // Neutral palette – very useful for dark themes
        background: '#0f172a',
        surface: '#1e293b',
        'surface-hover': '#334155',
        'surface-active': '#475569',

        text: '#f1f5f9',
        'text-muted': '#94a3b8',
        'text-subtle': '#64748b',
      },

      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },

      spacing: {
        '18': '4.5rem',
        '128': '32rem',
        '144': '36rem',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Optional: custom animations (very useful)
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
      },

      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'inner-glow': 'inset 0 2px 10px rgba(99, 102, 241, 0.15)',
      },
    },
  },

  plugins: [
    // Uncomment these when you need them
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}
