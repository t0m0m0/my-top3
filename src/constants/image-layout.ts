import type { MediaCategory } from '../types/common'

export type SlotPosition = 'top' | 'bottom-left' | 'bottom-right'
export type LayoutConfig = Record<SlotPosition, MediaCategory>

export const IMAGE_SIZE = 1080
export const HALF = IMAGE_SIZE / 2
export const SEP = 2

export const CATEGORY_COLORS: Record<MediaCategory, string> = {
  book: '#c084fc',
  music: '#f472b6',
  movie: '#fda4af',
}

export const CATEGORY_BORDER_COLORS: Record<MediaCategory, string> = {
  book: 'rgba(192,132,252,0.4)',
  music: 'rgba(244,114,182,0.4)',
  movie: 'rgba(253,164,175,0.4)',
}

/** @deprecated Use CANVAS_PLACEHOLDER from constants/placeholders instead */
export { CANVAS_PLACEHOLDER as NO_IMAGE_SRC } from './placeholders'

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

// Re-export from category.ts (single source of truth)
export { CATEGORY_LABELS_DISPLAY as CATEGORY_LABELS } from './category'

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
