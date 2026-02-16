import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { Hono } from 'hono'
import { searchBooks, getBookById } from '../../services/google-books.ts'
import {
  validateSearchQuery,
  clampStartIndex,
} from '../middleware/validate-search.ts'

const app = new Hono()

function getApiKey(): string {
  return process.env['GOOGLE_BOOKS_API_KEY'] ?? ''
}

app.get('/search', async (c) => {
  try {
    const apiKey = getApiKey()
    if (!apiKey) {
      console.error('[books/search] GOOGLE_BOOKS_API_KEY is not configured')
      return c.json(
        {
          ok: false,
          error: { kind: 'unknown', message: 'API key not configured' },
        },
        500,
      )
    }

    const query = c.req.query('q') ?? ''
    const queryError = validateSearchQuery(query)
    if (queryError) {
      return c.json(
        { ok: false, error: { kind: 'unknown', message: queryError } },
        400,
      )
    }
    const startIndex = clampStartIndex(c.req.query('startIndex') ?? '0')
    const maxResults = Math.max(
      1,
      Math.min(40, Number(c.req.query('maxResults') ?? '20') || 20),
    )

    const result = await searchBooks(apiKey, query, { startIndex, maxResults })

    if (!result.ok) {
      const status = (result.error.status ?? 500) as ContentfulStatusCode
      console.error(
        `[books/search] error: kind=${result.error.kind} status=${status} message=${result.error.message}`,
      )
      return c.json(result, status)
    }

    return c.json(result)
  } catch (err) {
    console.error('[books/search] unexpected error:', err)
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
      console.error('[books/:id] GOOGLE_BOOKS_API_KEY is not configured')
      return c.json(
        {
          ok: false,
          error: { kind: 'unknown', message: 'API key not configured' },
        },
        500,
      )
    }

    const volumeId = c.req.param('id')
    const result = await getBookById(apiKey, volumeId)

    if (!result.ok) {
      const status = (result.error.status ?? 500) as ContentfulStatusCode
      console.error(
        `[books/:id] error: kind=${result.error.kind} status=${status} message=${result.error.message} volumeId=${volumeId}`,
      )
      return c.json(result, status)
    }

    return c.json(result)
  } catch (err) {
    console.error('[books/:id] unexpected error:', err)
    return c.json(
      {
        ok: false,
        error: { kind: 'unknown', message: 'Internal server error' },
      },
      500,
    )
  }
})

export { app as booksApp }
