/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cs2: {
          orange: '#FF6B00',
          blue: '#1E40AF',
          dark: '#1A1A1A',
          gray: '#2A2A2A'
        }
      }
    },
  },
  plugins: [],
}