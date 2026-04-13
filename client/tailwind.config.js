/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          950: '#0a0a0f',
          900: '#0f0f1a',
          800: '#161625',
          700: '#1e1e32',
          600: '#2a2a45',
          500: '#3a3a5c',
        },
        accent: {
          DEFAULT: '#7c6af7',
          hover: '#6a57f0',
          muted: '#3d3580',
        },
        surface: {
          DEFAULT: '#14141f',
          raised: '#1a1a2e',
          border: '#2a2a45',
          hover: '#1f1f35',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.35s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}