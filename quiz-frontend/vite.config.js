import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbite from 'flowbite/plugin'
// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    cssMinify: "esbuild"
  },
  plugins: [react(),
     tailwindcss({
       plugins: [flowbite]
     })
  ],
})
