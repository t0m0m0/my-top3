import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import PillLinkButton from './PillLinkButton'

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe('PillLinkButton', () => {
  it('renders children as link text', () => {
    renderWithRouter(<PillLinkButton to="/">テスト</PillLinkButton>)
    expect(screen.getByRole('link', { name: 'テスト' })).toBeInTheDocument()
  })

  it('links to the specified path', () => {
    renderWithRouter(<PillLinkButton to="/gallery">ギャラリー</PillLinkButton>)
    expect(screen.getByRole('link', { name: 'ギャラリー' })).toHaveAttribute(
      'href',
      '/gallery',
    )
  })

  it('defaults to primary color', () => {
    const { container } = renderWithRouter(
      <PillLinkButton to="/">Primary</PillLinkButton>,
    )
    const button = container.querySelector('a')
    expect(button).toBeInTheDocument()
  })

  it('accepts secondary color', () => {
    renderWithRouter(
      <PillLinkButton to="/" color="secondary">
        Secondary
      </PillLinkButton>,
    )
    expect(screen.getByRole('link', { name: 'Secondary' })).toBeInTheDocument()
  })
})
