import { Hono } from 'hono'
import {
  getAccessToken,
  searchMusic,
  getMusicById,
} from '../../services/spotify.ts'
import { registerRoutes } from './route-factory.ts'
import type { Result } from '../../types/common.ts'

const app = new Hono()

function getClientId(): string {
  return process.env['SPOTIFY_CLIENT_ID'] ?? ''
}

function getClientSecret(): string {
  return process.env['SPOTIFY_CLIENT_SECRET'] ?? ''
}

async function getToken(): Promise<Result<string>> {
  const clientId = getClientId()
  const clientSecret = getClientSecret()
  if (!clientId || !clientSecret) {
    return {
      ok: false,
      error: {
        kind: 'auth-error',
        message: 'Spotify credentials not configured',
        status: 500,
      },
    }
  }
  return getAccessToken(clientId, clientSecret)
}

// Music routes need token-based auth, so we wrap the service functions
registerRoutes(app, {
  name: 'music',
  getAuth: () => {
    const clientId = getClientId()
    const clientSecret = getClientSecret()
    return clientId && clientSecret ? 'has-credentials' : ''
  },
  authErrorMessage: 'Spotify credentials not configured',
  searchFn: async (_auth, query, options) => {
    const tokenResult = await getToken()
    if (!tokenResult.ok) return tokenResult
    return searchMusic(tokenResult.data, query, options)
  },
  getByIdFn: async (_auth, id) => {
    const tokenResult = await getToken()
    if (!tokenResult.ok) return tokenResult
    return getMusicById(tokenResult.data, id)
  },
  maxSearchResults: { min: 1, max: 10, default: 10 },
})

export { app as musicApp }
