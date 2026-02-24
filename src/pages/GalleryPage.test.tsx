import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server'
import GalleryPage from './GalleryPage'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    },
  )
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const makeFakeShares = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    theme: `Theme ${i}`,
    bookId: `b${i}`,
    musicId: `m${i}`,
    movieId: `v${i}`,
    bookThumb: `https://example.com/book-${i}.jpg`,
    musicThumb: `https://example.com/music-${i}.jpg`,
    movieThumb: `https://example.com/movie-${i}.jpg`,
    createdAt: 1700000000 - i,
  }))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/gallery']}>
      <GalleryPage />
    </MemoryRouter>,
  )
}

describe('GalleryPage', () => {
  it('shows loading state initially', () => {
    server.use(
      http.get('/api/shares', () =>
        HttpResponse.json({
          ok: true,
          data: { items: makeFakeShares(3), total: 3 },
        }),
      ),
    )
    renderPage()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders gallery cards after loading', async () => {
    server.use(
      http.get('/api/shares', () =>
        HttpResponse.json({
          ok: true,
          data: { items: makeFakeShares(3), total: 3 },
        }),
      ),
    )
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Theme 0')).toBeInTheDocument()
    })
    expect(screen.getByText('Theme 1')).toBeInTheDocument()
    expect(screen.getByText('Theme 2')).toBeInTheDocument()
  })

  it('shows error message on failure', async () => {
    server.use(
      http.get('/api/shares', () => new HttpResponse(null, { status: 500 })),
    )
    renderPage()
    await waitFor(() => {
      expect(
        screen.getByText('ギャラリーの読み込みに失敗しました'),
      ).toBeInTheDocument()
    })
  })

  it('shows empty state when no shares exist', async () => {
    server.use(
      http.get('/api/shares', () =>
        HttpResponse.json({
          ok: true,
          data: { items: [], total: 0 },
        }),
      ),
    )
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('まだ投稿がないよ')).toBeInTheDocument()
    })
  })

  it('renders sentinel element for infinite scroll when hasMore', async () => {
    server.use(
      http.get('/api/shares', () =>
        HttpResponse.json({
          ok: true,
          data: { items: makeFakeShares(20), total: 25 },
        }),
      ),
    )

    renderPage()
    await waitFor(() => expect(screen.getByText('Theme 0')).toBeInTheDocument())

    // Sentinel for infinite scroll should be present (not a button)
    expect(
      screen.queryByRole('button', { name: /もっと見る/ }),
    ).not.toBeInTheDocument()
    expect(
      document.querySelector('[data-testid="gallery-sentinel"]'),
    ).toBeInTheDocument()
  })

  it('shows "ぜんぶ見たよ！" when all items loaded', async () => {
    server.use(
      http.get('/api/shares', () =>
        HttpResponse.json({
          ok: true,
          data: { items: makeFakeShares(3), total: 3 },
        }),
      ),
    )

    renderPage()
    await waitFor(() => expect(screen.getByText('Theme 0')).toBeInTheDocument())
    expect(screen.getByText('ぜんぶ見たよ！')).toBeInTheDocument()
  })

  it('has a link back to top page', async () => {
    server.use(
      http.get('/api/shares', () =>
        HttpResponse.json({
          ok: true,
          data: { items: [], total: 0 },
        }),
      ),
    )
    renderPage()
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /作品を選ぶ/ })
      expect(link).toHaveAttribute('href', '/')
    })
  })
})
