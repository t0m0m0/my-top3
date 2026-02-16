// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { searchBooks, getBookById } from './google-books'

const BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function mockSearchResponse(items: unknown[] = [], totalItems = 0) {
  return { kind: 'books#volumes', totalItems, items }
}

function mockVolume(overrides: Record<string, unknown> = {}) {
  return {
    id: 'vol-1',
    selfLink: `${BOOKS_API}/vol-1`,
    volumeInfo: {
      title: 'Test Book',
      authors: ['Test Author'],
      imageLinks: { thumbnail: 'http://example.com/thumb.jpg' },
      industryIdentifiers: [{ type: 'ISBN_10', identifier: '1234567890' }],
      ...overrides,
    },
  }
}

describe('searchBooks', () => {
  it('returns empty for blank query', async () => {
    const result = await searchBooks('key', '  ')
    expect(result).toEqual({
      ok: true,
      data: { items: [], totalItems: 0, startIndex: 0 },
    })
  })

  it('maps response to SearchResultItem array', async () => {
    server.use(
      http.get(BOOKS_API, () =>
        HttpResponse.json(mockSearchResponse([mockVolume()], 1)),
      ),
    )
    const result = await searchBooks('key', 'test')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].category).toBe('book')
      expect(result.data.items[0].title).toBe('Test Book')
    }
  })

  it('sends langRestrict=ja parameter', async () => {
    let capturedUrl = ''
    server.use(
      http.get(BOOKS_API, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json(mockSearchResponse([mockVolume()], 1))
      }),
    )
    await searchBooks('key', 'test')
    const url = new URL(capturedUrl)
    expect(url.searchParams.get('langRestrict')).toBe('ja')
  })

  it('upgrades HTTP thumbnails to HTTPS', async () => {
    server.use(
      http.get(BOOKS_API, () =>
        HttpResponse.json(mockSearchResponse([mockVolume()], 1)),
      ),
    )
    const result = await searchBooks('key', 'test')
    if (result.ok) {
      expect(result.data.items[0].thumbnailUrl).toMatch(/^https:\/\//)
    }
  })

  it('builds Amazon URL from ISBN_10', async () => {
    server.use(
      http.get(BOOKS_API, () =>
        HttpResponse.json(mockSearchResponse([mockVolume()], 1)),
      ),
    )
    const result = await searchBooks('key', 'test')
    if (result.ok) {
      expect(result.data.items[0].externalUrl).toBe(
        'https://www.amazon.co.jp/dp/1234567890',
      )
    }
  })

  it('falls back to Google Books URL when no ISBN', async () => {
    server.use(
      http.get(BOOKS_API, () =>
        HttpResponse.json(
          mockSearchResponse(
            [mockVolume({ industryIdentifiers: undefined })],
            1,
          ),
        ),
      ),
    )
    const result = await searchBooks('key', 'test')
    if (result.ok) {
      expect(result.data.items[0].externalUrl).toContain('books.google.co.jp')
    }
  })

  it('handles missing thumbnails', async () => {
    server.use(
      http.get(BOOKS_API, () =>
        HttpResponse.json(
          mockSearchResponse([mockVolume({ imageLinks: undefined })], 1),
        ),
      ),
    )
    const result = await searchBooks('key', 'test')
    if (result.ok) {
      expect(result.data.items[0].thumbnailUrl).toBe('')
    }
  })
})

describe('getBookById', () => {
  it('returns mapped result', async () => {
    server.use(
      http.get(`${BOOKS_API}/:id`, () => HttpResponse.json(mockVolume())),
    )
    const result = await getBookById('key', 'vol-1')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe('vol-1')
      expect(result.data.category).toBe('book')
    }
  })

  it('rejects invalid volume ID', async () => {
    const result = await getBookById('key', '../bad')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.kind).toBe('not-found')
    }
  })
})
