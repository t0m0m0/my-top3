import type { SearchResultItem } from '../types/common'

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
}

export function buildTop3Url(selection: Selection, theme: string): string {
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

  const queryString = params.toString()
  return queryString ? `/my-top3?${queryString}` : '/my-top3'
}

export function parseTop3Params(searchParams: URLSearchParams): Top3Params {
  return {
    theme: searchParams.get('theme') ?? '',
    bookId: searchParams.get('book') ?? '',
    musicId: searchParams.get('music') ?? '',
    movieId: searchParams.get('movie') ?? '',
  }
}
