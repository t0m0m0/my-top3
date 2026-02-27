import path from 'node:path'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimiter } from './middleware/rate-limiter.ts'
import { booksApp } from './routes/books.ts'
import { musicApp } from './routes/music.ts'
import { moviesApp } from './routes/movies.ts'
import { imageProxyApp } from './routes/image-proxy.ts'
import { createSharesApp } from './routes/shares.ts'
import { createShareImageApp } from './routes/share-image.ts'
import { createShareStore } from './share-store.ts'
import { deleteShareImage } from './share-image-cleanup.ts'

if (!process.env['GOOGLE_BOOKS_API_KEY']) {
  console.warn(
    '[server] WARNING: GOOGLE_BOOKS_API_KEY is not set. /api/books endpoints will return 500.',
  )
}

if (!process.env['LASTFM_API_KEY']) {
  console.warn(
    '[server] WARNING: LASTFM_API_KEY is not set. /api/music endpoints will return 500.',
  )
}

if (!process.env['TMDB_API_KEY']) {
  console.warn(
    '[server] WARNING: TMDB_API_KEY is not set. /api/movies endpoints will return 500.',
  )
}

const app = new Hono()

if (!process.env['CORS_ORIGIN']) {
  throw new Error(
    'CORS_ORIGIN environment variable is required. Set it to comma-separated allowed origins (e.g. CORS_ORIGIN=https://example.com)',
  )
}

const corsOrigins = process.env['CORS_ORIGIN'].split(',')

app.use(
  '/api/*',
  cors({
    origin: corsOrigins,
    allowMethods: ['GET', 'POST', 'DELETE'],
  }),
)

app.use('/api/*', rateLimiter({ windowMs: 60_000, max: 60 }))

const sharesDataPath =
  process.env['SHARES_DATA_PATH'] ||
  path.resolve(process.cwd(), 'data', 'shares.db')

const imagesDir = path.resolve(process.cwd(), 'data', 'images')

const SHARE_TTL_SECONDS = 90 * 24 * 60 * 60 // 90 days

const shareStore = createShareStore(sharesDataPath, {
  ttlSeconds: SHARE_TTL_SECONDS,
  onDelete: (id) => deleteShareImage(imagesDir, id),
})

app.route('/api/books', booksApp)
app.route('/api/music', musicApp)
app.route('/api/movies', moviesApp)
app.route('/api/image', imageProxyApp)

app.route(
  '/api/shares',
  createSharesApp(sharesDataPath, {
    adminApiKey: process.env['ADMIN_API_KEY'],
    ttlSeconds: SHARE_TTL_SECONDS,
  }),
)

// Share OGP image upload/download
app.route(
  '/api/shares',
  createShareImageApp(imagesDir, (id) => shareStore.get(id) !== null),
)

export default app
