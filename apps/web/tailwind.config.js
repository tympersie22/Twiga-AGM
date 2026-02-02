/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Luxury Color Palette (Omniyat-inspired)
        'deep-blue': '#10103D',
        'gold': '#A18A6B',
        'gold-light': '#C4A97D',
        'sand': '#DBC0A8',
        'cream': '#F3F1EF',
        'charcoal': '#1D1D1D',
        'warm-gray': '#E2DFDB',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'fade-in': 'fadeIn 1s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'bounce-slow': 'bounceSlow 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        '800': '800ms',
        '1200': '1200ms',
      },
    },
  },
  plugins: [],
};
