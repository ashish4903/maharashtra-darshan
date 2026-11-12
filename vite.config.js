import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /maharashtra-darshan/
export default defineConfig({
  base: '/maharashtra-darshan/',
  plugins: [react()],
  build: {
    // The bundle includes ~230 KB of place data (about 130 KB gzipped in all)
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
  },
});
