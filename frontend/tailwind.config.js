/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can add custom Instagram colors here later if you want
      colors: {
        instaBlue: '#0095f6',
      }
    },
  },
  plugins: [],
}