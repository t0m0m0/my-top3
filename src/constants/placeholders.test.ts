import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PLACEHOLDER,
  CATEGORY_PLACEHOLDERS,
  CANVAS_PLACEHOLDER,
} from './placeholders'
import type { MediaCategory } from '../types/common'

const CATEGORIES: MediaCategory[] = ['book', 'music', 'movie']

describe('DEFAULT_PLACEHOLDER', () => {
  it('is a data URI SVG', () => {
    expect(DEFAULT_PLACEHOLDER).toMatch(/^data:image\/svg/)
  })
})

describe('CATEGORY_PLACEHOLDERS', () => {
  it.each(CATEGORIES)('has a placeholder for %s', (cat) => {
    expect(CATEGORY_PLACEHOLDERS[cat]).toMatch(/^data:image\/svg/)
  })

  it('covers all MediaCategory values', () => {
    expect(Object.keys(CATEGORY_PLACEHOLDERS).sort()).toEqual(
      [...CATEGORIES].sort(),
    )
  })
})

describe('CANVAS_PLACEHOLDER', () => {
  it('is a base64-encoded data URI', () => {
    expect(CANVAS_PLACEHOLDER).toMatch(/^data:image\/svg\+xml;base64,/)
  })
})
