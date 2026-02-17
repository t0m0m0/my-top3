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

it('renders suggestion chips', () => {
  render(<ThemeInput value="" onChange={vi.fn()} />)
  expect(screen.getByText('夏に読みたい')).toBeInTheDocument()
  expect(screen.getByText('青春')).toBeInTheDocument()
  expect(screen.getByText('2024年ベスト')).toBeInTheDocument()
})

it('calls onChange when a suggestion chip is clicked', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ThemeInput value="" onChange={onChange} />)
  await user.click(screen.getByText('青春'))
  expect(onChange).toHaveBeenCalledWith('青春')
})

it('hides suggestion chips when value is non-empty', () => {
  render(<ThemeInput value="何か" onChange={vi.fn()} />)
  expect(screen.queryByText('夏に読みたい')).not.toBeInTheDocument()
})

it('shows guide text when value is empty', () => {
  render(<ThemeInput value="" onChange={vi.fn()} />)
  expect(
    screen.getByText('テーマは後からでもOK！まず好きな作品を検索しよう'),
  ).toBeInTheDocument()
})

it('hides guide text when value is non-empty', () => {
  render(<ThemeInput value="何か" onChange={vi.fn()} />)
  expect(
    screen.queryByText('テーマは後からでもOK！まず好きな作品を検索しよう'),
  ).not.toBeInTheDocument()
})
