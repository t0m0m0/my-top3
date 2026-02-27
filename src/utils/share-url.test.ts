import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createShortUrl, uploadShareImage } from './share-url'

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

describe('uploadShareImage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls POST /api/shares/:id/image with PNG blob', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
    const blob = new Blob(['png-data'], { type: 'image/png' })

    const result = await uploadShareImage('abc123', blob)

    expect(result).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/shares/abc123/image', {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: blob,
    })
  })

  it('returns false on server error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    const blob = new Blob(['png-data'], { type: 'image/png' })

    const result = await uploadShareImage('abc123', blob)

    expect(result).toBe(false)
  })

  it('returns false on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network'))
    const blob = new Blob(['png-data'], { type: 'image/png' })

    const result = await uploadShareImage('abc123', blob)

    expect(result).toBe(false)
  })
})
