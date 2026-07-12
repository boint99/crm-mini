import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    // port: 3000,
    open: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8017',
        changeOrigin: true
      }
    }
  },
  build: {
    // Không tạo source map khi build production (bảo mật)
    sourcemap: false,
  },
  // Giúp tree-shaking loại bỏ Redux DevTools khỏi production bundle
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}))