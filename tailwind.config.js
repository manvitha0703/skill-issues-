/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./options.html",
    "./onboarding.html",
    "./demo.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#233256',
          600: '#2E4170'
        },
        aqua: {
          50: '#F0FDF4',
          100: '#E0F2FE',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1'
        },
        teal: {
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E'
        },
        lavender: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        opendyslexic: ['OpenDyslexic', 'Comic Sans MS', 'sans-serif'],
        atkinson: ['Atkinson Hyperlegible', 'Verdana', 'sans-serif']
      }
    },
  },
  plugins: [],
}
