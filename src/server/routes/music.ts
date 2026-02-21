import { Hono } from 'hono'
import { searchMusic, getMusicById } from '../../services/lastfm.ts'
import { registerRoutes } from './route-factory.ts'

const app = new Hono()

registerRoutes(app, {
  name: 'music',
  getAuth: () => process.env['LASTFM_API_KEY'] ?? '',
  authErrorMessage: 'Last.fm API key not configured',
  searchFn: searchMusic,
  getByIdFn: getMusicById,
  maxSearchResults: { min: 1, max: 10, default: 10 },
})

export { app as musicApp }
