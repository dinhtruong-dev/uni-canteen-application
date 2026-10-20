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
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (_err: any, _req: any, res: any) => {
            if (res && 'writeHead' in res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  success: false,
                  message: 'Backend API server (port 5000) chưa được bật hoặc đang khởi động.',
                })
              );
            }
          });
        },
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', () => {
            // Bỏ qua lỗi kết nối socket khi backend chưa bật
          });
        },
      },
    },
  },
});
