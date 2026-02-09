import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { Hono } from 'hono'
import {
  getAccessToken,
  searchMusic,
  getMusicById,
} from '../../services/spotify.ts'

const app = new Hono()

function getClientId(): string {
  return process.env['SPOTIFY_CLIENT_ID'] ?? ''
}

function getClientSecret(): string {
  return process.env['SPOTIFY_CLIENT_SECRET'] ?? ''
}

app.get('/search', async (c) => {
  try {
    const clientId = getClientId()
    const clientSecret = getClientSecret()
    if (!clientId || !clientSecret) {
      console.error(
        '[music/search] SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not configured',
      )
      return c.json(
        {
          ok: false,
          error: {
            kind: 'unknown',
            message: 'Spotify credentials not configured',
          },
        },
        500,
      )
    }

    const tokenResult = await getAccessToken(clientId, clientSecret)
    if (!tokenResult.ok) {
      const status = (tokenResult.error.status ?? 500) as ContentfulStatusCode
      console.error(
        `[music/search] token error: kind=${tokenResult.error.kind} status=${status} message=${tokenResult.error.message}`,
      )
      return c.json(tokenResult, status)
    }

    const query = c.req.query('q') ?? ''
    const startIndex = Math.max(
      0,
      Number(c.req.query('startIndex') ?? '0') || 0,
    )
    const maxResults = Math.max(
      1,
      Math.min(50, Number(c.req.query('maxResults') ?? '20') || 20),
    )

    const result = await searchMusic(tokenResult.data, query, {
      startIndex,
      maxResults,
    })

    if (!result.ok) {
      const status = (result.error.status ?? 500) as ContentfulStatusCode
      console.error(
        `[music/search] error: kind=${result.error.kind} status=${status} message=${result.error.message}`,
      )
      return c.json(result, status)
    }

    return c.json(result)
  } catch (err) {
    console.error('[music/search] unexpected error:', err)
    return c.json(
      {
        ok: false,
        error: { kind: 'unknown', message: 'Internal server error' },
      },
      500,
    )
  }
})

app.get('/:id', async (c) => {
  try {
    const clientId = getClientId()
    const clientSecret = getClientSecret()
    if (!clientId || !clientSecret) {
      console.error(
        '[music/:id] SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not configured',
      )
      return c.json(
        {
          ok: false,
          error: {
            kind: 'unknown',
            message: 'Spotify credentials not configured',
          },
        },
        500,
      )
    }

    const tokenResult = await getAccessToken(clientId, clientSecret)
    if (!tokenResult.ok) {
      const status = (tokenResult.error.status ?? 500) as ContentfulStatusCode
      console.error(
        `[music/:id] token error: kind=${tokenResult.error.kind} status=${status} message=${tokenResult.error.message}`,
      )
      return c.json(tokenResult, status)
    }

    const albumId = c.req.param('id')
    const result = await getMusicById(tokenResult.data, albumId)

    if (!result.ok) {
      const status = (result.error.status ?? 500) as ContentfulStatusCode
      console.error(
        `[music/:id] error: kind=${result.error.kind} status=${status} message=${result.error.message} albumId=${albumId}`,
      )
      return c.json(result, status)
    }

    return c.json(result)
  } catch (err) {
    console.error('[music/:id] unexpected error:', err)
    return c.json(
      {
        ok: false,
        error: { kind: 'unknown', message: 'Internal server error' },
      },
      500,
    )
  }
})

export { app as musicApp }
