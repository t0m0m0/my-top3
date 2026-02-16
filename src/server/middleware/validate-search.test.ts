// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  validateSearchQuery,
  clampStartIndex,
  MAX_QUERY_LENGTH,
  MAX_START_INDEX,
} from './validate-search'

describe('validateSearchQuery', () => {
  it('returns null for valid query', () => {
    expect(validateSearchQuery('hello')).toBeNull()
  })

  it('returns error message for too long query', () => {
    const longQuery = 'a'.repeat(MAX_QUERY_LENGTH + 1)
    expect(validateSearchQuery(longQuery)).toContain('Query too long')
  })

  it('allows query at exact max length', () => {
    expect(validateSearchQuery('a'.repeat(MAX_QUERY_LENGTH))).toBeNull()
  })
})

describe('clampStartIndex', () => {
  it('returns 0 for empty string', () => {
    expect(clampStartIndex('')).toBe(0)
  })

  it('clamps negative to 0', () => {
    expect(clampStartIndex('-5')).toBe(0)
  })

  it('clamps excessive values to MAX_START_INDEX', () => {
    expect(clampStartIndex('999999')).toBe(MAX_START_INDEX)
  })

  it('passes through valid values', () => {
    expect(clampStartIndex('50')).toBe(50)
  })
})
