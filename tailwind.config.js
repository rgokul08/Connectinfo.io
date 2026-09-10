/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Color Hunt palette: #FF7F50 #FFD166 #06D6A0 #118AB2
        coral: { light: '#FFA27A', DEFAULT: '#FF7F50', dark: '#E5642F' },
        gold: { light: '#FFDE8A', DEFAULT: '#FFD166', dark: '#D9AB3B' },
        teal: { light: '#4CE3BB', DEFAULT: '#06D6A0', dark: '#04926F' },
        ocean: {
          50: '#EAF6FA',
          100: '#D2EBF4',
          200: '#A5D6E8',
          light: '#3FA8CC',
          DEFAULT: '#118AB2',
          dark: '#0C6E8E',
          900: '#0A4A61',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(2, 6, 23, 0.07)',
        lift: '0 18px 44px -14px rgba(2, 6, 23, 0.22)',
        glow: '0 0 0 4px rgba(17, 138, 178, 0.12)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--tw-rotate, 0))' },
          '50%': { transform: 'translateY(-12px) rotate(var(--tw-rotate, 0))' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(6,214,160,0.45)' },
          '70%': { boxShadow: '0 0 0 14px rgba(6,214,160,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(6,214,160,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease both',
        'fade-in': 'fade-in 0.3s ease both',
        'scale-in': 'scale-in 0.22s ease both',
        'slide-in-right': 'slide-in-right 0.3s ease both',
        'slide-in-left': 'slide-in-left 0.3s ease both',
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
      },
    },
  },
  plugins: [],
}
