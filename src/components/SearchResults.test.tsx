import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SearchResults from './SearchResults'
import { createSearchResultItem } from '../test/fixtures'

// Mock IntersectionObserver for jsdom
beforeEach(() => {
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })
  vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
})

describe('SearchResults', () => {
  const defaultProps = {
    results: [],
    isLoading: false,
    hasMore: false,
    onLoadMore: vi.fn(),
    onSelect: vi.fn(),
    query: '',
  }

  it('shows prompt when query is empty', () => {
    render(<SearchResults {...defaultProps} query="" />)
    expect(screen.getByText('作品名を検索してください')).toBeInTheDocument()
  })

  it('shows no results message', () => {
    render(<SearchResults {...defaultProps} query="test" />)
    expect(
      screen.getByText('検索結果が見つかりませんでした'),
    ).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(
      <SearchResults {...defaultProps} query="test" error="エラーが発生" />,
    )
    expect(screen.getByText('エラーが発生')).toBeInTheDocument()
  })

  it('renders result cards', () => {
    const items = [
      createSearchResultItem({ id: '1', title: 'Item 1' }),
      createSearchResultItem({ id: '2', title: 'Item 2' }),
    ]
    render(<SearchResults {...defaultProps} query="test" results={items} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('shows loading spinner', () => {
    render(<SearchResults {...defaultProps} query="test" isLoading={true} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows all loaded message', () => {
    const items = [createSearchResultItem({ id: '1' })]
    render(
      <SearchResults
        {...defaultProps}
        query="test"
        results={items}
        hasMore={false}
      />,
    )
    expect(screen.getByText('全件表示しました')).toBeInTheDocument()
  })

  it('uses responsive grid layout (1-col mobile, 2-col sm+)', () => {
    const items = [createSearchResultItem({ id: '1', title: 'Item 1' })]
    const { container } = render(
      <SearchResults {...defaultProps} query="test" results={items} />,
    )
    const grid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2')
    expect(grid).toBeInTheDocument()
  })
})
