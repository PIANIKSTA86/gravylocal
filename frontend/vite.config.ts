import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: '../pb_public',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
