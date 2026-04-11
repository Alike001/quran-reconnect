/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F9F6EF",
        sand: "#E8DCC8",
        gold: "#C9A84C",
        "gold-dark": "#A07830",
        teal: "#2D7D6F",
        "teal-dark": "#1E5C52",
        ink: "#1C1C2E",
        "ink-light": "#3D3D5C",
        mist: "#F0ECE3",
      },
      fontFamily: {
        arabic: ["Amiri", "serif"],        
        heading: ["Cormorant Garamond", "serif"],  
        body: ["DM Sans", "sans-serif"], 
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
}