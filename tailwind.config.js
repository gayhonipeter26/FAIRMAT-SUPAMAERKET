/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#EE3124', // Logo Red
        navy: '#3D6EB4',  // Logo Blue
        sidebar: '#1E3A8A', // Dark Navy Blue
        surface: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        cursive: ['Satisfy', 'cursive'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      }
    }
  },
  plugins: [],
}
