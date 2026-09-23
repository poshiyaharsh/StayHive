/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // StayHive Signature Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        dark: {
          bg: '#0B1120',
          card: '#111827',
          surface: '#1E293B',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        luxury: {
          gold: '#D4AF37',
          bronze: '#C5A059',
          amber: '#F59E0B',
          slate: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(37, 99, 235, 0.05)',
        'luxury-hover': '0 20px 35px -5px rgba(0, 0, 0, 0.1), 0 25px 30px -5px rgba(37, 99, 235, 0.1)',
      }
    },
  },
  plugins: [],
}
