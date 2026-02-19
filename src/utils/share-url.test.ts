import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createShortUrl } from './share-url'

describe('createShortUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls POST /api/shares and returns short URL path', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, id: 'abc123' }),
    })

    const result = await createShortUrl({
      theme: 'テスト',
      bookId: 'b1',
      musicId: 'm1',
      movieId: 'mv1',
    })

    expect(result).toBe('/s/abc123')
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: 'テスト',
        bookId: 'b1',
        musicId: 'm1',
        movieId: 'mv1',
      }),
    })
  })

  it('throws on API error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ ok: false }),
    })

    await expect(
      createShortUrl({
        theme: '',
        bookId: 'b1',
        musicId: '',
        movieId: '',
      }),
    ).rejects.toThrow()
  })
})
