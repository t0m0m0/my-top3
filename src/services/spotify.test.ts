// @vitest-environment node
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
  vi,
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SEARCH_URL = 'https://api.spotify.com/v1/search'
const ALBUMS_URL = 'https://api.spotify.com/v1/albums'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function mockTokenResponse() {
  return { access_token: 'test-token', token_type: 'Bearer', expires_in: 3600 }
}

function mockAlbum(overrides: Record<string, unknown> = {}) {
  return {
    id: 'album-1',
    name: 'Test Album',
    artists: [{ id: 'a1', name: 'Test Artist' }],
    images: [
      { url: 'https://example.com/large.jpg', width: 640, height: 640 },
      { url: 'https://example.com/small.jpg', width: 64, height: 64 },
    ],
    external_urls: { spotify: 'https://open.spotify.com/album/album-1' },
    ...overrides,
  }
}

describe('getAccessToken', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns token on success', async () => {
    server.use(
      http.post(TOKEN_URL, () => HttpResponse.json(mockTokenResponse())),
    )
    const { getAccessToken } = await import('./spotify')
    const result = await getAccessToken('client-id', 'client-secret')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toBe('test-token')
  })
})

describe('searchMusic', () => {
  it('returns empty for blank query', async () => {
    const { searchMusic } = await import('./spotify')
    const result = await searchMusic('token', '  ')
    expect(result).toEqual({
      ok: true,
      data: { items: [], totalItems: 0, startIndex: 0 },
    })
  })

  it('maps Spotify response correctly', async () => {
    server.use(
      http.get(SEARCH_URL, () =>
        HttpResponse.json({
          albums: {
            href: '',
            items: [mockAlbum()],
            limit: 20,
            offset: 0,
            total: 1,
          },
        }),
      ),
    )
    const { searchMusic } = await import('./spotify')
    const result = await searchMusic('token', 'test')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].category).toBe('music')
      expect(result.data.items[0].title).toBe('Test Album')
      expect(result.data.items[0].subtitle).toBe('Test Artist')
    }
  })

  it('picks largest album image', async () => {
    server.use(
      http.get(SEARCH_URL, () =>
        HttpResponse.json({
          albums: {
            href: '',
            items: [mockAlbum()],
            limit: 20,
            offset: 0,
            total: 1,
          },
        }),
      ),
    )
    const { searchMusic } = await import('./spotify')
    const result = await searchMusic('token', 'test')
    if (result.ok) {
      expect(result.data.items[0].thumbnailUrl).toBe(
        'https://example.com/large.jpg',
      )
    }
  })
})

describe('getMusicById', () => {
  it('returns mapped result', async () => {
    server.use(
      http.get(`${ALBUMS_URL}/:id`, () => HttpResponse.json(mockAlbum())),
    )
    const { getMusicById } = await import('./spotify')
    const result = await getMusicById('token', 'album1')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe('album-1')
      expect(result.data.category).toBe('music')
    }
  })

  it('rejects invalid ID format', async () => {
    const { getMusicById } = await import('./spotify')
    const result = await getMusicById('token', '../bad!')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('not-found')
  })
})
