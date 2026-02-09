import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeInput from './ThemeInput'

describe('ThemeInput', () => {
  it('renders with value', () => {
    render(<ThemeInput value="テスト" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('テスト')).toBeInTheDocument()
  })

  it('calls onChange on input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ThemeInput value="" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'a')
    expect(onChange).toHaveBeenCalled()
  })

  it('shows character count', () => {
    render(<ThemeInput value="hello" onChange={vi.fn()} />)
    expect(screen.getByText('5 / 50')).toBeInTheDocument()
  })

  it('shows error when over limit', () => {
    const longText = 'a'.repeat(51)
    render(<ThemeInput value={longText} onChange={vi.fn()} />)
    expect(
      screen.getByText(/テーマは50文字以内で入力してください/),
    ).toBeInTheDocument()
  })
})
