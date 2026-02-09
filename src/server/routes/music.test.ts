// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { musicApp } from './music'

vi.mock('../../services/spotify.ts', () => ({
  getAccessToken: vi.fn(),
  searchMusic: vi.fn(),
  getMusicById: vi.fn(),
}))

import {
  getAccessToken,
  searchMusic,
  getMusicById,
} from '../../services/spotify.ts'

const mockGetAccessToken = vi.mocked(getAccessToken)
const mockSearchMusic = vi.mocked(searchMusic)
const mockGetMusicById = vi.mocked(getMusicById)

describe('music routes', () => {
  beforeEach(() => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', 'test-id')
    vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'test-secret')
    vi.clearAllMocks()
    mockGetAccessToken.mockResolvedValue({ ok: true, data: 'test-token' })
  })

  describe('GET /search', () => {
    it('returns 500 when credentials missing', async () => {
      vi.stubEnv('SPOTIFY_CLIENT_ID', '')
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

    it('returns error when token fetch fails', async () => {
      mockGetAccessToken.mockResolvedValue({
        ok: false,
        error: { kind: 'auth-error', message: 'Bad credentials', status: 401 },
      })
      const res = await musicApp.request('/search?q=test')
      expect(res.status).toBe(401)
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
