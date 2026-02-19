import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import devServer from '@hono/vite-dev-server'

const API_ENV_KEYS = [
  'GOOGLE_BOOKS_API_KEY',
  'LASTFM_API_KEY',
  'TMDB_API_KEY',
] as const

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Only set the specific API keys needed by the dev server
  for (const key of API_ENV_KEYS) {
    if (env[key]) {
      process.env[key] = env[key]
    }
  }

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
