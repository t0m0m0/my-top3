import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import devServer from '@hono/vite-dev-server'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    server: {
      allowedHosts: ['myno1s.exe.xyz'],
    },
    plugins: [
      react(),
      tailwindcss(),
      devServer({
        entry: 'src/server/index.ts',
        exclude: [/^\/(?!api\/).*/],
      }),
    ],
  }
})
