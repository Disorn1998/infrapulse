/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#0f172a',
        'surface-card': '#131d35',
        'surface-border': '#1e293b',
        'ops-cyan': '#06b6d4',
        'ops-emerald': '#10b981',
        'ops-amber': '#f59e0b',
        'ops-rose': '#f43f5e',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.3), 0 0 6px -2px rgba(6, 182, 212, 0.2)',
        'glow-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.3), 0 0 6px -2px rgba(16, 185, 129, 0.2)',
        'glow-rose': '0 0 15px -3px rgba(244, 63, 94, 0.3), 0 0 6px -2px rgba(244, 63, 94, 0.2)',
        'glow-amber': '0 0 15px -3px rgba(245, 158, 11, 0.3), 0 0 6px -2px rgba(245, 158, 11, 0.2)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
