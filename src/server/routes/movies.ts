import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { Hono } from 'hono'
import { searchMovies, getMovieById } from '../../services/tmdb.ts'

const app = new Hono()

function getApiKey(): string {
  return process.env['TMDB_API_KEY'] ?? ''
}

app.get('/search', async (c) => {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      console.error('[movies/search] TMDB_API_KEY is not configured')
      return c.json(
        {
          ok: false,
          error: { kind: 'unknown', message: 'API key not configured' },
        },
        500,
      )
    }

    const query = c.req.query('q') ?? ''
    const startIndex = Math.max(
      0,
      Number(c.req.query('startIndex') ?? '0') || 0,
    )
    const maxResults = Math.max(
      1,
      Math.min(40, Number(c.req.query('maxResults') ?? '20') || 20),
    )

    const result = await searchMovies(apiKey, query, {
      startIndex,
      maxResults,
    })

    if (!result.ok) {
      const status = (result.error.status ?? 500) as ContentfulStatusCode
      console.error(
        `[movies/search] error: kind=${result.error.kind} status=${status} message=${result.error.message}`,
      )
      return c.json(result, status)
    }

    return c.json(result)
  } catch (err) {
    console.error('[movies/search] unexpected error:', err)
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
    const apiKey = getApiKey()
    if (!apiKey) {
      console.error('[movies/:id] TMDB_API_KEY is not configured')
      return c.json(
        {
          ok: false,
          error: { kind: 'unknown', message: 'API key not configured' },
        },
        500,
      )
    }

    const movieId = c.req.param('id')
    const result = await getMovieById(apiKey, movieId)

    if (!result.ok) {
      const status = (result.error.status ?? 500) as ContentfulStatusCode
      console.error(
        `[movies/:id] error: kind=${result.error.kind} status=${status} message=${result.error.message} movieId=${movieId}`,
      )
      return c.json(result, status)
    }

    return c.json(result)
  } catch (err) {
    console.error('[movies/:id] unexpected error:', err)
    return c.json(
      {
        ok: false,
        error: { kind: 'unknown', message: 'Internal server error' },
      },
      500,
    )
  }
})

export { app as moviesApp }
