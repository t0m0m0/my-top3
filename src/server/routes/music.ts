import { Hono } from 'hono'
import { searchMusic, getMusicById } from '../../services/lastfm.ts'
import { registerRoutes } from './route-factory.ts'

const app = new Hono()

function getApiKey(): string {
  return process.env['LASTFM_API_KEY'] ?? ''
}

registerRoutes(app, {
  name: 'music',
  getAuth: () => getApiKey(),
  authErrorMessage: 'Last.fm API key not configured',
  searchFn: (apiKey, query, options) => searchMusic(apiKey, query, options),
  getByIdFn: (apiKey, id) => getMusicById(apiKey, id),
  maxSearchResults: { min: 1, max: 10, default: 10 },
})

export { app as musicApp }
