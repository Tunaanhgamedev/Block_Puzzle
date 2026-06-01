import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/Block_Puzzle/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    assetsInlineLimit: 0, // ensure assets are always loaded via URL
  }
});
