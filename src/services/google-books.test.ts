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

  it('searches by both title and author fields', async () => {
    const capturedUrls: string[] = []
    server.use(
      http.get(BOOKS_API, ({ request }) => {
        capturedUrls.push(request.url)
        return HttpResponse.json(mockSearchResponse([mockVolume()], 1))
      }),
    )
    await searchBooks('key', 'test')
    expect(capturedUrls).toHaveLength(2)
    const queries = capturedUrls.map(
      (u) => new URL(u).searchParams.get('q') ?? '',
    )
    expect(queries).toContain('intitle:test')
    expect(queries).toContain('inauthor:test')
  })

  it('deduplicates results from title and author searches', async () => {
    const vol1 = mockVolume()
    const vol2 = mockVolume({ title: 'Another Book' })
    // vol2 has same id as vol1 by default, so make it unique
    const vol2WithId = { ...vol2, id: 'vol-2' }
    let callCount = 0
    server.use(
      http.get(BOOKS_API, () => {
        callCount++
        if (callCount === 1) {
          // intitle returns vol1 and vol2WithId
          return HttpResponse.json(mockSearchResponse([vol1, vol2WithId], 2))
        }
        // inauthor returns vol1 (duplicate)
        return HttpResponse.json(mockSearchResponse([vol1], 1))
      }),
    )
    const result = await searchBooks('key', 'test')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.items).toHaveLength(2)
      const ids = result.data.items.map((i) => i.id)
      expect(ids).toEqual(['vol-1', 'vol-2'])
    }
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
        'https://www.amazon.co.jp/dp/1234567890?tag=yuaioiaiu-22',
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

  it('returns validation error when items contain invalid entries', async () => {
    server.use(
      http.get(BOOKS_API, () =>
        HttpResponse.json(mockSearchResponse([{ selfLink: 'link' }], 1)),
      ),
    )
    const result = await searchBooks('key', 'test')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toMatch(/id/)
    }
  })

  it('returns validation error when items lack volumeInfo', async () => {
    server.use(
      http.get(BOOKS_API, () =>
        HttpResponse.json(mockSearchResponse([{ id: 'vol-1' }], 1)),
      ),
    )
    const result = await searchBooks('key', 'test')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toMatch(/volumeInfo/)
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
