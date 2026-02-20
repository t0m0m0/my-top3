// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(async () => {
  server.resetHandlers()
  const { _clearCaches } = await import('./lastfm')
  _clearCaches()
})
afterAll(() => server.close())

function mockAlbumSearchResponse(
  albums: Record<string, unknown>[],
  total = '1',
) {
  return {
    results: {
      'opensearch:totalResults': total,
      albummatches: {
        album: albums,
      },
    },
  }
}

function mockAlbum(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Test Album',
    artist: 'Test Artist',
    mbid: 'mbid-1234',
    url: 'https://www.last.fm/music/Test+Artist/Test+Album',
    image: [
      {
        '#text': 'https://lastfm.freetls.fastly.net/i/u/34s/small.jpg',
        size: 'small',
      },
      {
        '#text': 'https://lastfm.freetls.fastly.net/i/u/64s/medium.jpg',
        size: 'medium',
      },
      {
        '#text': 'https://lastfm.freetls.fastly.net/i/u/174s/large.jpg',
        size: 'large',
      },
      {
        '#text': 'https://lastfm.freetls.fastly.net/i/u/300x300/extralarge.jpg',
        size: 'extralarge',
      },
    ],
    ...overrides,
  }
}

function mockAlbumInfoResponse(overrides: Record<string, unknown> = {}) {
  return {
    album: {
      name: 'Test Album',
      artist: 'Test Artist',
      mbid: 'mbid-1234',
      url: 'https://www.last.fm/music/Test+Artist/Test+Album',
      image: [
        {
          '#text': 'https://lastfm.freetls.fastly.net/i/u/34s/small.jpg',
          size: 'small',
        },
        {
          '#text': 'https://lastfm.freetls.fastly.net/i/u/64s/medium.jpg',
          size: 'medium',
        },
        {
          '#text': 'https://lastfm.freetls.fastly.net/i/u/174s/large.jpg',
          size: 'large',
        },
        {
          '#text':
            'https://lastfm.freetls.fastly.net/i/u/300x300/extralarge.jpg',
          size: 'extralarge',
        },
      ],
      ...overrides,
    },
  }
}

describe('searchMusic', () => {
  it('returns empty for blank query', async () => {
    const { searchMusic } = await import('./lastfm')
    const result = await searchMusic('api-key', '  ')
    expect(result).toEqual({
      ok: true,
      data: { items: [], totalItems: 0, startIndex: 0 },
    })
  })

  it('maps Last.fm response correctly', async () => {
    server.use(
      http.get(LASTFM_BASE, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('method')).toBe('album.search')
        expect(url.searchParams.get('api_key')).toBe('api-key')
        expect(url.searchParams.get('format')).toBe('json')
        expect(url.searchParams.get('album')).toBe('test')
        return HttpResponse.json(mockAlbumSearchResponse([mockAlbum()]))
      }),
    )
    const { searchMusic } = await import('./lastfm')
    const result = await searchMusic('api-key', 'test')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].category).toBe('music')
      expect(result.data.items[0].title).toBe('Test Album')
      expect(result.data.items[0].subtitle).toBe('Test Artist')
      expect(result.data.items[0].externalUrl).toBe(
        'https://www.last.fm/music/Test+Artist/Test+Album',
      )
    }
  })

  it('picks extralarge image', async () => {
    server.use(
      http.get(LASTFM_BASE, () =>
        HttpResponse.json(mockAlbumSearchResponse([mockAlbum()])),
      ),
    )
    const { searchMusic } = await import('./lastfm')
    const result = await searchMusic('api-key', 'test')
    if (result.ok) {
      expect(result.data.items[0].thumbnailUrl).toBe(
        'https://lastfm.freetls.fastly.net/i/u/300x300/extralarge.jpg',
      )
    }
  })

  it('passes pagination params', async () => {
    server.use(
      http.get(LASTFM_BASE, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('page')).toBe('3')
        expect(url.searchParams.get('limit')).toBe('5')
        return HttpResponse.json(mockAlbumSearchResponse([mockAlbum()], '100'))
      }),
    )
    const { searchMusic } = await import('./lastfm')
    const result = await searchMusic('api-key', 'test', {
      startIndex: 10,
      maxResults: 5,
    })
    if (result.ok) {
      expect(result.data.startIndex).toBe(10)
      expect(result.data.totalItems).toBe(100)
    }
  })

  it('uses mbid as id, falls back to name+artist', async () => {
    server.use(
      http.get(LASTFM_BASE, () =>
        HttpResponse.json(mockAlbumSearchResponse([mockAlbum({ mbid: '' })])),
      ),
    )
    const { searchMusic } = await import('./lastfm')
    const result = await searchMusic('api-key', 'test')
    if (result.ok) {
      // When mbid is empty, should use a generated id
      expect(result.data.items[0].id).not.toBe('')
    }
  })

  it('returns validation error when album items lack name', async () => {
    server.use(
      http.get(LASTFM_BASE, () =>
        HttpResponse.json(
          mockAlbumSearchResponse([
            { artist: 'Test', mbid: '', url: '', image: [] },
          ]),
        ),
      ),
    )
    const { searchMusic } = await import('./lastfm')
    const result = await searchMusic('api-key', 'test')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toMatch(/name/)
    }
  })

  it('filters out albums with no images', async () => {
    server.use(
      http.get(LASTFM_BASE, () =>
        HttpResponse.json(
          mockAlbumSearchResponse(
            [
              mockAlbum(),
              mockAlbum({
                name: 'No Image Album',
                image: [
                  { '#text': '', size: 'small' },
                  { '#text': '', size: 'medium' },
                  { '#text': '', size: 'large' },
                  { '#text': '', size: 'extralarge' },
                ],
              }),
            ],
            '2',
          ),
        ),
      ),
    )
    const { searchMusic } = await import('./lastfm')
    const result = await searchMusic('api-key', 'test')
    if (result.ok) {
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].title).toBe('Test Album')
    }
  })
})

