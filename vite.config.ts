import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'styles': path.join(__dirname, 'src/client/assets/styles'),
    }
  },
  plugins: [react()],
  build: {
    minify: true
  }
})
