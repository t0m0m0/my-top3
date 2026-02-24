import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="すきコレ" />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'すきコレ' }),
    ).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <PageHeader title="みんなの推し" subtitle="みんなが選んだ推し作品たち" />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'みんなの推し' }),
    ).toBeInTheDocument()
    expect(screen.getByText('みんなが選んだ推し作品たち')).toBeInTheDocument()
  })

  it('does not render subtitle element when not provided', () => {
    const { container } = render(<PageHeader title="すきコレ" />)
    expect(container.querySelector('p')).toBeNull()
  })

  it('renders decorative gradient lines', () => {
    const { container } = render(<PageHeader title="Test" />)
    const lines = container.querySelectorAll('.h-0\\.5')
    expect(lines).toHaveLength(2)
  })
})
