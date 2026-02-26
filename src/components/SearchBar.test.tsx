import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  it('renders with provided value', () => {
    render(<SearchBar value="hello" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('shows default placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)
    expect(
      screen.getByPlaceholderText('タイトルやキーワードで検索...'),
    ).toBeInTheDocument()
  })

  it('shows custom placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="カスタム" />)
    expect(screen.getByPlaceholderText('カスタム')).toBeInTheDocument()
  })
})
