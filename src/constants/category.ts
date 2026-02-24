import type { MediaCategory } from '../types/common'

export const CATEGORY_LABELS_JA: Record<MediaCategory, string> = {
  book: '書籍',
  music: '音楽',
  movie: '映画',
}

export const CATEGORY_LABELS_DISPLAY: Record<MediaCategory, string> = {
  book: '📚 本',
  music: '🎵 音楽',
  movie: '🎬 映画',
}

export const API_ENDPOINTS: Record<MediaCategory, string> = {
  book: '/api/books',
  music: '/api/music',
  movie: '/api/movies',
}

export const CATEGORIES: MediaCategory[] = ['book', 'music', 'movie']
