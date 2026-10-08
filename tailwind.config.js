/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#22C55E',
          'green-dark': '#16A34A',
          ink: '#0F172A',
          'ink-light': '#1E293B',
          gray: '#6B7280',
          surface: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
}
