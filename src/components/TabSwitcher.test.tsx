import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TabSwitcher from './TabSwitcher'

describe('TabSwitcher', () => {
  it('renders all 3 tabs', () => {
    render(<TabSwitcher value="book" onChange={vi.fn()} />)
    expect(screen.getByText('Book')).toBeInTheDocument()
    expect(screen.getByText('Music')).toBeInTheDocument()
    expect(screen.getByText('Movie')).toBeInTheDocument()
  })

  it('marks active tab as selected', () => {
    render(<TabSwitcher value="music" onChange={vi.fn()} />)
    const musicTab = screen.getByText('Music').closest('[role="tab"]')
    expect(musicTab).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onChange when tab clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TabSwitcher value="book" onChange={onChange} />)
    await user.click(screen.getByText('Movie'))
    expect(onChange).toHaveBeenCalledWith('movie')
  })
})
