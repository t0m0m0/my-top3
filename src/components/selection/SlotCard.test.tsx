import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import { SlotCard } from './SlotCard'
import { createSearchResultItem } from '../../test/fixtures'

const bookItem = createSearchResultItem({
  id: 'book-1',
  category: 'book',
  title: 'Test Book',
  subtitle: 'Author A',
})

describe('SlotCard', () => {
  it('未選択時に空スロットを表示する', () => {
    render(
      <SlotCard
        category="book"
        item={null}
        onDeselect={vi.fn()}
        onSlotClick={vi.fn()}
      />,
    )
    expect(screen.getByText('未選択')).toBeInTheDocument()
    expect(screen.getByText('Book')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Bookを選ぶ/ }),
    ).toBeInTheDocument()
  })

  it('空スロットクリックで onSlotClick が呼ばれる', async () => {
    const user = userEvent.setup()
    const onSlotClick = vi.fn()
    render(
      <SlotCard
        category="music"
        item={null}
        onDeselect={vi.fn()}
        onSlotClick={onSlotClick}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Musicを選ぶ/ }))
    expect(onSlotClick).toHaveBeenCalledWith('music')
  })

  it('選択済み時に作品情報を表示する', () => {
    render(
      <SlotCard
        category="book"
        item={bookItem}
        onDeselect={vi.fn()}
        onSlotClick={vi.fn()}
      />,
    )
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Author A')).toBeInTheDocument()
  })

  it('×ボタンクリックで onDeselect が呼ばれる', async () => {
    const user = userEvent.setup()
    const onDeselect = vi.fn()
    render(
      <SlotCard
        category="book"
        item={bookItem}
        onDeselect={onDeselect}
        onSlotClick={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Bookの選択を解除/ }))
    expect(onDeselect).toHaveBeenCalledWith('book')
  })
})
