import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { booksApp } from './routes/books.ts'
import { musicApp } from './routes/music.ts'
import { moviesApp } from './routes/movies.ts'

if (!process.env['GOOGLE_BOOKS_API_KEY']) {
  console.warn(
    '[server] WARNING: GOOGLE_BOOKS_API_KEY is not set. /api/books endpoints will return 500.',
  )
}

if (
  !process.env['SPOTIFY_CLIENT_ID'] ||
  !process.env['SPOTIFY_CLIENT_SECRET']
) {
  console.warn(
    '[server] WARNING: SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not set. /api/music endpoints will return 500.',
  )
}

if (!process.env['TMDB_API_KEY']) {
  console.warn(
    '[server] WARNING: TMDB_API_KEY is not set. /api/movies endpoints will return 500.',
  )
}

const app = new Hono()

app.use(
  '/api/*',
  cors({
    origin: ['https://myno1s.exe.xyz'],
    allowMethods: ['GET'],
  }),
)

app.route('/api/books', booksApp)
app.route('/api/music', musicApp)
app.route('/api/movies', moviesApp)

export default app
