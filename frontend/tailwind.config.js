/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#182332',
        muted: '#7b8797',
        line: '#e7ebf1',
        brand: { 50: '#eff5ff', 100: '#dce9ff', 500: '#3478ed', 600: '#2869d8', 700: '#2056b5' }
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: { card: '0 8px 30px rgba(24, 35, 50, 0.05)' }
    }
  },
  plugins: []
};
