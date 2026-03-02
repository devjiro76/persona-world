import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @molroo-io/sdk pulls in optional peer deps (ai, @ai-sdk/*) that are
      // Node-only and not needed in this browser-side demo.  Map them to the
      // empty shim so Vite/Rollup does not try to bundle them.
      'ai': 'empty-npm-package',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
