/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { 50:'#EEF4FF',100:'#D7E5FF',200:'#B7CEFF',300:'#92B4FF',400:'#6C98FF',500:'#4C7EFF',600:'#355FE4',700:'#2446B8',800:'#132B7D',900:'#091327' },
        brand: { 50:'#E8FDFF',100:'#CFFAFF',200:'#A9F3FF',300:'#84EDFF',400:'#64E1FF',500:'#33C7FF',600:'#1CA6E0',700:'#1982B0',800:'#185F7E',900:'#153F53' }
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] }
    }
  },
  plugins: [],
}
