import { Hono } from 'hono'
import { searchMovies, getMovieById } from '../../services/tmdb.ts'
import { registerRoutes } from './route-factory.ts'

const app = new Hono()

registerRoutes(app, {
  name: 'movies',
  getAuth: () => process.env['TMDB_API_KEY'] ?? '',
  authErrorMessage: 'API key not configured',
  searchFn: searchMovies,
  getByIdFn: getMovieById,
})

export { app as moviesApp }
