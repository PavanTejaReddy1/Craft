/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',   // toggle via <html class="dark">
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Single-palette: pure dark/white/gray system
        // No accent color — use white/gray contrast for hierarchy
        surface: {
          DEFAULT: '#0a0a0a', // base dark bg
          raised:  '#111111', // cards on dark
          border:  '#1f1f1f', // borders on dark
          muted:   '#2a2a2a', // subtle fills on dark
        },
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        'modal':   '0 24px 64px rgba(0,0,0,0.18)',
        'soft':    '0 0 0 1px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in':   'fadeIn 0.18s ease-out',
        'slide-up':  'slideUp 0.28s ease-out',
        'slide-down':'slideDown 0.22s ease-out',
        'pulse-slow':'pulse 3s infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                                to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
