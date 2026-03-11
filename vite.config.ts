import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const openrouterKey = env.OPENROUTER_API_KEY || ''

  return {
    plugins: [react()],
    resolve: {
      alias: {
        'ai': 'empty-npm-package',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8788',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
        '/llm': {
          target: 'https://openrouter.ai',
          changeOrigin: true,
          rewrite: () => '/api/v1/chat/completions',
          headers: Object.assign({}, openrouterKey ? { 'Authorization': `Bearer ${openrouterKey}` } : {}) as Record<string, string>,
        },
      },
    },
  }
})
