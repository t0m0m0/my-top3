import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TagList from './TagList'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

afterEach(() => mockNavigate.mockClear())

function renderTagList(tags: string[], clickable?: boolean) {
  return render(
    <MemoryRouter>
      <TagList tags={tags} clickable={clickable} />
    </MemoryRouter>,
  )
}

describe('TagList', () => {
  it('renders tags with # prefix', () => {
    renderTagList(['アニメ', '推し活'])
    expect(screen.getByText('#アニメ')).toBeInTheDocument()
    expect(screen.getByText('#推し活')).toBeInTheDocument()
  })

  it('navigates to gallery with tag filter on click', () => {
    renderTagList(['アニメ'])
    fireEvent.click(screen.getByText('#アニメ'))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/gallery?tag=%E3%82%A2%E3%83%8B%E3%83%A1',
    )
  })

  it('does not navigate when clickable is false', () => {
    renderTagList(['アニメ'], false)
    fireEvent.click(screen.getByText('#アニメ'))
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('renders empty when no tags', () => {
    const { container } = renderTagList([])
    expect(container.textContent).toBe('')
  })
})
