import type { SearchResultItem } from '../types/common'
import { MAX_THEME_LENGTH } from '../hooks/useTheme'

/** Validates that an ID contains only safe characters (alphanumeric, hyphen, underscore) */
function sanitizeId(raw: string): string {
  const trimmed = raw.trim()
  return /^[\w-]+$/.test(trimmed) ? trimmed : ''
}

type Selection = {
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
}

type Top3Params = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
  tags: string[]
}

export function buildTop3Url(
  selection: Selection,
  theme: string,
  tags?: string[],
): string {
  const params = new URLSearchParams()

  if (theme.trim()) {
    params.set('theme', theme.trim())
  }

  if (selection.book) {
    params.set('book', selection.book.id)
  }

  if (selection.music) {
    params.set('music', selection.music.id)
  }

  if (selection.movie) {
    params.set('movie', selection.movie.id)
  }

  if (tags && tags.length > 0) {
    params.set('tags', tags.join(','))
  }

  const queryString = params.toString()
  return queryString ? `/my-no1s?${queryString}` : '/my-no1s'
}

export function parseTop3Params(searchParams: URLSearchParams): Top3Params {
  const rawTheme = searchParams.get('theme') ?? ''
  const rawTags = searchParams.get('tags') ?? ''
  const tags = rawTags
    ? rawTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5)
    : []
  return {
    theme: rawTheme.slice(0, MAX_THEME_LENGTH),
    bookId: sanitizeId(searchParams.get('book') ?? ''),
    musicId: sanitizeId(searchParams.get('music') ?? ''),
    movieId: sanitizeId(searchParams.get('movie') ?? ''),
    tags,
  }
}

export function buildEditUrl(params: Top3Params): string {
  const sp = new URLSearchParams()
  sp.set('edit', '1')

  if (params.theme) {
    sp.set('theme', params.theme)
  }
  if (params.bookId) {
    sp.set('book', params.bookId)
  }
  if (params.musicId) {
    sp.set('music', params.musicId)
  }
  if (params.movieId) {
    sp.set('movie', params.movieId)
  }
  if (params.tags && params.tags.length > 0) {
    sp.set('tags', params.tags.join(','))
  }

  return `/?${sp.toString()}`
}
