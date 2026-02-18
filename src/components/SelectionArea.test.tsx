import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import SelectionArea from './SelectionArea'

describe('SelectionArea', () => {
  it('shows 未選択 for empty slots', () => {
    render(<SelectionArea theme="" />)
    const slots = screen.getAllByText('未選択')
    expect(slots).toHaveLength(3)
  })

  it('does not show create button when incomplete', () => {
    render(<SelectionArea theme="" />)
    expect(screen.queryByText('Top3を作成')).not.toBeInTheDocument()
  })

  it('uses responsive flex layout (column on mobile, row on sm+)', () => {
    const { container } = render(<SelectionArea theme="" />)
    const slotContainer = container.querySelector(
      '.flex.flex-col.sm\\:flex-row',
    )
    expect(slotContainer).toBeInTheDocument()
  })
})

it('calls onSlotClick with category when empty slot is clicked', async () => {
  const user = userEvent.setup()
  const onSlotClick = vi.fn()
  render(<SelectionArea theme="" onSlotClick={onSlotClick} />)
  const bookSlot = screen.getByRole('button', { name: /Book.*選ぶ/ })
  await user.click(bookSlot)
  expect(onSlotClick).toHaveBeenCalledWith('book')
})
