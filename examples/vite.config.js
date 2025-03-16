import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: false,
  build: {
    outDir: '../dist-example',
    emptyOutDir: true,
  },
  server: {
    open: '/index.html',
  },
});
