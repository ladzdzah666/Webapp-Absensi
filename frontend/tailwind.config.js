/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        islamic: {
          950: '#03140e',
          900: '#062319',
          850: '#0a3023',
          800: '#0f3e2e',
          700: '#14523d',
          600: '#1b6b50',
          500: '#238966',
        },
        gold: {
          300: '#f6e08d',
          400: '#eecd60',
          500: '#d4af37',
          600: '#b69225',
          700: '#8c6e18',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2.5s ease-in-out infinite',
        'radar-ping': 'radarPing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1.5deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(10px) rotate(-1.5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.35))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(16, 185, 129, 0.65))' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '0.7', filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 28px rgba(212, 175, 55, 0.75))' },
        },
        radarPing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.9' },
          '70%': { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-hover': '0 14px 40px 0 rgba(0, 0, 0, 0.6)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.45)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.5)',
      },
    },
  },
  plugins: [],
};
