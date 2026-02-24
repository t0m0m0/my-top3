import { describe, it, expect } from 'vitest'
import {
  CATEGORY_LABELS_JA,
  CATEGORY_LABELS_EN,
  API_ENDPOINTS,
} from './category'
import type { MediaCategory } from '../types/common'

const CATEGORIES: MediaCategory[] = ['book', 'music', 'movie']

describe('CATEGORY_LABELS_JA', () => {
  it('has Japanese labels for all categories', () => {
    expect(CATEGORY_LABELS_JA).toEqual({
      book: '書籍',
      music: '音楽',
      movie: '映画',
    })
  })

  it('covers all MediaCategory values', () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_LABELS_JA[cat]).toBeDefined()
    }
  })
})

describe('CATEGORY_LABELS_EN', () => {
  it('has Japanese labels for all categories', () => {
    expect(CATEGORY_LABELS_EN).toEqual({
      book: '📚 本',
      music: '🎵 音楽',
      movie: '🎬 映画',
    })
  })

  it('covers all MediaCategory values', () => {
    for (const cat of CATEGORIES) {
      expect(CATEGORY_LABELS_EN[cat]).toBeDefined()
    }
  })
})

describe('API_ENDPOINTS', () => {
  it('has correct endpoints for all categories', () => {
    expect(API_ENDPOINTS).toEqual({
      book: '/api/books',
      music: '/api/music',
      movie: '/api/movies',
    })
  })

  it('covers all MediaCategory values', () => {
    for (const cat of CATEGORIES) {
      expect(API_ENDPOINTS[cat]).toBeDefined()
    }
  })
})
