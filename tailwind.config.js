/** @type {import('tailwindcss').Config} */
export default {
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
  prefix: 'vapi-',
};
