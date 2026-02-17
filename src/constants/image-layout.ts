import type { MediaCategory } from '../types/common'

export type SlotPosition = 'top' | 'bottom-left' | 'bottom-right'
export type LayoutConfig = Record<SlotPosition, MediaCategory>

export const IMAGE_SIZE = 1080
export const HALF = IMAGE_SIZE / 2
export const SEP = 2

export const CATEGORY_COLORS: Record<MediaCategory, string> = {
  book: '#f97316',
  music: '#10b981',
  movie: '#a855f7',
}

export const CATEGORY_BORDER_COLORS: Record<MediaCategory, string> = {
  book: 'rgba(249,115,22,0.4)',
  music: 'rgba(16,185,129,0.4)',
  movie: 'rgba(168,85,247,0.4)',
}

export const NO_IMAGE_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

export const DEFAULT_LAYOUT: LayoutConfig = {
  top: 'music',
  'bottom-left': 'book',
  'bottom-right': 'movie',
}

export const SLOT_LABELS: Record<SlotPosition, string> = {
  top: '上',
  'bottom-left': '左下',
  'bottom-right': '右下',
}

export const CATEGORY_LABELS: Record<MediaCategory, string> = {
  book: 'BOOK',
  music: 'MUSIC',
  movie: 'MOVIE',
}

export type SlotStyle = {
  top: number
  left: number
  width: number
  height: number
  titleSize: number
  subtitleSize: number
  padding: string
}

export const SLOT_STYLES: Record<SlotPosition, SlotStyle> = {
  top: {
    top: 0,
    left: 0,
    width: IMAGE_SIZE,
    height: HALF,
    titleSize: 48,
    subtitleSize: 20,
    padding: '40px 48px',
  },
  'bottom-left': {
    top: HALF + SEP,
    left: 0,
    width: HALF - SEP / 2,
    height: HALF - SEP,
    titleSize: 32,
    subtitleSize: 16,
    padding: '24px 28px',
  },
  'bottom-right': {
    top: HALF + SEP,
    left: HALF + SEP / 2,
    width: HALF - SEP / 2,
    height: HALF - SEP,
    titleSize: 30,
    subtitleSize: 16,
    padding: '24px 28px',
  },
}

export const SLOT_POSITIONS: SlotPosition[] = [
  'top',
  'bottom-left',
  'bottom-right',
]
