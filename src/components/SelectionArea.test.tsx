import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import SelectionArea from './SelectionArea'

describe('SelectionArea', () => {
  it('shows 未選択 for empty slots', () => {
    render(<SelectionArea theme="" />)
    // Desktop 3 + Mobile 3 = 6
    const slots = screen.getAllByText('未選択')
    expect(slots.length).toBeGreaterThanOrEqual(3)
  })

  it('does not show create button when incomplete', () => {
    render(<SelectionArea theme="" />)
    expect(screen.queryByText('Top3を作成')).not.toBeInTheDocument()
  })

  it('has desktop slot container with flex row layout', () => {
    const { container } = render(<SelectionArea theme="" />)
    const slotContainer = container.querySelector('.flex.gap-2')
    expect(slotContainer).toBeInTheDocument()
  })
})

it('calls onSlotClick with category when empty slot is clicked', async () => {
  const user = userEvent.setup()
  const onSlotClick = vi.fn()
  render(<SelectionArea theme="" onSlotClick={onSlotClick} />)
  const bookSlots = screen.getAllByRole('button', { name: /Book.*選ぶ/ })
  await user.click(bookSlots[0])
  expect(onSlotClick).toHaveBeenCalledWith('book')
})

describe('Mobile collapsible', () => {
  it('shows collapsible header with progress', () => {
    render(<SelectionArea theme="" />)
    expect(screen.getByText('選択中 0/3')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /選択エリアを展開/ }),
    ).toBeInTheDocument()
  })

  it('toggles collapse on header click', async () => {
    const user = userEvent.setup()
    render(<SelectionArea theme="" />)
    const toggle = screen.getByRole('button', { name: /選択エリアを展開/ })
    // Initially expanded
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })
})
