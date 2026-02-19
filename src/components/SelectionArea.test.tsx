import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import SelectionArea from './SelectionArea'
import { createSearchResultItem } from '../test/fixtures'
import type { SelectionContextValue } from '../contexts/selection-context-value'

// ---------- mock useSelection ----------
const defaultContext: SelectionContextValue = {
  selection: { book: null, music: null, movie: null },
  selectItem: vi.fn(),
  deselectItem: vi.fn(),
  clearAll: vi.fn(),
  isComplete: false,
}

let mockContext = { ...defaultContext }

vi.mock('../hooks/useSelection', () => ({
  useSelection: () => mockContext,
}))

beforeEach(() => {
  mockContext = {
    ...defaultContext,
    selectItem: vi.fn(),
    deselectItem: vi.fn(),
    clearAll: vi.fn(),
  }
})

// ---------- helpers ----------
const bookItem = createSearchResultItem({
  id: 'book-1',
  category: 'book',
  title: 'Test Book',
  subtitle: 'Author A',
})
const musicItem = createSearchResultItem({
  id: 'music-1',
  category: 'music',
  title: 'Test Song',
  subtitle: 'Artist B',
})
const movieItem = createSearchResultItem({
  id: 'movie-1',
  category: 'movie',
  title: 'Test Movie',
  subtitle: 'Director C',
})

// ====================================
// 基本表示
// ====================================
describe('SelectionArea — 基本表示', () => {
  it('未選択時に3つの空スロットを表示する', () => {
    render(<SelectionArea theme="" />)
    // Desktop 3 + Mobile 3 = 6
    const slots = screen.getAllByText('未選択')
    expect(slots.length).toBeGreaterThanOrEqual(3)
  })

  it('未完了時は「Top3を作成」ボタンを表示しない', () => {
    render(<SelectionArea theme="" />)
    expect(screen.queryByText('Top3を作成')).not.toBeInTheDocument()
  })

  it('デスクトップ用の横並びスロットコンテナがある', () => {
    const { container } = render(<SelectionArea theme="" />)
    const slotContainer = container.querySelector('.flex.gap-2')
    expect(slotContainer).toBeInTheDocument()
  })
})

// ====================================
// スロットクリック
// ====================================
describe('SelectionArea — スロットクリック', () => {
  it('空スロットクリックで onSlotClick が呼ばれる', async () => {
    const user = userEvent.setup()
    const onSlotClick = vi.fn()
    render(<SelectionArea theme="" onSlotClick={onSlotClick} />)
    const bookSlots = screen.getAllByRole('button', { name: /Book.*選ぶ/ })
    await user.click(bookSlots[0])
    expect(onSlotClick).toHaveBeenCalledWith('book')
  })

  it('選択済みスロットの×ボタンで deselectItem が呼ばれる', async () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: null, movie: null },
    }
    const user = userEvent.setup()
    render(<SelectionArea theme="" />)
    const removeButtons = screen.getAllByRole('button', {
      name: /Bookの選択を解除/,
    })
    await user.click(removeButtons[0])
    expect(mockContext.deselectItem).toHaveBeenCalledWith('book')
  })
})

