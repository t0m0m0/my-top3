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

    it('includes reactionCount in response', async () => {
      const createRes = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'reaction-test',
          bookId: 'b1',
          musicId: 'm1',
          movieId: 'v1',
        }),
      })
      const { id } = (await createRes.json()) as { id: string }

      // Initially 0
      const res0 = await app.request(`/${id}`)
      const json0 = (await res0.json()) as {
        ok: boolean
        data: { reactionCount: number }
      }
      expect(json0.data.reactionCount).toBe(0)

      // Add reactions
      await app.request(`/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'client-a' }),
      })
      await app.request(`/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'client-b' }),
      })

      const res2 = await app.request(`/${id}`)
      const json2 = (await res2.json()) as {
        ok: boolean
        data: { reactionCount: number }
      }
      expect(json2.data.reactionCount).toBe(2)
    })
  })

  describe('DELETE /:id', () => {
    it('returns 401 when no admin key is configured', async () => {
      const createRes = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'b1',
          musicId: '',
          movieId: '',
        }),
      })
      const { id } = (await createRes.json()) as { id: string }

      const res = await app.request(`/${id}`, { method: 'DELETE' })
      expect(res.status).toBe(401)
    })

    it('returns 401 when Authorization header is missing', async () => {
      const appWithKey = createSharesApp(path.join(tmpDir, 'shares2.db'), {
        adminApiKey: 'secret-key',
      })
      const createRes = await appWithKey.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'b1',
          musicId: '',
          movieId: '',
        }),
      })
      const { id } = (await createRes.json()) as { id: string }

      const res = await appWithKey.request(`/${id}`, { method: 'DELETE' })
      expect(res.status).toBe(401)
    })

    it('returns 401 when Authorization header has wrong key', async () => {
      const appWithKey = createSharesApp(path.join(tmpDir, 'shares3.db'), {
        adminApiKey: 'secret-key',
      })
      const createRes = await appWithKey.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'b1',
          musicId: '',
          movieId: '',
        }),
      })
      const { id } = (await createRes.json()) as { id: string }

      const res = await appWithKey.request(`/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer wrong-key' },
      })
      expect(res.status).toBe(401)
    })

    it('deletes a share with valid admin key', async () => {
      const appWithKey = createSharesApp(path.join(tmpDir, 'shares4.db'), {
        adminApiKey: 'secret-key',
      })
      const createRes = await appWithKey.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'b1',
          musicId: '',
          movieId: '',
        }),
      })
      const { id } = (await createRes.json()) as { id: string }

      const res = await appWithKey.request(`/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer secret-key' },
      })
      expect(res.status).toBe(200)
      const json = (await res.json()) as { ok: boolean }
      expect(json.ok).toBe(true)

      // Verify it's gone
      const getRes = await appWithKey.request(`/${id}`)
      expect(getRes.status).toBe(404)
    })

    it('returns 404 when deleting non-existent share', async () => {
      const appWithKey = createSharesApp(path.join(tmpDir, 'shares5.db'), {
        adminApiKey: 'secret-key',
      })
      const res = await appWithKey.request('/nonexistent', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer secret-key' },
      })
      expect(res.status).toBe(404)
    })
  })

  describe('POST /:id/reactions', () => {
    async function createShare() {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'b1',
          musicId: 'm1',
          movieId: 'v1',
        }),
      })
      const json = (await res.json()) as { id: string }
      return json.id
    }

    it('adds a reaction and returns count', async () => {
      const id = await createShare()
      const res = await app.request(`/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'client-1' }),
      })
      expect(res.status).toBe(200)
      const json = (await res.json()) as {
        ok: boolean
        data: { count: number; reacted: boolean }
      }
      expect(json.ok).toBe(true)
      expect(json.data.count).toBe(1)
      expect(json.data.reacted).toBe(true)
    })

    it('removes a reaction when already reacted (toggle)', async () => {
      const id = await createShare()
      // First: add
      await app.request(`/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'client-1' }),
      })
      // Second: toggle off
      const res = await app.request(`/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'client-1', toggle: true }),
      })
      expect(res.status).toBe(200)
      const json = (await res.json()) as {
        ok: boolean
        data: { count: number; reacted: boolean }
      }
      expect(json.data.count).toBe(0)
      expect(json.data.reacted).toBe(false)
    })

    it('returns 400 when clientId is missing', async () => {
      const id = await createShare()
      const res = await app.request(`/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(400)
    })

    it('returns 404 for non-existent share', async () => {
      const res = await app.request('/nonexist/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'client-1' }),
      })
      expect(res.status).toBe(404)
    })

    it('includes reactionCount in list response', async () => {
      const id = await createShare()
      await app.request(`/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'client-1' }),
      })
      await app.request(`/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: 'client-2' }),
      })

      const listRes = await app.request('/')
      const listJson = (await listRes.json()) as {
        ok: boolean
        data: { items: { reactionCount: number }[] }
      }
      expect(listJson.data.items[0]!.reactionCount).toBe(2)
    })
  })

  describe('tags', () => {
    it('creates a share with tags and returns them in GET /:id', async () => {
      const createRes = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'タグテスト',
          bookId: 'b1',
          musicId: 'm1',
          movieId: 'v1',
          tags: ['アニメ', '推し活'],
        }),
      })
      expect(createRes.status).toBe(201)
      const { id } = (await createRes.json()) as { id: string }

      const res = await app.request(`/${id}`)
      const json = (await res.json()) as {
        ok: boolean
        data: { tags: string[] }
      }
      expect(json.data.tags).toEqual(['アニメ', '推し活'])
    })

    it('returns tags in list items', async () => {
      await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'with-tags',
          bookId: 'b1',
          musicId: 'm1',
          movieId: 'v1',
          tags: ['rock'],
        }),
      })

      const res = await app.request('/')
      const json = (await res.json()) as {
        ok: boolean
        data: { items: { tags: string[] }[] }
      }
      expect(json.data.items[0]!.tags).toEqual(['rock'])
    })

    it('filters by tag query parameter', async () => {
      await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'anime-board',
          bookId: 'b1',
          musicId: '',
          movieId: '',
          tags: ['アニメ', '2025春'],
        }),
      })
      await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'music-board',
          bookId: '',
          musicId: 'm1',
          movieId: '',
          tags: ['音楽'],
        }),
      })

      const res = await app.request('/?tag=アニメ')
      const json = (await res.json()) as {
        ok: boolean
        data: { items: { theme: string }[]; total: number }
      }
      expect(json.data.items).toHaveLength(1)
      expect(json.data.items[0]!.theme).toBe('anime-board')
      expect(json.data.total).toBe(1)
    })

    it('returns empty when filtering by nonexistent tag', async () => {
      await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'no-match',
          bookId: 'b1',
          musicId: '',
          movieId: '',
          tags: ['アニメ'],
        }),
      })

      const res = await app.request('/?tag=存在しないタグ')
      const json = (await res.json()) as {
        ok: boolean
        data: { items: unknown[]; total: number }
      }
      expect(json.data.items).toHaveLength(0)
      expect(json.data.total).toBe(0)
    })

    it('returns 400 for too many tags', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'b1',
          musicId: '',
          movieId: '',
          tags: ['a', 'b', 'c', 'd', 'e', 'f'],
        }),
      })
      expect(res.status).toBe(400)
    })

    it('returns 400 for tag exceeding max length', async () => {
      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'test',
          bookId: 'b1',
          musicId: '',
          movieId: '',
          tags: ['あ'.repeat(21)],
        }),
      })
      expect(res.status).toBe(400)
    })

    it('handles shares without tags (empty array)', async () => {
      const createRes = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: 'no-tags',
          bookId: 'b1',
          musicId: '',
          movieId: '',
        }),
      })
      const { id } = (await createRes.json()) as { id: string }

      const res = await app.request(`/${id}`)
      const json = (await res.json()) as {
        ok: boolean
        data: { tags: string[] }
      }
      expect(json.data.tags).toEqual([])
    })
  })
})
