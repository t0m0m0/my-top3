import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import ResultCard from './ResultCard'
import { createSearchResultItem } from '../test/fixtures'

describe('ResultCard', () => {
  it('renders title and subtitle', () => {
    const item = createSearchResultItem({
      title: 'My Book',
      subtitle: 'John Doe',
    })
    render(<ResultCard item={item} onSelect={vi.fn()} />)
    expect(screen.getByText('My Book')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders thumbnail image', () => {
    const item = createSearchResultItem({
      title: 'My Book',
      thumbnailUrl: 'https://example.com/img.jpg',
    })
    render(<ResultCard item={item} onSelect={vi.fn()} />)
    const img = screen.getByRole('img', { name: 'My Book' })
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg')
  })

  it('calls onSelect when button clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const item = createSearchResultItem()
    render(<ResultCard item={item} onSelect={onSelect} />)
    await user.click(screen.getByText('推す！💜'))
    expect(onSelect).toHaveBeenCalledWith(item)
  })

  it('calls onSelect when card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const item = createSearchResultItem()
    render(<ResultCard item={item} onSelect={onSelect} />)
    await user.click(
      screen.getByRole('button', { name: /My Book|Test Title/i }),
    )
    expect(onSelect).toHaveBeenCalled()
  })

  it('shows select button text', () => {
    render(<ResultCard item={createSearchResultItem()} onSelect={vi.fn()} />)
    expect(screen.getByText('推す！💜')).toBeInTheDocument()
  })
})
