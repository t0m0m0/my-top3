import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server'
import GalleryPage from './GalleryPage'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const makeFakeShares = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    theme: `Theme ${i}`,
    bookId: `b${i}`,
    musicId: `m${i}`,
    movieId: `v${i}`,
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
      expect(screen.getByText('まだ作品がありません')).toBeInTheDocument()
    })
  })

  it('shows "more" button when hasMore and loads next page', async () => {
    const user = userEvent.setup()
    let callCount = 0
    server.use(
      http.get('/api/shares', () => {
        callCount++
        if (callCount === 1) {
          return HttpResponse.json({
            ok: true,
            data: { items: makeFakeShares(20), total: 25 },
          })
        }
        return HttpResponse.json({
          ok: true,
          data: {
            items: makeFakeShares(5).map((s) => ({
              ...s,
              id: `p2-${s.id}`,
              theme: `Page2 ${s.theme}`,
            })),
            total: 25,
          },
        })
      }),
    )

    renderPage()
    await waitFor(() => expect(screen.getByText('Theme 0')).toBeInTheDocument())

    const moreBtn = screen.getByRole('button', { name: /もっと見る/ })
    expect(moreBtn).toBeInTheDocument()

    await user.click(moreBtn)
    await waitFor(() =>
      expect(screen.getByText('Page2 Theme 0')).toBeInTheDocument(),
    )
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
      const link = screen.getByRole('link', { name: /Top3を作成/ })
      expect(link).toHaveAttribute('href', '/')
    })
  })
})
