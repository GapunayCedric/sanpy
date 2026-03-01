/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#1e3a5f',
          light: '#2c5282',
          pale: '#ebf8ff',
        },
      },
    },
  },
  plugins: [],
};
