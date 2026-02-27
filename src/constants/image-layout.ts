import type { MediaCategory } from '../types/common'
import { PRIMARY_LIGHT, SECONDARY, ACCENT } from './image-colors'

export type AspectRatio = 'landscape' | 'portrait'

export type SlotPosition = 'top' | 'bottom-left' | 'bottom-right'
export type VerticalSlotPosition = 'v-top' | 'v-middle' | 'v-bottom'
export type AnySlotPosition = SlotPosition | VerticalSlotPosition
export type LayoutConfig = Record<SlotPosition, MediaCategory>
export type VerticalLayoutConfig = Record<VerticalSlotPosition, MediaCategory>

export const IMAGE_SIZE = 1080
export const HALF = IMAGE_SIZE / 2
export const SEP = 2

/** Portrait (9:16) dimensions */
export const PORTRAIT_WIDTH = 1080
export const PORTRAIT_HEIGHT = 1920
/** Available height for slots after subtracting 2 separators */
const V_AVAILABLE = PORTRAIT_HEIGHT - SEP * 2 // 1916
const V_SLOT_BASE = Math.floor(V_AVAILABLE / 3) // 638
const V_SLOT_REM = V_AVAILABLE - V_SLOT_BASE * 3 // 2

export const CATEGORY_COLORS: Record<MediaCategory, string> = {
  book: PRIMARY_LIGHT,
  music: SECONDARY,
  movie: ACCENT,
}

export const CATEGORY_BORDER_COLORS: Record<MediaCategory, string> = {
  book: `${PRIMARY_LIGHT}66`,
  music: `${SECONDARY}66`,
  movie: `${ACCENT}66`,
}

/** @deprecated Use CANVAS_PLACEHOLDER from constants/placeholders instead */
export { CANVAS_PLACEHOLDER as NO_IMAGE_SRC } from './placeholders'

export const DEFAULT_LAYOUT: LayoutConfig = {
  top: 'music',
  'bottom-left': 'book',
  'bottom-right': 'movie',
}

export const DEFAULT_VERTICAL_LAYOUT: VerticalLayoutConfig = {
  'v-top': 'music',
  'v-middle': 'book',
  'v-bottom': 'movie',
}

export const SLOT_LABELS: Record<SlotPosition, string> = {
  top: '上',
  'bottom-left': '左下',
  'bottom-right': '右下',
}

export const VERTICAL_SLOT_LABELS: Record<VerticalSlotPosition, string> = {
  'v-top': '上',
  'v-middle': '中',
  'v-bottom': '下',
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

// Distribute remaining pixels to the first slot(s)
const V_H1 = V_SLOT_BASE + Math.min(V_SLOT_REM, 1) // 639
const V_H2 = V_SLOT_BASE + (V_SLOT_REM > 1 ? 1 : 0) // 639
const V_H3 = V_AVAILABLE - V_H1 - V_H2 // 638

export const VERTICAL_SLOT_STYLES: Record<VerticalSlotPosition, SlotStyle> = {
  'v-top': {
    top: 0,
    left: 0,
    width: PORTRAIT_WIDTH,
    height: V_H1,
    titleSize: 44,
    subtitleSize: 20,
    padding: '36px 48px',
  },
  'v-middle': {
    top: V_H1 + SEP,
    left: 0,
    width: PORTRAIT_WIDTH,
    height: V_H2,
    titleSize: 44,
    subtitleSize: 20,
    padding: '36px 48px',
  },
  'v-bottom': {
    top: V_H1 + SEP + V_H2 + SEP,
    left: 0,
    width: PORTRAIT_WIDTH,
    height: V_H3,
    titleSize: 44,
    subtitleSize: 20,
    padding: '36px 48px',
  },
}

export const SLOT_POSITIONS: SlotPosition[] = [
  'top',
  'bottom-left',
  'bottom-right',
]

export const VERTICAL_SLOT_POSITIONS: VerticalSlotPosition[] = [
  'v-top',
  'v-middle',
  'v-bottom',
]
