import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /maharashtra-darshan/
export default defineConfig({
  base: '/maharashtra-darshan/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
