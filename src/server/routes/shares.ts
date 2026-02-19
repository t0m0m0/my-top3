import { Hono } from 'hono'
import { createShareStore, type ShareParams } from '../share-store.ts'

function isValidBody(body: unknown): body is {
  theme?: string
  bookId?: string
  musicId?: string
  movieId?: string
} {
  return typeof body === 'object' && body !== null
}

export function createSharesApp(dbPath: string) {
  const store = createShareStore(dbPath)
  const app = new Hono()

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
      theme: typeof body.theme === 'string' ? body.theme : '',
      bookId: typeof body.bookId === 'string' ? body.bookId : '',
      musicId: typeof body.musicId === 'string' ? body.musicId : '',
      movieId: typeof body.movieId === 'string' ? body.movieId : '',
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

  return app
}
