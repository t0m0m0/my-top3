import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TabSwitcher from './TabSwitcher'

describe('TabSwitcher', () => {
  it('renders all 3 tabs', () => {
    render(<TabSwitcher value="book" onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: /本/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /音楽/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /映画/ })).toBeInTheDocument()
  })

  it('marks active tab as selected', () => {
    render(<TabSwitcher value="music" onChange={vi.fn()} />)
    const musicTab = screen.getByRole('tab', { name: /音楽/ })
    expect(musicTab).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onChange when tab clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TabSwitcher value="book" onChange={onChange} />)
    await user.click(screen.getByRole('tab', { name: /映画/ }))
    expect(onChange).toHaveBeenCalledWith('movie')
  })
})
