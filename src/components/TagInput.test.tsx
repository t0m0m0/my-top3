import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TagInput from './TagInput'

describe('TagInput', () => {
  it('renders tag input field', () => {
    render(<TagInput tags={[]} onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('タグを追加')).toBeInTheDocument()
  })

  it('renders existing tags as chips', () => {
    render(<TagInput tags={['アニメ', '推し活']} onChange={vi.fn()} />)
    expect(screen.getByText('#アニメ')).toBeInTheDocument()
    expect(screen.getByText('#推し活')).toBeInTheDocument()
  })

  it('adds a tag on Enter key', () => {
    const onChange = vi.fn()
    render(<TagInput tags={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText('タグを追加')
    fireEvent.change(input, { target: { value: '新しいタグ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['新しいタグ'])
  })

  it('trims whitespace from tags', () => {
    const onChange = vi.fn()
    render(<TagInput tags={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText('タグを追加')
    fireEvent.change(input, { target: { value: '  スペース  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['スペース'])
  })

  it('does not add empty tag', () => {
    const onChange = vi.fn()
    render(<TagInput tags={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText('タグを追加')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not add duplicate tag', () => {
    const onChange = vi.fn()
    render(<TagInput tags={['既存']} onChange={onChange} />)
    const input = screen.getByPlaceholderText('タグを追加')
    fireEvent.change(input, { target: { value: '既存' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('removes # prefix from user input', () => {
    const onChange = vi.fn()
    render(<TagInput tags={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText('タグを追加')
    fireEvent.change(input, { target: { value: '#ハッシュ付き' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['ハッシュ付き'])
  })

  it('removes tag when delete button is clicked', () => {
    const onChange = vi.fn()
    render(<TagInput tags={['削除対象', '残す']} onChange={onChange} />)
    // MUI Chip has a cancel icon as delete button
    const deleteButtons = screen.getAllByTestId('CancelIcon')
    fireEvent.click(deleteButtons[0]!)
    expect(onChange).toHaveBeenCalledWith(['残す'])
  })

  it('enforces max 5 tags', () => {
    const onChange = vi.fn()
    render(
      <TagInput tags={['a', 'b', 'c', 'd', 'e']} onChange={onChange} />,
    )
    const input = screen.getByPlaceholderText('タグを追加')
    fireEvent.change(input, { target: { value: '6つ目' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('enforces max 20 chars per tag', () => {
    const onChange = vi.fn()
    render(<TagInput tags={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText('タグを追加')
    fireEvent.change(input, { target: { value: 'あ'.repeat(21) } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears input after adding tag', () => {
    render(<TagInput tags={[]} onChange={vi.fn()} />)
    const input = screen.getByPlaceholderText('タグを追加') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'テスト' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input.value).toBe('')
  })

  it('shows tag count', () => {
    render(<TagInput tags={['a', 'b']} onChange={vi.fn()} />)
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })
})
