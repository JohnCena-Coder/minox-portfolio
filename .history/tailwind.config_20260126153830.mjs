/** @type {import('tailwindcss').Config} */
export default {
  // Quan trọng: Dấu chấm (.) ở đầu rất quan trọng
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        vibe: ['"Archivo Narrow"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}