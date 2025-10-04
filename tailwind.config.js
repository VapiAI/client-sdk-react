/** @type {import('tailwindcss').Config} */
export default {
  important: '.vapi-widget-wrapper',
  
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './example/src/**/*.{js,ts,jsx,tsx}',
    './example/index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
