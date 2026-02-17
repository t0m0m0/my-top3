import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StepGuide from './StepGuide'

describe('StepGuide', () => {
  it('renders 3 step labels', () => {
    render(<StepGuide />)
    expect(screen.getByText('検索する')).toBeInTheDocument()
    expect(screen.getByText('3つ選ぶ')).toBeInTheDocument()
    expect(screen.getByText('シェアする')).toBeInTheDocument()
  })

  it('renders step numbers', () => {
    render(<StepGuide />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('has accessible region', () => {
    render(<StepGuide />)
    expect(
      screen.getByRole('list', { name: '使い方ステップ' }),
    ).toBeInTheDocument()
  })
})
