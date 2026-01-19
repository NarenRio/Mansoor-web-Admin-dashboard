/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#6B46C1',
          'purple-dark': '#553C9A',
          'purple-light': '#8B5CF6',
        },
      },
    },
  },
  plugins: [],
}

