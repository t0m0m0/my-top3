// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { booksApp } from './books'

vi.mock('../../services/google-books.ts', () => ({
  searchBooks: vi.fn(),
  getBookById: vi.fn(),
}))

import { searchBooks, getBookById } from '../../services/google-books.ts'

const mockSearchBooks = vi.mocked(searchBooks)
const mockGetBookById = vi.mocked(getBookById)

describe('books routes', () => {
  beforeEach(() => {
    vi.stubEnv('GOOGLE_BOOKS_API_KEY', 'test-key')
    vi.clearAllMocks()
  })

  describe('GET /search', () => {
    it('returns 500 when no API key', async () => {
      vi.stubEnv('GOOGLE_BOOKS_API_KEY', '')
      const res = await booksApp.request('/search?q=test')
      expect(res.status).toBe(500)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(false)
    })

    it('returns results on success', async () => {
      mockSearchBooks.mockResolvedValue({
        ok: true,
        data: {
          items: [
            {
              id: 'b1',
              category: 'book',
              title: 'Test',
              subtitle: 'Author',
              thumbnailUrl: '',
              externalUrl: '',
            },
          ],
          totalItems: 1,
          startIndex: 0,
        },
      })
      const res = await booksApp.request('/search?q=test')
      expect(res.status).toBe(200)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(true)
      expect((body.data as Record<string, unknown>).items).toHaveLength(1)
    })

    it('returns error status on service failure', async () => {
      mockSearchBooks.mockResolvedValue({
        ok: false,
        error: {
          kind: 'rate-limited',
          message: 'Too many requests',
          status: 429,
        },
      })
      const res = await booksApp.request('/search?q=test')
      expect(res.status).toBe(429)
    })

    it('clamps maxResults between 1-40', async () => {
      mockSearchBooks.mockResolvedValue({
        ok: true,
        data: { items: [], totalItems: 0, startIndex: 0 },
      })
      await booksApp.request('/search?q=test&maxResults=100')
      expect(mockSearchBooks).toHaveBeenCalledWith(
        'test-key',
        'test',
        expect.objectContaining({ maxResults: 40 }),
      )
    })
  })

  describe('GET /:id', () => {
    it('returns item on success', async () => {
      mockGetBookById.mockResolvedValue({
        ok: true,
        data: {
          id: 'b1',
          category: 'book',
          title: 'Test',
          subtitle: 'Author',
          thumbnailUrl: '',
          externalUrl: '',
        },
      })
      const res = await booksApp.request('/vol-1')
      expect(res.status).toBe(200)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.ok).toBe(true)
    })

    it('returns error on service failure', async () => {
      mockGetBookById.mockResolvedValue({
        ok: false,
        error: { kind: 'not-found', message: 'Not found', status: 404 },
      })
      const res = await booksApp.request('/vol-1')
      expect(res.status).toBe(404)
    })
  })
})
