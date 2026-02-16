// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { registerRoutes } from './route-factory'
import type {
  Result,
  PaginatedResponse,
  SearchResultItem,
} from '../../types/common'

function createTestApp(
  overrides: Partial<Parameters<typeof registerRoutes>[1]> = {},
) {
  const app = new Hono()
  const defaultConfig = {
    name: 'test',
    getAuth: () => 'test-auth',
    authErrorMessage: 'Auth not configured',
    searchFn: vi.fn<
      [string, string, { startIndex: number; maxResults: number }],
      Promise<Result<PaginatedResponse<SearchResultItem>>>
    >(),
    getByIdFn: vi.fn<[string, string], Promise<Result<SearchResultItem>>>(),
    ...overrides,
  }
  registerRoutes(app, defaultConfig)
  return { app, config: defaultConfig }
}

describe('registerRoutes', () => {
  describe('GET /search', () => {
    it('returns 500 when auth is empty', async () => {
      const { app } = createTestApp({ getAuth: () => '' })
      const res = await app.request('/search?q=test')
      expect(res.status).toBe(500)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(false)
    })

    it('returns 400 for too long query', async () => {
      const { app } = createTestApp()
      const longQuery = 'a'.repeat(201)
      const res = await app.request(`/search?q=${longQuery}`)
      expect(res.status).toBe(400)
    })

    it('calls searchFn with correct params and returns result', async () => {
      const { app, config } = createTestApp()
      config.searchFn.mockResolvedValue({
        ok: true,
        data: {
          items: [
            {
              id: '1',
              category: 'book',
              title: 'Test',
              subtitle: 'Sub',
              thumbnailUrl: '',
              externalUrl: '',
            },
          ],
          totalItems: 1,
          startIndex: 0,
        },
      })
      const res = await app.request(
        '/search?q=hello&startIndex=5&maxResults=10',
      )
      expect(res.status).toBe(200)
      expect(config.searchFn).toHaveBeenCalledWith('test-auth', 'hello', {
        startIndex: 5,
        maxResults: 10,
      })
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(true)
    })

    it('uses default maxResults when not provided', async () => {
      const { app, config } = createTestApp()
      config.searchFn.mockResolvedValue({
        ok: true,
        data: { items: [], totalItems: 0, startIndex: 0 },
      })
      await app.request('/search?q=test')
      expect(config.searchFn).toHaveBeenCalledWith('test-auth', 'test', {
        startIndex: 0,
        maxResults: 20,
      })
    })

    it('clamps maxResults to configured range', async () => {
      const { app, config } = createTestApp({
        maxSearchResults: { min: 1, max: 10, default: 5 },
      })
      config.searchFn.mockResolvedValue({
        ok: true,
        data: { items: [], totalItems: 0, startIndex: 0 },
      })
      await app.request('/search?q=test&maxResults=100')
      expect(config.searchFn).toHaveBeenCalledWith('test-auth', 'test', {
        startIndex: 0,
        maxResults: 10,
      })
    })

    it('returns error status on service failure', async () => {
      const { app, config } = createTestApp()
      config.searchFn.mockResolvedValue({
        ok: false,
        error: { kind: 'rate-limited', message: 'Too many', status: 429 },
      })
      const res = await app.request('/search?q=test')
      expect(res.status).toBe(429)
    })

    it('returns 500 on unexpected error', async () => {
      const { app, config } = createTestApp()
      config.searchFn.mockRejectedValue(new Error('boom'))
      const res = await app.request('/search?q=test')
      expect(res.status).toBe(500)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(false)
    })
  })

  describe('GET /:id', () => {
    it('returns 500 when auth is empty', async () => {
      const { app } = createTestApp({ getAuth: () => '' })
      const res = await app.request('/item-1')
      expect(res.status).toBe(500)
    })

    it('returns item on success', async () => {
      const { app, config } = createTestApp()
      config.getByIdFn.mockResolvedValue({
        ok: true,
        data: {
          id: '1',
          category: 'book',
          title: 'Test',
          subtitle: 'Sub',
          thumbnailUrl: '',
          externalUrl: '',
        },
      })
      const res = await app.request('/item-1')
      expect(res.status).toBe(200)
      expect(config.getByIdFn).toHaveBeenCalledWith('test-auth', 'item-1')
    })

    it('returns error on service failure', async () => {
      const { app, config } = createTestApp()
      config.getByIdFn.mockResolvedValue({
        ok: false,
        error: { kind: 'not-found', message: 'Not found', status: 404 },
      })
      const res = await app.request('/item-1')
      expect(res.status).toBe(404)
    })

    it('returns 500 on unexpected error', async () => {
      const { app, config } = createTestApp()
      config.getByIdFn.mockRejectedValue(new Error('boom'))
      const res = await app.request('/item-1')
      expect(res.status).toBe(500)
    })
  })
})
