import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3002,
    host: '0.0.0.0',
    proxy: {
      // Lets a relative "/api" base keep working in dev even when env is off.
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
