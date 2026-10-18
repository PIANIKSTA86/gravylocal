/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./store.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { 50:'#EEF4FF',100:'#D7E5FF',200:'#B7CEFF',300:'#92B4FF',400:'#6C98FF',500:'#4C7EFF',600:'#355FE4',700:'#2446B8',800:'#132B7D',900:'#091327' },
        brand: { 50:'#F5F3FF',100:'#EDE9FE',200:'#DDD6FE',300:'#C4B5FD',400:'#A78BFA',500:'#8B5CF6',600:'#7C3AED',700:'#6D28D9',800:'#5B21B6',900:'#4C1D95' },
        brandBlue: { 50:'#EFF6FF',100:'#DBEAFE',500:'#3B82F6',600:'#2563EB',700:'#1D4ED8',800:'#1E40AF',900:'#1E3A8A' },
        brandTeal: { 50:'#F0FDFA',100:'#CCFBF1',500:'#14B8A6',600:'#0D9488',700:'#0F766E',800:'#115E59' },
        brandDark: { 800:'#150E28',900:'#0E081F',950:'#080412' }
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] }
    }
  },
  plugins: [],
}
