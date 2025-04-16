/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#1e1e1e',
          toolbar: '#252526',
          sidebar: '#252526',
          accent: '#0078d4',
        },
        text: {
          primary: '#e0e0e0',
          secondary: '#9ca3af',
          }
      },
      fontFamily: {
        mono: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
