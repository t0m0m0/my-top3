import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import { LayoutSelector } from './LayoutSelector'
import type { LayoutConfig, SlotPosition } from '../constants/image-layout'
import type { MediaCategory } from '../types/common'

const defaultLayout: LayoutConfig = {
  top: 'music',
  'bottom-left': 'book',
  'bottom-right': 'movie',
}

describe('LayoutSelector', () => {
  it('renders layout-selector container', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    expect(screen.getByTestId('layout-selector')).toBeInTheDocument()
  })

  it('renders toggle button groups for all three slots', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    expect(screen.getByTestId('layout-slot-top')).toBeInTheDocument()
    expect(screen.getByTestId('layout-slot-bottom-left')).toBeInTheDocument()
    expect(screen.getByTestId('layout-slot-bottom-right')).toBeInTheDocument()
  })

  it('displays Japanese slot labels', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    expect(screen.getByText('上:')).toBeInTheDocument()
    expect(screen.getByText('左下:')).toBeInTheDocument()
    expect(screen.getByText('右下:')).toBeInTheDocument()
  })

  it('renders category buttons with labels for each slot', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    // Each slot has 3 category buttons → 9 total
    const bookButtons = screen.getAllByText('📚 本')
    const musicButtons = screen.getAllByText('🎵 音楽')
    const movieButtons = screen.getAllByText('🎬 映画')
    expect(bookButtons).toHaveLength(3)
    expect(musicButtons).toHaveLength(3)
    expect(movieButtons).toHaveLength(3)
  })

  it('reflects current layout as selected toggle buttons', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    // top slot: music is selected
    const topGroup = screen.getByTestId('layout-slot-top')
    const topSelected = topGroup.querySelector('[aria-pressed="true"]')
    expect(topSelected).toHaveTextContent('🎵 音楽')

    // bottom-left slot: book is selected
    const blGroup = screen.getByTestId('layout-slot-bottom-left')
    const blSelected = blGroup.querySelector('[aria-pressed="true"]')
    expect(blSelected).toHaveTextContent('📚 本')

    // bottom-right slot: movie is selected
    const brGroup = screen.getByTestId('layout-slot-bottom-right')
    const brSelected = brGroup.querySelector('[aria-pressed="true"]')
    expect(brSelected).toHaveTextContent('🎬 映画')
  })

  it('calls onLayoutChange with slot and category when a toggle button is clicked', () => {
    const onLayoutChange = vi.fn()
    render(
      <LayoutSelector layout={defaultLayout} onLayoutChange={onLayoutChange} />,
    )
    // Click BOOK in the top slot (top is currently music)
    const topGroup = screen.getByTestId('layout-slot-top')
    const bookButton = topGroup.querySelector('[value="book"]') as HTMLElement
    fireEvent.click(bookButton)
    expect(onLayoutChange).toHaveBeenCalledWith('top', 'book')
  })

  it('calls onLayoutChange for bottom-right slot', () => {
    const onLayoutChange =
      vi.fn<(slot: SlotPosition, category: MediaCategory) => void>()
    render(
      <LayoutSelector layout={defaultLayout} onLayoutChange={onLayoutChange} />,
    )
    // Click MUSIC in the bottom-right slot (bottom-right is currently movie)
    const brGroup = screen.getByTestId('layout-slot-bottom-right')
    const musicButton = brGroup.querySelector('[value="music"]') as HTMLElement
    fireEvent.click(musicButton)
    expect(onLayoutChange).toHaveBeenCalledWith('bottom-right', 'music')
  })

  it('does not call onLayoutChange when clicking the already-selected category', () => {
    const onLayoutChange = vi.fn()
    render(
      <LayoutSelector layout={defaultLayout} onLayoutChange={onLayoutChange} />,
    )
    // Click MUSIC in top slot (already selected)
    const topGroup = screen.getByTestId('layout-slot-top')
    const musicButton = topGroup.querySelector('[value="music"]') as HTMLElement
    fireEvent.click(musicButton)
    expect(onLayoutChange).not.toHaveBeenCalled()
  })

  it('renders color indicators for each category button', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    const topGroup = screen.getByTestId('layout-slot-top')
    const indicators = topGroup.querySelectorAll(
      '[data-testid="color-indicator"]',
    )
    expect(indicators).toHaveLength(3)
  })
})
