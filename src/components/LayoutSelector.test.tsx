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

  it('renders select elements for all three slots', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    expect(screen.getByTestId('select-top')).toBeInTheDocument()
    expect(screen.getByTestId('select-bottom-left')).toBeInTheDocument()
    expect(screen.getByTestId('select-bottom-right')).toBeInTheDocument()
  })

  it('displays Japanese slot labels', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    expect(screen.getByText('上:')).toBeInTheDocument()
    expect(screen.getByText('左下:')).toBeInTheDocument()
    expect(screen.getByText('右下:')).toBeInTheDocument()
  })

  it('reflects current layout in select values', () => {
    render(<LayoutSelector layout={defaultLayout} onLayoutChange={vi.fn()} />)
    expect(screen.getByTestId('select-top')).toHaveValue('music')
    expect(screen.getByTestId('select-bottom-left')).toHaveValue('book')
    expect(screen.getByTestId('select-bottom-right')).toHaveValue('movie')
  })

  it('calls onLayoutChange with slot and category when changed', () => {
    const onLayoutChange = vi.fn()
    render(
      <LayoutSelector layout={defaultLayout} onLayoutChange={onLayoutChange} />,
    )
    fireEvent.change(screen.getByTestId('select-top'), {
      target: { value: 'book' },
    })
    expect(onLayoutChange).toHaveBeenCalledWith('top', 'book')
  })

  it('calls onLayoutChange for bottom-right slot', () => {
    const onLayoutChange =
      vi.fn<(slot: SlotPosition, category: MediaCategory) => void>()
    render(
      <LayoutSelector layout={defaultLayout} onLayoutChange={onLayoutChange} />,
    )
    fireEvent.change(screen.getByTestId('select-bottom-right'), {
      target: { value: 'music' },
    })
    expect(onLayoutChange).toHaveBeenCalledWith('bottom-right', 'music')
  })
})
