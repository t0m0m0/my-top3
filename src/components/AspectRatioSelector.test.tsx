import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import { AspectRatioSelector } from './AspectRatioSelector'

describe('AspectRatioSelector', () => {
  it('renders with landscape selected by default', () => {
    const onChange = vi.fn()
    render(<AspectRatioSelector value="landscape" onChange={onChange} />)
    expect(screen.getByTestId('aspect-ratio-selector')).toBeInTheDocument()
    expect(screen.getByText('画像サイズ:')).toBeInTheDocument()
    expect(screen.getByText('横長 1:1')).toBeInTheDocument()
    expect(screen.getByText('縦長 9:16')).toBeInTheDocument()
  })

  it('calls onChange when portrait is clicked', () => {
    const onChange = vi.fn()
    render(<AspectRatioSelector value="landscape" onChange={onChange} />)
    fireEvent.click(screen.getByText('縦長 9:16'))
    expect(onChange).toHaveBeenCalledWith('portrait')
  })

  it('calls onChange when landscape is clicked', () => {
    const onChange = vi.fn()
    render(<AspectRatioSelector value="portrait" onChange={onChange} />)
    fireEvent.click(screen.getByText('横長 1:1'))
    expect(onChange).toHaveBeenCalledWith('landscape')
  })

  it('does not call onChange when already selected value is clicked', () => {
    const onChange = vi.fn()
    render(<AspectRatioSelector value="landscape" onChange={onChange} />)
    fireEvent.click(screen.getByText('横長 1:1'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
