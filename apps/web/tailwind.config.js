/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        ink: '#172554',
        muted: '#475569',
        primary: '#4F46E5',
        cyan: '#67E8F9',
        success: '#10B981',
        warning: '#D97706',
        danger: '#DC2626',
        card: '#FFFFFF',
        stroke: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', '"Noto Sans Tamil"', '"Noto Sans Devanagari"', 'sans-serif'],
        display: ['Manrope', 'Inter', '"Noto Sans Tamil"', '"Noto Sans Devanagari"', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(23, 37, 84, 0.06)',
        glow: '0 12px 36px rgba(79, 70, 229, 0.22)',
        cyanGlow: '0 8px 28px rgba(103, 232, 249, 0.35)',
      },
    },
  },
  plugins: [],
};
