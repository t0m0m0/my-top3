// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  assertObject,
  assertField,
  assertArray,
  assertOptionalArray,
} from './validation-helpers'

describe('assertObject', () => {
  it('returns record for valid object', () => {
    const result = assertObject({ a: 1 }, 'test')
    expect(result).toEqual({ a: 1 })
  })
  it('throws for null', () => {
    expect(() => assertObject(null, 'test')).toThrow('Expected object')
  })
  it('throws for non-object', () => {
    expect(() => assertObject('string', 'test')).toThrow('Expected object')
  })
  it('throws for undefined', () => {
    expect(() => assertObject(undefined, 'test')).toThrow('Expected object')
  })
  it('throws for array', () => {
    expect(() => assertObject([1, 2, 3], 'test')).toThrow('Expected object')
  })
  it('throws for empty array', () => {
    expect(() => assertObject([], 'test')).toThrow('Expected object')
  })
})

describe('assertField', () => {
  it('returns value for matching type', () => {
    expect(
      assertField<string>({ name: 'test' }, 'name', 'string', 'test'),
    ).toBe('test')
  })
  it('returns number for matching type', () => {
    expect(assertField<number>({ count: 42 }, 'count', 'number', 'test')).toBe(
      42,
    )
  })
  it('throws for wrong type', () => {
    expect(() =>
      assertField<string>({ name: 42 }, 'name', 'string', 'test'),
    ).toThrow('Missing or invalid name')
  })
  it('throws for missing field', () => {
    expect(() => assertField<string>({}, 'name', 'string', 'test')).toThrow(
      'Missing or invalid name',
    )
  })
})

describe('assertArray', () => {
  it('returns array', () => {
    expect(assertArray({ items: [1] }, 'items', 'test')).toEqual([1])
  })
  it('returns empty array', () => {
    expect(assertArray({ items: [] }, 'items', 'test')).toEqual([])
  })
  it('throws for non-array', () => {
    expect(() => assertArray({ items: 'bad' }, 'items', 'test')).toThrow(
      'Missing or invalid items',
    )
  })
  it('throws for missing field', () => {
    expect(() => assertArray({}, 'items', 'test')).toThrow(
      'Missing or invalid items',
    )
  })
})

describe('assertOptionalArray', () => {
  it('returns array when present', () => {
    expect(assertOptionalArray({ items: [1, 2] }, 'items', 'test')).toEqual([
      1, 2,
    ])
  })
  it('returns undefined when field is absent', () => {
    expect(assertOptionalArray({}, 'items', 'test')).toBeUndefined()
  })
  it('throws for non-array value', () => {
    expect(() =>
      assertOptionalArray({ items: 'bad' }, 'items', 'test'),
    ).toThrow('Invalid items field')
  })
})
