import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { Hono } from 'hono'
import type { Context } from 'hono'
import {
  validateSearchQuery,
  clampStartIndex,
} from '../middleware/validate-search.ts'
import type {
  Result,
  PaginatedResponse,
  SearchResultItem,
} from '../../types/common.ts'

type SearchFn = (
  auth: string,
  query: string,
  options: { startIndex: number; maxResults: number },
) => Promise<Result<PaginatedResponse<SearchResultItem>>>

type GetByIdFn = (auth: string, id: string) => Promise<Result<SearchResultItem>>

export type RouteConfig = {
  name: string
  getAuth: () => string
  authErrorMessage: string
  searchFn: SearchFn
  getByIdFn: GetByIdFn
  maxSearchResults?: { min: number; max: number; default: number }
}

function handleResultError(
  c: Context,
  result: {
    ok: false
    error: { kind: string; message: string; status?: number }
  },
  logPrefix: string,
) {
  const status = (result.error.status ?? 500) as ContentfulStatusCode
  console.error(
    `${logPrefix} error: kind=${result.error.kind} status=${status} message=${result.error.message}`,
  )
  return c.json(result, status)
}

export function registerRoutes(app: Hono, config: RouteConfig): void {
  const { name, getAuth, authErrorMessage, searchFn, getByIdFn } = config
  const maxResults = config.maxSearchResults ?? {
    min: 1,
    max: 40,
    default: 20,
  }

  app.get('/search', async (c) => {
    try {
      const auth = getAuth()
      if (!auth) {
        console.error(`[${name}/search] ${authErrorMessage}`)
        return c.json(
          {
            ok: false,
            error: { kind: 'unknown', message: authErrorMessage },
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
      const maxResultsValue = Math.max(
        maxResults.min,
        Math.min(
          maxResults.max,
          Number(c.req.query('maxResults') ?? String(maxResults.default)) ||
            maxResults.default,
        ),
      )

      const result = await searchFn(auth, query, {
        startIndex,
        maxResults: maxResultsValue,
      })

      if (!result.ok) {
        return handleResultError(c, result, `[${name}/search]`)
      }

      return c.json(result)
    } catch (err) {
      console.error(`[${name}/search] unexpected error:`, err)
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
      const auth = getAuth()
      if (!auth) {
        console.error(`[${name}/:id] ${authErrorMessage}`)
        return c.json(
          {
            ok: false,
            error: { kind: 'unknown', message: authErrorMessage },
          },
          500,
        )
      }

      const id = c.req.param('id')
      const result = await getByIdFn(auth, id)

      if (!result.ok) {
        return handleResultError(c, result, `[${name}/:id] id=${id}`)
      }

      return c.json(result)
    } catch (err) {
      console.error(`[${name}/:id] unexpected error:`, err)
      return c.json(
        {
          ok: false,
          error: { kind: 'unknown', message: 'Internal server error' },
        },
        500,
      )
    }
  })
}
