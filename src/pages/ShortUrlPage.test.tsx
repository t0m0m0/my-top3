import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test/test-utils'
import ShortUrlPage from './ShortUrlPage'

// Mock react-router-dom useParams
const mockUseParams = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => mockUseParams() }
})

// Mock Top3Content to avoid deep rendering issues in tests
vi.mock('../components/Top3Content', () => ({
  default: ({
    params,
    existingShareId,
    readOnly,
  }: {
    params: { theme: string; bookId: string; musicId: string; movieId: string }
    existingShareId?: string
    readOnly?: boolean
  }) => (
    <div data-testid="top3-content">
      <span>{params.theme}</span>
      <span>{params.bookId}</span>
      {existingShareId && (
        <span data-testid="existing-share-id">{existingShareId}</span>
      )}
      {readOnly && <span data-testid="read-only">readOnly</span>}
    </div>
  ),
}))

describe('ShortUrlPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state while fetching share data', () => {
    mockUseParams.mockReturnValue({ id: 'abc123' })
    globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {})) // never resolves
    render(<ShortUrlPage />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows error when share not found', async () => {
    mockUseParams.mockReturnValue({ id: 'notfound' })
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ ok: false, error: { message: 'Not found' } }),
    })
    render(<ShortUrlPage />)
    await waitFor(() => {
      expect(screen.getByText(/共有リンクが見つかりません/)).toBeInTheDocument()
    })
  })

  it('renders Top3Content when share data is loaded', async () => {
    mockUseParams.mockReturnValue({ id: 'abc123' })
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          theme: 'テスト',
          bookId: 'b1',
          musicId: 'm1',
          movieId: 'mv1',
        },
      }),
    })
    render(<ShortUrlPage />)
    await waitFor(() => {
      expect(screen.getByTestId('top3-content')).toBeInTheDocument()
    })
    expect(screen.getByText('テスト')).toBeInTheDocument()
    expect(screen.getByText('b1')).toBeInTheDocument()
  })

  it('passes existingShareId to Top3Content', async () => {
    mockUseParams.mockReturnValue({ id: 'xyz789' })
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          theme: 'テスト',
          bookId: 'b1',
          musicId: 'm1',
          movieId: 'mv1',
        },
      }),
    })
    render(<ShortUrlPage />)
    await waitFor(() => {
      expect(screen.getByTestId('existing-share-id')).toHaveTextContent(
        'xyz789',
      )
    })
  })

  it('calls the correct API endpoint', async () => {
    mockUseParams.mockReturnValue({ id: 'xyz789' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: { theme: '', bookId: 'b1', musicId: '', movieId: '' },
      }),
    })
    globalThis.fetch = fetchMock
    render(<ShortUrlPage />)
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/shares/xyz789')
    })
  })
})

it('passes readOnly to Top3Content', async () => {
  mockUseParams.mockReturnValue({ id: 'abc123' })
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      ok: true,
      data: {
        theme: 'テスト',
        bookId: 'b1',
        musicId: 'm1',
        movieId: 'mv1',
      },
    }),
  })
  render(<ShortUrlPage />)
  await waitFor(() => {
    expect(screen.getByTestId('read-only')).toBeInTheDocument()
  })
})