// ====================================
// モバイル折りたたみ
// ====================================
describe('SelectionArea — モバイル折りたたみ', () => {
  it('未選択時に折りたたみヘッダーと進捗ドットを表示する', () => {
    render(<SelectionArea theme="" />)
    expect(screen.getByText('選択中 0/3')).toBeInTheDocument()
    expect(screen.getByText('作品を選ぼう')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /選択エリアを展開/ }),
    ).toBeInTheDocument()
  })

  it('ヘッダークリックで展開・折りたたみをトグルできる', async () => {
    const user = userEvent.setup()
    render(<SelectionArea theme="" />)
    const toggle = screen.getByRole('button', { name: /選択エリアを展開/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('選択数 1 のとき「あと2つ選ぼう」と表示する', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: null, movie: null },
    }
    render(<SelectionArea theme="" />)
    expect(screen.getByText('選択中 1/3')).toBeInTheDocument()
    // ヘッダー + フローティングボタン両方に表示される
    const labels = screen.getAllByText(/あと2つ選ぼう/)
    expect(labels.length).toBeGreaterThanOrEqual(1)
  })

  it('選択数 2 のとき「あと1つ選ぼう」と表示する', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: musicItem, movie: null },
    }
    render(<SelectionArea theme="" />)
    expect(screen.getByText('選択中 2/3')).toBeInTheDocument()
    const labels = screen.getAllByText(/あと1つ選ぼう/)
    expect(labels.length).toBeGreaterThanOrEqual(1)
  })

  it('3つ揃うと「準備完了！」と表示する', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: musicItem, movie: movieItem },
      isComplete: true,
    }
    render(<SelectionArea theme="" />)
    expect(screen.getByText('選択中 3/3')).toBeInTheDocument()
    expect(screen.getByText('準備完了！')).toBeInTheDocument()
  })

  it('選択があるとき自動で折りたたまれる（expanded=false）', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: null, movie: null },
    }
    render(<SelectionArea theme="" />)
    const toggle = screen.getByRole('button', { name: /選択エリアを展開/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})

// ====================================
// 段階的フローティングボタン
// ====================================
describe('SelectionArea — フローティングボタン', () => {
  it('未選択時はフローティングボタンを表示しない', () => {
    render(<SelectionArea theme="" />)
    expect(screen.queryByText(/あと.*つ選ぼう/)).not.toBeInTheDocument()
    expect(screen.queryByText('Top3を作成 🎉')).not.toBeInTheDocument()
  })

  it('1つ選択時に disabled のフローティングボタン「あと2つ選ぼう」を表示する', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: null, movie: null },
      isComplete: false,
    }
    render(<SelectionArea theme="" />)
    const floatingBtn = screen.getByRole('button', {
      name: /あと2つ選ぼう/,
    })
    expect(floatingBtn).toBeDisabled()
  })

  it('2つ選択時に disabled のフローティングボタン「あと1つ選ぼう」を表示する', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: musicItem, movie: null },
      isComplete: false,
    }
    render(<SelectionArea theme="" />)
    const floatingBtn = screen.getByRole('button', {
      name: /あと1つ選ぼう/,
    })
    expect(floatingBtn).toBeDisabled()
  })

  it('3つ揃うと「Top3を作成 🎉」ボタンが有効化される', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: musicItem, movie: movieItem },
      isComplete: true,
    }
    render(<SelectionArea theme="" />)
    const createBtn = screen.getByRole('button', {
      name: 'Top3を作成 🎉',
    })
    expect(createBtn).toBeEnabled()
  })
})

// ====================================
// デスクトップ完了時
// ====================================
describe('SelectionArea — デスクトップ完了時', () => {
  it('3つ揃うとデスクトップに「Top3を作成」ボタンを表示する', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: musicItem, movie: movieItem },
      isComplete: true,
    }
    render(<SelectionArea theme="" />)
    // Desktop button (not emoji version)
    expect(screen.getByText('Top3を作成')).toBeInTheDocument()
  })

  it('選択済み作品のタイトルが表示される', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: null, movie: null },
    }
    render(<SelectionArea theme="" />)
    expect(screen.getAllByText('Test Book').length).toBeGreaterThanOrEqual(1)
  })
})

// ====================================
// コールバック
// ====================================
describe('SelectionArea — コールバック', () => {
  it('onCompleteChange が isComplete の値で呼ばれる', () => {
    const onCompleteChange = vi.fn()
    render(<SelectionArea theme="" onCompleteChange={onCompleteChange} />)
    expect(onCompleteChange).toHaveBeenCalledWith(false)
  })

  it('isComplete=true のとき onCompleteChange(true) が呼ばれる', () => {
    mockContext = {
      ...mockContext,
      selection: { book: bookItem, music: musicItem, movie: movieItem },
      isComplete: true,
    }
    const onCompleteChange = vi.fn()
    render(<SelectionArea theme="" onCompleteChange={onCompleteChange} />)
    expect(onCompleteChange).toHaveBeenCalledWith(true)
  })
})
