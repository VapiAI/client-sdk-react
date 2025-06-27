import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// Configuration for building embeddable widgets
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/widget/**/*'],
      outDir: 'dist',
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/widget/index.ts'),
      name: 'WidgetLoader',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `widget.${format === 'es' ? 'js' : format === 'cjs' ? 'cjs' : 'umd.js'}`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}) 