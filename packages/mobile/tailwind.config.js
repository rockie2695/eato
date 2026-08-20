/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ea580c',
          light: '#fb923c',
          dark: '#c2410c',
        },
        secondary: {
          DEFAULT: '#1e293b',
          light: '#475569',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
