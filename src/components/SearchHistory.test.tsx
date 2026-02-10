import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchHistory from './SearchHistory'
import { useSearchHistory } from '../hooks/useSearchHistory'

vi.mock('../hooks/useSearchHistory')
const mockUseSearchHistory = vi.mocked(useSearchHistory)

const mockAddHistory = vi.fn()
const mockRemoveHistory = vi.fn()
const mockClearHistory = vi.fn()

function setupMock(history: string[] = []) {
  mockUseSearchHistory.mockReturnValue({
    history,
    addHistory: mockAddHistory,
    removeHistory: mockRemoveHistory,
    clearHistory: mockClearHistory,
  })
}

describe('SearchHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when history is empty', () => {
    setupMock([])
    const { container } = render(
      <SearchHistory category="book" onSearch={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders history keywords as chips', () => {
    setupMock(['村上春樹', '東野圭吾'])
    render(<SearchHistory category="book" onSearch={vi.fn()} />)

    expect(screen.getByText('村上春樹')).toBeInTheDocument()
    expect(screen.getByText('東野圭吾')).toBeInTheDocument()
  })

  it('displays header label', () => {
    setupMock(['村上春樹'])
    render(<SearchHistory category="book" onSearch={vi.fn()} />)

    expect(screen.getByText('最近の検索')).toBeInTheDocument()
  })

  it('displays clear all button', () => {
    setupMock(['村上春樹'])
    render(<SearchHistory category="book" onSearch={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: 'すべて削除' }),
    ).toBeInTheDocument()
  })

  it('calls onSearch when a keyword chip is clicked', async () => {
    const user = userEvent.setup()
    setupMock(['村上春樹', '東野圭吾'])
    const onSearch = vi.fn()
    render(<SearchHistory category="book" onSearch={onSearch} />)

    await user.click(screen.getByText('村上春樹'))
    expect(onSearch).toHaveBeenCalledWith('村上春樹')
  })

  it('calls removeHistory when chip delete is clicked', async () => {
    const user = userEvent.setup()
    setupMock(['村上春樹'])
    render(<SearchHistory category="book" onSearch={vi.fn()} />)

    const deleteButtons = screen.getAllByTestId('CancelIcon')
    await user.click(deleteButtons[0])
    expect(mockRemoveHistory).toHaveBeenCalledWith('村上春樹')
  })

  it('calls clearHistory when clear all button is clicked', async () => {
    const user = userEvent.setup()
    setupMock(['村上春樹'])
    render(<SearchHistory category="book" onSearch={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'すべて削除' }))
    expect(mockClearHistory).toHaveBeenCalled()
  })

  it('passes category to useSearchHistory hook', () => {
    setupMock([])
    render(<SearchHistory category="music" onSearch={vi.fn()} />)
    expect(mockUseSearchHistory).toHaveBeenCalledWith('music')
  })
})
