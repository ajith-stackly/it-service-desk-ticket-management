/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#EEF1F5', 100: '#D9DEE8', 200: '#B3BDD1', 300: '#8A96B3',
          400: '#5C6786', 500: '#3A4360', 600: '#262E47', 700: '#1A2138',
          800: '#131A2C', 900: '#0B1220',
        },
        primary: {
          50: '#EBF6F6', 100: '#D2ECEB', 200: '#A6D9D7', 300: '#79C5C2',
          400: '#3FA6A3', 500: '#0E7C86', 600: '#0B6670', 700: '#095259',
          800: '#073F44', 900: '#052D31',
        },
        signal: {
          50: '#FEF6E7', 100: '#FDE9C4', 400: '#E8A430', 500: '#D97706', 600: '#B45F04',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 1px 1px rgba(11,18,32,0.03)',
      },
    },
  },
  plugins: [],
}