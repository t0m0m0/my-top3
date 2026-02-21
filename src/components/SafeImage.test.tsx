import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import { SafeImage } from './SafeImage'
import { DEFAULT_PLACEHOLDER } from '../constants/placeholders'

describe('SafeImage', () => {
  it('renders img with src and alt', () => {
    render(<SafeImage src="https://example.com/img.jpg" alt="test" />)
    const img = screen.getByRole('img', { name: 'test' })
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg')
  })

  it('uses DEFAULT_PLACEHOLDER as fallbackSrc by default', () => {
    render(<SafeImage src="bad.jpg" alt="test" />)
    const img = screen.getByRole('img', { name: 'test' })
    fireEvent.error(img)
    expect(img).toHaveAttribute('src', DEFAULT_PLACEHOLDER)
  })

  it('uses custom fallbackSrc on error', () => {
    render(<SafeImage src="bad.jpg" alt="test" fallbackSrc="fallback.svg" />)
    const img = screen.getByRole('img', { name: 'test' })
    fireEvent.error(img)
    expect(img).toHaveAttribute('src', 'fallback.svg')
  })

  it('does not loop when fallbackSrc also fails', () => {
    render(<SafeImage src="bad.jpg" alt="test" fallbackSrc="also-bad.svg" />)
    const img = screen.getByRole('img', { name: 'test' })
    // first error → set to fallback
    fireEvent.error(img)
    expect(img).toHaveAttribute('src', 'also-bad.svg')
    // second error → should NOT change src again (no infinite loop)
    fireEvent.error(img)
    expect(img).toHaveAttribute('src', 'also-bad.svg')
  })

  it('passes extra props to img', () => {
    render(
      <SafeImage
        src="test.jpg"
        alt="test"
        className="custom-class"
        data-testid="my-img"
      />,
    )
    const img = screen.getByTestId('my-img')
    expect(img).toHaveClass('custom-class')
  })
})
