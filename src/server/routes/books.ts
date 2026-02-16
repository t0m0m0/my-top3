import { Hono } from 'hono'
import { searchBooks, getBookById } from '../../services/google-books.ts'
import { registerRoutes } from './route-factory.ts'

const app = new Hono()

registerRoutes(app, {
  name: 'books',
  getAuth: () => process.env['GOOGLE_BOOKS_API_KEY'] ?? '',
  authErrorMessage: 'API key not configured',
  searchFn: searchBooks,
  getByIdFn: getBookById,
})

export { app as booksApp }
