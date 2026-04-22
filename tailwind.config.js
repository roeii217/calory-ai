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
        'app-black': '#000000',
        'app-surface': '#0A0A0A',
        'app-card': '#111111',
        'app-border': '#1A1A1A',
        'app-gray': '#2A2A2A',
        'app-muted': '#6B6B6B',
        'app-text': '#F5F5F5',
        'app-accent': '#FFFFFF',
        'app-green': '#4ADE80',
        'app-blue': '#60A5FA',
        'app-orange': '#FB923C',
        'app-red': '#F87171',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
