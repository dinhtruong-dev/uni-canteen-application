import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// ==============================================================================
// CẤU HÌNH VITE FRONTEND (VITE CONFIGURATION FOR LOCAL MACHINE)
// ==============================================================================
// [HƯỚNG DẪN CẤU HÌNH TRÊN MÁY CỦA BẠN]:
// - proxy: Tự động chuyển tiếp mọi request gọi đến '/api' sang backend (localhost:5000)
//   giúp bạn không bao giờ bị lỗi CORS trên máy cá nhân!
// ==============================================================================

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
});
