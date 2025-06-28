import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/widget/**/*'],
      outDir: 'dist/embed',
    }),
  ],
  build: {
    outDir: 'dist/embed',
    lib: {
      entry: resolve(__dirname, 'src/widget/index.ts'),
      name: 'WidgetLoader',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) =>
        `widget.${format === 'es' ? 'js' : format === 'cjs' ? 'cjs' : 'umd.js'}`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    // Ensure all CSS is bundled into a single file for embedding
    cssCodeSplit: false,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
