import { describe, it, expect } from 'vitest'
import { buildTop3Url, parseTop3Params, buildEditUrl } from './url-params'
import { createSearchResultItem } from '../test/fixtures'
import { MAX_THEME_LENGTH } from '../hooks/useTheme'

describe('buildTop3Url', () => {
  it('builds URL with all selections and theme', () => {
    const selection = {
      book: createSearchResultItem({ id: 'b1', category: 'book' }),
      music: createSearchResultItem({ id: 'm1', category: 'music' }),
      movie: createSearchResultItem({ id: 'v1', category: 'movie' }),
    }
    const url = buildTop3Url(selection, '雨の日に楽しむ')
    expect(url).toContain('/my-no1s?')
    expect(url).toContain('theme=')
    expect(url).toContain('book=b1')
    expect(url).toContain('music=m1')
    expect(url).toContain('movie=v1')
  })

  it('omits theme when empty', () => {
    const selection = {
      book: createSearchResultItem({ id: 'b1', category: 'book' }),
      music: null,
      movie: null,
    }
    const url = buildTop3Url(selection, '')
    expect(url).not.toContain('theme=')
  })

  it('omits theme when whitespace-only', () => {
    const selection = { book: null, music: null, movie: null }
    const url = buildTop3Url(selection, '   ')
    expect(url).not.toContain('theme=')
  })

  it('omits null selections', () => {
    const selection = {
      book: null,
      music: createSearchResultItem({ id: 'm1', category: 'music' }),
      movie: null,
    }
    const url = buildTop3Url(selection, '')
    expect(url).not.toContain('book=')
    expect(url).toContain('music=m1')
    expect(url).not.toContain('movie=')
  })

  it('returns /my-no1s with no selections and no theme', () => {
    const selection = { book: null, music: null, movie: null }
    expect(buildTop3Url(selection, '')).toBe('/my-no1s')
  })

  it('trims theme whitespace', () => {
    const selection = { book: null, music: null, movie: null }
    const url = buildTop3Url(selection, '  hello  ')
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('theme')).toBe('hello')
  })
})

describe('parseTop3Params', () => {
  it('extracts all params', () => {
    const params = new URLSearchParams('theme=test&book=b1&music=m1&movie=v1')
    expect(parseTop3Params(params)).toEqual({
      theme: 'test',
      bookId: 'b1',
      musicId: 'm1',
      movieId: 'v1',
    })
  })

  it('returns empty strings for missing params', () => {
    const params = new URLSearchParams()
    expect(parseTop3Params(params)).toEqual({
      theme: '',
      bookId: '',
      musicId: '',
      movieId: '',
    })
  })

  it('truncates theme to MAX_THEME_LENGTH', () => {
    const longTheme = 'a'.repeat(100)
    const params = new URLSearchParams(`theme=${longTheme}`)
    const result = parseTop3Params(params)
    expect(result.theme.length).toBe(MAX_THEME_LENGTH)
  })

  it('round-trips with buildTop3Url', () => {
    const selection = {
      book: createSearchResultItem({ id: 'b1', category: 'book' }),
      music: createSearchResultItem({ id: 'm1', category: 'music' }),
      movie: createSearchResultItem({ id: 'v1', category: 'movie' }),
    }
    const url = buildTop3Url(selection, 'テスト')
    const query = url.split('?')[1]
    const parsed = parseTop3Params(new URLSearchParams(query))
    expect(parsed.bookId).toBe('b1')
    expect(parsed.musicId).toBe('m1')
    expect(parsed.movieId).toBe('v1')
    expect(parsed.theme).toBe('テスト')
  })
})

describe('buildEditUrl', () => {
  it('builds URL with edit flag and IDs', () => {
    const url = buildEditUrl({
      theme: 'test',
      bookId: 'b1',
      musicId: 'm1',
      movieId: 'v1',
    })
    expect(url).toBe('/?edit=1&theme=test&book=b1&music=m1&movie=v1')
  })

  it('omits empty IDs', () => {
    const url = buildEditUrl({
      theme: '',
      bookId: 'b1',
      musicId: '',
      movieId: '',
    })
    expect(url).toBe('/?edit=1&book=b1')
  })

  it('includes theme when present', () => {
    const url = buildEditUrl({
      theme: '夏の思い出',
      bookId: '',
      musicId: '',
      movieId: '',
    })
    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('theme')).toBe('夏の思い出')
  })
})
