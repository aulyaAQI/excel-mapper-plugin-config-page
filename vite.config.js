import {fileURLToPath, URL} from 'node:url';

import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  define: {
    'process.env': {},
  },
  plugins: [vue(), VueDevTools()],
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'config.js',
        assetFileNames: 'app-[name].css',
        chunkFileNames: 'chunk-[name].js',
        manualChunks: undefined,
      },
    },
    outDir: './dist', // definisi nama folder build
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
