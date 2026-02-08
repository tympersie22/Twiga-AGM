/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#c9a96e',
          light: '#d4b87a',
          dark: '#b8944f',
          muted: 'rgba(201, 169, 110, 0.15)',
        },
      },
    },
  },
  plugins: [],
};
