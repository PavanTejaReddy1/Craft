import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query': ['react-query'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui': ['lucide-react', 'react-hot-toast', 'clsx', 'tailwind-merge'],
          'utils': ['axios', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://craft-lime-seven.vercel.app',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://craft-lime-seven.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
