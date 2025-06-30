import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/widget/**/*'],
      outDir: 'dist/embed',
    }),
    // Inject CSS into JS for single-file widget
    cssInjectedByJsPlugin(),
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
    cssCodeSplit: false,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});
