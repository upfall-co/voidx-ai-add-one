import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'), 
      name: 'voidx-ai-addon',
      fileName: (format) => `voidx-ai-addon.${format}.js`,
      formats: ['umd', 'es']
    }
  }
})
