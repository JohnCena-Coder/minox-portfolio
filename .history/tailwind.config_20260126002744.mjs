/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#2563eb', // Màu xanh chủ đạo demo
				dark: '#18181b',
			},
			fontFamily: {
				sans: ['Inter', 'Segoe UI', 'sans-serif'],
			}
		},
	},
	plugins: [],
}