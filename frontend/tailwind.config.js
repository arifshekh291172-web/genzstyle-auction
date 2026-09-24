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
        luxury: {
          black: '#08080A',
          charcoal: '#0F1015',
          surface: '#15161E',
          card: '#1B1C26',
          border: '#2A2C3C',
          gold: {
            DEFAULT: '#D4AF37',
            light: '#F5E6B3',
            hover: '#E5C048',
            dark: '#AA820A',
            glow: 'rgba(212, 175, 55, 0.25)',
          },
          white: '#F8F9FA',
          muted: '#9CA3AF',
          mutedLight: '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        display: ['Syne', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'luxury-gold': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'luxury-glow': '0 0 40px -10px rgba(212, 175, 55, 0.15)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212, 175, 55, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
