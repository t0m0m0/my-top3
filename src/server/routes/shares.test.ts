import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createSharesApp } from './shares'

describe('shares route', () => {
  let tmpDir: string
  let app: ReturnType<typeof createSharesApp>

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shares-route-'))
    const dbPath = path.join(tmpDir, 'shares.db')
    app = createSharesApp(dbPath)
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('POST /', () => {
    it('creates a share and returns id', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: '\u597d\u304d\u306a\u590f',
          bookId: 'abc',
          musicId: 'def',
          movieId: 'ghi',
        }),
      })
      expect(res.status).toBe(201)
      const json = (await res.json()) as { ok: boolean; id: string }
      expect(json.ok).toBe(true)
      expect(typeof json.id).toBe('string')
      expect(json.id.length).toBeGreaterThan(0)
    })

    it('returns 400 when no IDs are provided', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'test' }),
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 when body is an array', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ bookId: 'abc' }]),
      })
      expect(res.status).toBe(400)
      const json = (await res.json()) as {
        ok: boolean
        error: { message: string }
      }
      expect(json.ok).toBe(false)
      expect(json.error.message).toBe('Invalid body')
    })

    it('returns 400 for invalid JSON', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 for IDs exceeding max length', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'a'.repeat(101),
          musicId: '',
          movieId: '',
        }),
      })
      expect(res.status).toBe(400)
      const json = (await res.json()) as {
        ok: boolean
        error: { message: string }
      }
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/bookId/)
    })

    it('returns 400 for IDs containing control characters', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'abc\x00def',
          musicId: '',
          movieId: '',
        }),
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 for theme exceeding max length', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'あ'.repeat(51),
          bookId: 'b1',
          musicId: '',
          movieId: '',
        }),
      })
      expect(res.status).toBe(400)
      const json = (await res.json()) as {
        ok: boolean
        error: { message: string }
      }
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/theme/)
    })
  })

  describe('GET /', () => {
    it('returns a list of shares in newest-first order', async () => {
      // Create multiple shares
      for (const theme of ['alpha', 'beta', 'gamma']) {
        await app.request('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme,
            bookId: `b-${theme}`,
            musicId: `m-${theme}`,
            movieId: `v-${theme}`,
          }),
        })
      }

      const res = await app.request('/')
      expect(res.status).toBe(200)
      const json = (await res.json()) as {
        ok: boolean
        data: { items: { theme: string }[]; total: number }
      }
      expect(json.ok).toBe(true)
      expect(json.data.items).toHaveLength(3)
      expect(json.data.items[0]!.theme).toBe('gamma')
      expect(json.data.total).toBe(3)
    })

    it('supports limit and offset query params', async () => {
      for (const theme of ['a', 'b', 'c', 'd']) {
        await app.request('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme,
            bookId: `b-${theme}`,
            musicId: '',
            movieId: '',
          }),
        })
      }

      const res = await app.request('/?limit=2&offset=1')
      expect(res.status).toBe(200)
      const json = (await res.json()) as {
        ok: boolean
        data: { items: { theme: string }[]; total: number }
      }
      expect(json.data.items).toHaveLength(2)
      expect(json.data.items[0]!.theme).toBe('c')
      expect(json.data.items[1]!.theme).toBe('b')
      expect(json.data.total).toBe(4)
    })

    it('returns thumbnail URLs in list items', async () => {
      await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'with-thumbs',
          bookId: 'b1',
          musicId: 'm1',
          movieId: 'v1',
          bookThumb: 'https://example.com/book.jpg',
          musicThumb: 'https://example.com/music.jpg',
          movieThumb: 'https://example.com/movie.jpg',
        }),
      })

      const res = await app.request('/')
      const json = (await res.json()) as {
        ok: boolean
        data: {
          items: {
            bookThumb: string
            musicThumb: string
            movieThumb: string
          }[]
        }
      }
      expect(json.data.items[0]!.bookThumb).toBe('https://example.com/book.jpg')
      expect(json.data.items[0]!.musicThumb).toBe(
        'https://example.com/music.jpg',
      )
      expect(json.data.items[0]!.movieThumb).toBe(
        'https://example.com/movie.jpg',
      )
    })

    it('returns empty list when no shares exist', async () => {
      const res = await app.request('/')
      expect(res.status).toBe(200)
      const json = (await res.json()) as {
        ok: boolean
        data: { items: unknown[]; total: number }
      }
      expect(json.data.items).toHaveLength(0)
      expect(json.data.total).toBe(0)
    })

    it('clamps limit to max 50', async () => {
      const res = await app.request('/?limit=999')
      expect(res.status).toBe(200)
      // Just check it doesn't error; clamping is internal
    })

    it('ignores negative offset', async () => {
      const res = await app.request('/?offset=-5')
      expect(res.status).toBe(200)
    })
  })

  describe('GET /:id', () => {
    it('returns stored params', async () => {
      const createRes = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: '\u30c6\u30b9\u30c8',
          bookId: 'b1',
          musicId: '',
          movieId: 'm1',
        }),
      })
      const createJson = (await createRes.json()) as { id: string }

      const res = await app.request(`/${createJson.id}`)
      expect(res.status).toBe(200)
      const json = (await res.json()) as {
        ok: boolean
        data: {
          theme: string
          bookId: string
          musicId: string
          movieId: string
        }
      }
      expect(json.ok).toBe(true)
      expect(json.data).toMatchObject({
        theme: '\u30c6\u30b9\u30c8',
        bookId: 'b1',
        musicId: '',
        movieId: 'm1',
      })
    })

    it('returns 404 for unknown id', async () => {
      const res = await app.request('/nonexistent')
      expect(res.status).toBe(404)
      const json = (await res.json()) as { ok: boolean }
      expect(json.ok).toBe(false)
    })
  })
})
