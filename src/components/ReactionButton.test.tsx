import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReactionButton from './ReactionButton'

describe('ReactionButton', () => {
  it('renders count', () => {
    render(<ReactionButton count={5} reacted={false} onToggle={() => {}} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders ❤️ when reacted', () => {
    render(<ReactionButton count={3} reacted={true} onToggle={() => {}} />)
    expect(screen.getByText('❤️')).toBeInTheDocument()
  })

  it('renders 🤍 when not reacted', () => {
    render(<ReactionButton count={0} reacted={false} onToggle={() => {}} />)
    expect(screen.getByText('🤍')).toBeInTheDocument()
  })

  it('calls onToggle on click', () => {
    const onToggle = vi.fn()
    render(<ReactionButton count={1} reacted={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button', { name: /いいね/ }))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('has aria-label "いいね"', () => {
    render(<ReactionButton count={0} reacted={false} onToggle={() => {}} />)
    expect(screen.getByRole('button', { name: 'いいね' })).toBeInTheDocument()
  })
})
