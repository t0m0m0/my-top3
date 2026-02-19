import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../test/msw/server'
import { render } from '../test/test-utils'
import SearchPage from './SearchPage'

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function makeItem(
  category: 'book' | 'music' | 'movie',
  id: string,
  title: string,
  subtitle: string,
) {
  return {
    id,
    category,
    title,
    subtitle,
    thumbnailUrl: `https://example.com/${id}.jpg`,
    externalUrl: `https://example.com/${id}`,
  }
}

describe('SearchPage integration (no mocked hooks)', () => {
  it('searches for a book and displays results', async () => {
    const user = userEvent.setup()

    server.use(
      http.get('/api/books/search', ({ request }) => {
        const url = new URL(request.url)
        const q = url.searchParams.get('q') ?? ''
        if (!q) {
          return HttpResponse.json({
            ok: true,
            data: { items: [], totalItems: 0, startIndex: 0 },
          })
        }
        return HttpResponse.json({
          ok: true,
          data: {
            items: [
              makeItem('book', 'book-1', `Book: ${q}`, 'Author A'),
              makeItem('book', 'book-2', `Book2: ${q}`, 'Author B'),
            ],
            totalItems: 2,
            startIndex: 0,
          },
        })
      }),
    )

    render(<SearchPage />)

    const input = screen.getByPlaceholderText('作品名やアーティスト名で検索')
    await user.type(input, '村上春樹')

    // Wait for debounce + API response
    await waitFor(
      () => {
        expect(screen.getByText('Book: 村上春樹')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
    expect(screen.getByText('Book2: 村上春樹')).toBeInTheDocument()
  })

  it('switches tabs and searches in each category', async () => {
    const user = userEvent.setup()

    server.use(
      http.get('/api/books/search', ({ request }) => {
        const url = new URL(request.url)
        const q = url.searchParams.get('q') ?? ''
        return HttpResponse.json({
          ok: true,
          data: {
            items: q ? [makeItem('book', 'b1', '本の結果', '著者')] : [],
            totalItems: q ? 1 : 0,
            startIndex: 0,
          },
        })
      }),
      http.get('/api/music/search', ({ request }) => {
        const url = new URL(request.url)
        const q = url.searchParams.get('q') ?? ''
        return HttpResponse.json({
          ok: true,
          data: {
            items: q
              ? [makeItem('music', 'm1', '音楽の結果', 'アーティスト')]
              : [],
            totalItems: q ? 1 : 0,
            startIndex: 0,
          },
        })
      }),
    )

    render(<SearchPage />)

    const input = screen.getByPlaceholderText('作品名やアーティスト名で検索')

    // Search in Book tab
    await user.type(input, 'test')
    await waitFor(
      () => {
        expect(screen.getByText('本の結果')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    // Switch to Music tab
    await user.click(screen.getByRole('tab', { name: /Music/ }))

    // Input should be empty for the new tab
    expect(input).toHaveValue('')

    await user.type(input, 'queen')
    await waitFor(
      () => {
        expect(screen.getByText('音楽の結果')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('selects a work and shows it in the selection area', async () => {
    const user = userEvent.setup()

    server.use(
      http.get('/api/books/search', ({ request }) => {
        const url = new URL(request.url)
        const q = url.searchParams.get('q') ?? ''
        if (!q) {
          return HttpResponse.json({
            ok: true,
            data: { items: [], totalItems: 0, startIndex: 0 },
          })
        }
        return HttpResponse.json({
          ok: true,
          data: {
            items: [makeItem('book', 'b-sel', '選択テスト本', '著者X')],
            totalItems: 1,
            startIndex: 0,
          },
        })
      }),
    )

    render(<SearchPage />)

    const input = screen.getByPlaceholderText('作品名やアーティスト名で検索')
    await user.type(input, 'テスト')

    await waitFor(
      () => {
        expect(screen.getByText('選択テスト本')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    // Click the select button
    await user.click(screen.getByRole('button', { name: '#1に選ぶ' }))

    // The card should now show "選択済み"
    await waitFor(() => {
      expect(screen.getByText('選択済み')).toBeInTheDocument()
    })

    // The selection area should show the selected work title
    const selectionArea = screen.getByTestId('selection-area-wrapper')
    expect(selectionArea).toHaveTextContent('選択テスト本')
  })

  it('shows error message on API failure', async () => {
    const user = userEvent.setup()

    server.use(
      http.get('/api/books/search', () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    render(<SearchPage />)

    const input = screen.getByPlaceholderText('作品名やアーティスト名で検索')
    await user.type(input, 'error test')

    await waitFor(
      () => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })
})
