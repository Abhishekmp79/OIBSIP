/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm pizza-themed palette
        primary: {
          DEFAULT: '#dd5b2e',
          50: '#fdf3ee',
          100: '#fbe2d4',
          200: '#f6c4a8',
          300: '#ef9c74',
          400: '#e87a4f',
          500: '#dd5b2e',
          600: '#c9471d',
          700: '#a73618',
          800: '#872e18',
          900: '#6e2917',
        },
        sage: {
          DEFAULT: '#557267',
          light: '#7a958a',
          dark: '#3f564f',
        },
        cream: '#fdf8f3',
        charcoal: '#2b2522',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(221, 91, 46, 0.18)',
        soft: '0 2px 12px rgba(0,0,0,0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        pop: 'pop 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
