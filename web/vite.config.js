import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file from parent directory (root folder containing .env)
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  
  const devPortBe = env.DEV_PORT_BE || '8017'
  const targetUrl = `http://backend:${devPortBe}`

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      open: true,
      proxy: {
        '/api': {
          target: targetUrl,
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
  }
})