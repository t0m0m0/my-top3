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
      expect(json.data).toEqual({
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
