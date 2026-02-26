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
    const input = screen.getByRole('textbox', { name: 'お題' })
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
    expect(screen.getByText(/50文字以内/)).toBeInTheDocument()
  })
})

it('renders suggestion chips', () => {
  render(<ThemeInput value="" onChange={vi.fn()} />)
  expect(screen.getByText('推し')).toBeInTheDocument()
  expect(screen.getByText('泣ける作品')).toBeInTheDocument()
  expect(screen.getByText('人生変わった')).toBeInTheDocument()
})

it('calls onChange when a suggestion chip is clicked', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ThemeInput value="" onChange={onChange} />)
  await user.click(screen.getByText('泣ける作品'))
  expect(onChange).toHaveBeenCalledWith('泣ける作品')
})

it('hides suggestion chips when value is non-empty', () => {
  render(<ThemeInput value="何か" onChange={vi.fn()} />)
  expect(screen.queryByText('推し')).not.toBeInTheDocument()
})