describe('getMusicById', () => {
  it('returns mapped result by mbid', async () => {
    server.use(
      http.get(LASTFM_BASE, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('method')).toBe('album.getinfo')
        expect(url.searchParams.get('mbid')).toBe('mbid-1234')
        return HttpResponse.json(mockAlbumInfoResponse())
      }),
    )
    const { getMusicById } = await import('./lastfm')
    const result = await getMusicById('api-key', 'mbid-1234')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe('mbid-1234')
      expect(result.data.category).toBe('music')
      expect(result.data.title).toBe('Test Album')
      expect(result.data.subtitle).toBe('Test Artist')
    }
  })

  it('returns not-found for empty id', async () => {
    const { getMusicById } = await import('./lastfm')
    const result = await getMusicById('api-key', '')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('not-found')
  })

  it('handles Last.fm error response', async () => {
    server.use(
      http.get(LASTFM_BASE, () =>
        HttpResponse.json({ error: 6, message: 'Album not found' }),
      ),
    )
    const { getMusicById } = await import('./lastfm')
    const result = await getMusicById('api-key', 'invalid-mbid')
    expect(result.ok).toBe(false)
  })

  it('generates URL-safe fallback id (no =, +, /)', async () => {
    const { encodeFallbackId } = await import('./lastfm')
    const id = encodeFallbackId('summer', 'Raph')
    expect(id).toMatch(/^lastfm-[\w-]+$/)
    expect(id).not.toContain('=')
    expect(id).not.toContain('+')
    expect(id).not.toContain('/')
  })

  it('resolves fallback id (lastfm- prefix) using artist+album params', async () => {
    server.use(
      http.get(LASTFM_BASE, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('method')).toBe('album.getinfo')
        expect(url.searchParams.get('artist')).toBe('Raph')
        expect(url.searchParams.get('album')).toBe('summer')
        expect(url.searchParams.has('mbid')).toBe(false)
        return HttpResponse.json(
          mockAlbumInfoResponse({ name: 'summer', artist: 'Raph' }),
        )
      }),
    )
    const { getMusicById, encodeFallbackId } = await import('./lastfm')
    const fallbackId = encodeFallbackId('summer', 'Raph')
    const result = await getMusicById('api-key', fallbackId)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.title).toBe('summer')
      expect(result.data.subtitle).toBe('Raph')
    }
  })

  it('search uses encodeFallbackId for albums without mbid', async () => {
    server.use(
      http.get(LASTFM_BASE, () =>
        HttpResponse.json(
          mockAlbumSearchResponse([
            mockAlbum({ mbid: '', name: 'summer', artist: 'Raph' }),
          ]),
        ),
      ),
    )
    const { searchMusic, encodeFallbackId } = await import('./lastfm')
    const result = await searchMusic('api-key', 'test')
    if (result.ok && result.data.items.length > 0) {
      const expectedId = encodeFallbackId('summer', 'Raph')
      expect(result.data.items[0].id).toBe(expectedId)
      expect(result.data.items[0].id).toMatch(/^lastfm-/)
    }
  })
})
