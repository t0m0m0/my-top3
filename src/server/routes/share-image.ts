import { Hono } from 'hono'
import fs from 'node:fs'
import path from 'node:path'

export type ShareExistsCheck = (id: string) => boolean

const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const VALID_ID_RE = /^[A-Za-z0-9_-]{1,12}$/

export function createShareImageApp(
  imagesDir: string,
  shareExists: ShareExistsCheck,
) {
  fs.mkdirSync(imagesDir, { recursive: true })

  const app = new Hono()

  app.post('/:id/image', async (c) => {
    const id = c.req.param('id')

    if (!VALID_ID_RE.test(id)) {
      return c.json(
        { ok: false, error: { kind: 'validation', message: 'Invalid ID' } },
        400,
      )
    }

    if (!shareExists(id)) {
      return c.json(
        { ok: false, error: { kind: 'not_found', message: 'Share not found' } },
        404,
      )
    }

    const contentType = c.req.header('content-type') ?? ''
    if (!contentType.startsWith('image/png')) {
      return c.json(
        {
          ok: false,
          error: {
            kind: 'validation',
            message: 'Content-Type must be image/png',
          },
        },
        400,
      )
    }

    const buf = await c.req.arrayBuffer()

    if (buf.byteLength === 0) {
      return c.json(
        {
          ok: false,
          error: { kind: 'validation', message: 'Empty body' },
        },
        400,
      )
    }

    if (buf.byteLength > MAX_SIZE) {
      return c.json(
        {
          ok: false,
          error: {
            kind: 'validation',
            message: 'File too large (max 2MB)',
          },
        },
        413,
      )
    }

    const filePath = path.join(imagesDir, `${id}.png`)
    fs.writeFileSync(filePath, Buffer.from(buf))

    return c.json({ ok: true })
  })

  app.get('/:id/image', (c) => {
    const id = c.req.param('id')

    if (!VALID_ID_RE.test(id)) {
      return c.json(
        { ok: false, error: { kind: 'validation', message: 'Invalid ID' } },
        400,
      )
    }

    const filePath = path.join(imagesDir, `${id}.png`)

    if (!fs.existsSync(filePath)) {
      return c.json(
        {
          ok: false,
          error: { kind: 'not_found', message: 'Image not found' },
        },
        404,
      )
    }

    const data = fs.readFileSync(filePath)

    return c.body(data, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, immutable',
    })
  })

  return app
}
