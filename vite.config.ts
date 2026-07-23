import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — proxies /api + /socket.io to the Express backend during dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', changeOrigin: true, ws: true },
    },
  },
});
