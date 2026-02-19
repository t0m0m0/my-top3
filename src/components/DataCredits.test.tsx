import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import DataCredits from './DataCredits'

describe('DataCredits', () => {
  it('renders TMDb attribution text', () => {
    render(<DataCredits />)
    expect(
      screen.getByText(
        /This product uses the TMDB API but is not endorsed or certified by TMDB/,
      ),
    ).toBeInTheDocument()
  })

  it('renders TMDb logo with link to TMDb', () => {
    render(<DataCredits />)
    const tmdbLink = screen.getByRole('link', { name: /tmdb/i })
    expect(tmdbLink).toHaveAttribute('href', 'https://www.themoviedb.org/')
    expect(tmdbLink).toHaveAttribute('target', '_blank')
    expect(tmdbLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders TMDb logo image', () => {
    render(<DataCredits />)
    const img = screen.getByAltText(/tmdb/i)
    expect(img).toBeInTheDocument()
  })

  it('renders Last.fm attribution text', () => {
    render(<DataCredits />)
    expect(screen.getByText(/last\.fm/i)).toBeInTheDocument()
  })

  it('renders Last.fm logo with link to Last.fm', () => {
    render(<DataCredits />)
    const lastfmLink = screen.getByRole('link', { name: /last\.fm/i })
    expect(lastfmLink).toHaveAttribute('href', 'https://www.last.fm/')
    expect(lastfmLink).toHaveAttribute('target', '_blank')
    expect(lastfmLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders Last.fm logo image', () => {
    render(<DataCredits />)
    const img = screen.getByAltText(/last\.fm/i)
    expect(img).toBeInTheDocument()
  })
})
