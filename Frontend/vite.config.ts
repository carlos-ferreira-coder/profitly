import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      allowedHosts: [process.env.VITE_DOMAIN || ''],
      proxy: {
        '/api': {
          target: process.env.VITE_SERVER_DOMAIN || '',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  })
}
