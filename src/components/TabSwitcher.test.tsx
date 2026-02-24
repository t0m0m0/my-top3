import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TabSwitcher from './TabSwitcher'

describe('TabSwitcher', () => {
  it('renders all 3 tabs', () => {
    render(<TabSwitcher value="book" onChange={vi.fn()} />)
    expect(screen.getByText('📚 本')).toBeInTheDocument()
    expect(screen.getByText('🎵 音楽')).toBeInTheDocument()
    expect(screen.getByText('🎬 映画')).toBeInTheDocument()
  })

  it('marks active tab as selected', () => {
    render(<TabSwitcher value="music" onChange={vi.fn()} />)
    const musicTab = screen.getByText('🎵 音楽').closest('[role="tab"]')
    expect(musicTab).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onChange when tab clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TabSwitcher value="book" onChange={onChange} />)
    await user.click(screen.getByText('🎬 映画'))
    expect(onChange).toHaveBeenCalledWith('movie')
  })
})
