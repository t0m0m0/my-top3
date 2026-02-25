import { Hono } from 'hono'
import { createShareStore, type ShareParams } from '../share-store.ts'

function isValidBody(body: unknown): body is {
  theme?: string
  bookId?: string
  musicId?: string
  movieId?: string
  bookThumb?: string
  musicThumb?: string
  movieThumb?: string
} {
  return typeof body === 'object' && body !== null && !Array.isArray(body)
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

export type SharesAppOptions = {
  adminApiKey?: string
  ttlSeconds?: number
}

export function createSharesApp(dbPath: string, options?: SharesAppOptions) {
  const store = createShareStore(dbPath, {
    ttlSeconds: options?.ttlSeconds,
  })
  const app = new Hono()
  const adminApiKey = options?.adminApiKey

  const MAX_LIMIT = 50
  const DEFAULT_LIMIT = 20

  app.get('/', (c) => {
    const limitParam = parseInt(c.req.query('limit') ?? '', 10)
    const offsetParam = parseInt(c.req.query('offset') ?? '', 10)
    const limit = Math.min(
      Math.max(Number.isFinite(limitParam) ? limitParam : DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    )
    const offset = Math.max(Number.isFinite(offsetParam) ? offsetParam : 0, 0)
    const result = store.list({ limit, offset })
    return c.json({ ok: true, data: result })
  })

  app.post('/', async (c) => {
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json(
        { ok: false, error: { kind: 'validation', message: 'Invalid JSON' } },
        400,
      )
    }

    if (!isValidBody(body)) {
      return c.json(
        { ok: false, error: { kind: 'validation', message: 'Invalid body' } },
        400,
      )
    }

    const params: ShareParams = {
      theme: str(body.theme),
      bookId: str(body.bookId),
      musicId: str(body.musicId),
      movieId: str(body.movieId),
      bookThumb: str(body.bookThumb),
      musicThumb: str(body.musicThumb),
      movieThumb: str(body.movieThumb),
    }

    if (!params.bookId && !params.musicId && !params.movieId) {
      return c.json(
        {
          ok: false,
          error: {
            kind: 'validation',
            message: 'At least one work ID is required',
          },
        },
        400,
      )
    }

    try {
      const id = store.save(params)
      return c.json({ ok: true, id }, 201)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Validation failed'
      return c.json({ ok: false, error: { kind: 'validation', message } }, 400)
    }
  })

  app.post('/:id/reactions', async (c) => {
    const id = c.req.param('id')
    const share = store.get(id)
    if (!share) {
      return c.json(
        { ok: false, error: { kind: 'not_found', message: 'Share not found' } },
        404,
      )
    }

    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json(
        { ok: false, error: { kind: 'validation', message: 'Invalid JSON' } },
        400,
      )
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return c.json(
        { ok: false, error: { kind: 'validation', message: 'Invalid body' } },
        400,
      )
    }

    const { clientId, toggle } = body as {
      clientId?: unknown
      toggle?: unknown
    }
    if (typeof clientId !== 'string' || !clientId) {
      return c.json(
        {
          ok: false,
          error: { kind: 'validation', message: 'clientId is required' },
        },
        400,
      )
    }

    try {
      let result
      if (toggle && store.hasReacted(id, clientId)) {
        result = store.removeReaction(id, clientId)
      } else {
        result = store.addReaction(id, clientId)
      }
      return c.json({ ok: true, data: result })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Validation failed'
      return c.json({ ok: false, error: { kind: 'validation', message } }, 400)
    }
  })

  app.get('/:id', (c) => {
    const id = c.req.param('id')
    const params = store.get(id)

    if (!params) {
      return c.json(
        { ok: false, error: { kind: 'not_found', message: 'Share not found' } },
        404,
      )
    }

    return c.json({ ok: true, data: params })
  })

  app.delete('/:id', (c) => {
    if (!adminApiKey) {
      return c.json(
        {
          ok: false,
          error: { kind: 'unauthorized', message: 'Admin API not configured' },
        },
        401,
      )
    }

    const auth = c.req.header('Authorization')
    if (auth !== `Bearer ${adminApiKey}`) {
      return c.json(
        {
          ok: false,
          error: { kind: 'unauthorized', message: 'Invalid credentials' },
        },
        401,
      )
    }

    const id = c.req.param('id')
    const deleted = store.delete(id)
    if (!deleted) {
      return c.json(
        { ok: false, error: { kind: 'not_found', message: 'Share not found' } },
        404,
      )
    }

    return c.json({ ok: true })
  })

  return app
}
