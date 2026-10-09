/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: '#0f172a',
        panel: '#111827',
        card: '#1f2937',
        accent: '#22c55e',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#60a5fa'
      }
    }
  },
  plugins: []
}
