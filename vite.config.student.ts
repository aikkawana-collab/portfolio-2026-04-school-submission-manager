import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: resolve(__dirname, 'src/client/student'),
  build: {
    outDir: resolve(__dirname, 'dist/student'),
    emptyOutDir: true,
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
