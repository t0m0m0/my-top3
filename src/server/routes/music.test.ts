// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { musicApp } from './music'

vi.mock('../../services/lastfm.ts', () => ({
  searchMusic: vi.fn(),
  getMusicById: vi.fn(),
}))

import { searchMusic, getMusicById } from '../../services/lastfm.ts'

const mockSearchMusic = vi.mocked(searchMusic)
const mockGetMusicById = vi.mocked(getMusicById)

describe('music routes', () => {
  beforeEach(() => {
    vi.stubEnv('LASTFM_API_KEY', 'test-api-key')
    vi.clearAllMocks()
  })

  describe('GET /search', () => {
    it('returns 500 when API key missing', async () => {
      vi.stubEnv('LASTFM_API_KEY', '')
      const res = await musicApp.request('/search?q=test')
      expect(res.status).toBe(500)
    })

    it('returns results on success', async () => {
      mockSearchMusic.mockResolvedValue({
        ok: true,
        data: {
          items: [
            {
              id: 'm1',
              category: 'music',
              title: 'Album',
              subtitle: 'Artist',
              thumbnailUrl: '',
              externalUrl: '',
            },
          ],
          totalItems: 1,
          startIndex: 0,
        },
      })
      const res = await musicApp.request('/search?q=test')
      expect(res.status).toBe(200)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(true)
    })

    it('returns 400 for too long query', async () => {
      const longQuery = 'a'.repeat(201)
      const res = await musicApp.request(`/search?q=${longQuery}`)
      expect(res.status).toBe(400)
    })
  })

  describe('GET /:id', () => {
    it('returns item on success', async () => {
      mockGetMusicById.mockResolvedValue({
        ok: true,
        data: {
          id: 'm1',
          category: 'music',
          title: 'Album',
          subtitle: 'Artist',
          thumbnailUrl: '',
          externalUrl: '',
        },
      })
      const res = await musicApp.request('/album-1')
      expect(res.status).toBe(200)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(true)
    })
  })
})
