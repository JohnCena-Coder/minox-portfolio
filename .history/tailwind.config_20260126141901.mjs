/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
                // Thêm dòng này:
				vibe: ['"Archivo Narrow"', 'sans-serif'], 
			}
		},
	},
	plugins: [],
}