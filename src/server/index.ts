import { Hono } from 'hono'
import { booksApp } from './routes/books.ts'

if (!process.env['GOOGLE_BOOKS_API_KEY']) {
  console.warn(
    '[server] WARNING: GOOGLE_BOOKS_API_KEY is not set. /api/books endpoints will return 500.',
  )
}

const app = new Hono()

app.route('/api/books', booksApp)

export default app
