import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from /maharashtra-darshan/
export default defineConfig({
  base: '/maharashtra-darshan/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Separate files for React and for the place data. They change less
        // often than the app code, so browsers keep them cached across updates,
        // and the three download in parallel.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'data', test: /src[\\/]data[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
