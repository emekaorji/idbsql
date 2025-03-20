import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: true,
  server: {
    watch: {
      // Include dist directory in watch
      ignored: ['!**/dist/**'],
    },
  },
});
