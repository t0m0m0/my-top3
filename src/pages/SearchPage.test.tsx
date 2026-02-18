import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, act } from '@testing-library/react'
import { render } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import SearchPage from './SearchPage'

vi.mock('../hooks/useSearch', () => ({
  useSearch: () => ({
    results: [],
    isLoading: false,
    error: null,
    loadMore: vi.fn(),
    hasMore: false,
  }),
}))

const mockAddHistory = vi.fn()
vi.mock('../hooks/useSearchHistory', () => ({
  useSearchHistory: () => ({
    history: ['過去の検索'],
    addHistory: mockAddHistory,
    removeHistory: vi.fn(),
    clearHistory: vi.fn(),
  }),
}))

describe('SearchPage - search history integration', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows search history when search bar is empty', () => {
    render(<SearchPage />)
    expect(screen.getByText('過去の検索')).toBeInTheDocument()
  })

  it('hides search history when search bar has text', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchPage />)

    expect(screen.getByText('過去の検索')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('作品名やアーティスト名で検索')
    await user.type(input, 'test')

    expect(screen.queryByText('過去の検索')).not.toBeInTheDocument()
  })

  it('populates search bar when history keyword is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchPage />)

    await user.click(screen.getByText('過去の検索'))

    const input = screen.getByPlaceholderText('作品名やアーティスト名で検索')
    expect(input).toHaveValue('過去の検索')
  })

  it('saves debounced query to history', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<SearchPage />)

    const input = screen.getByPlaceholderText('作品名やアーティスト名で検索')
    await user.type(input, '村上春樹')

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(mockAddHistory).toHaveBeenCalledWith('村上春樹')
  })

  it('does not save empty query to history', () => {
    render(<SearchPage />)

    vi.advanceTimersByTime(300)

    expect(mockAddHistory).not.toHaveBeenCalled()
  })
})

describe('SearchPage - mobile layout: sticky tab & search bar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('selection area should not be sticky on mobile', () => {
    render(<SearchPage />)
    const selectionHeading = screen.getByText('選択中の作品')
    // SelectionArea の親カードが sticky でないことを確認
    const selectionCard = selectionHeading.closest(
      '[data-testid="selection-area-wrapper"]',
    )
    expect(selectionCard).toBeInTheDocument()
    // クラス名をスペースで分割し、単独の 'sticky' がないことを確認
    const classes = selectionCard?.className.split(/\s+/) ?? []
    expect(classes).not.toContain('sticky')
    // sm:sticky はデスクトップ用なので含まれているべき
    expect(selectionCard?.className).toContain('sm:sticky')
  })

  it('tab and search bar should be sticky on mobile', () => {
    render(<SearchPage />)
    const stickySearchHeader = screen.getByTestId('search-sticky-header')
    expect(stickySearchHeader).toBeInTheDocument()
    // モバイルでは sticky、デスクトップでは static
    expect(stickySearchHeader.className).toMatch(/(?<![\w-])sticky(?![\w-])/)
    expect(stickySearchHeader.className).toContain('sm:static')
  })
})
