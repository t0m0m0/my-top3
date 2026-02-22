import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="My No.1s" />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'My No.1s' }),
    ).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <PageHeader
        title="みんなのNo.1s"
        subtitle="みんなが選んだお気に入りの作品たち"
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'みんなのNo.1s' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('みんなが選んだお気に入りの作品たち'),
    ).toBeInTheDocument()
  })

  it('does not render subtitle element when not provided', () => {
    const { container } = render(<PageHeader title="My No.1s" />)
    expect(container.querySelector('p')).toBeNull()
  })

  it('renders decorative gradient lines', () => {
    const { container } = render(<PageHeader title="Test" />)
    const lines = container.querySelectorAll('.h-0\\.5')
    expect(lines).toHaveLength(2)
  })
})
