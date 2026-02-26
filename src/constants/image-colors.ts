/**
 * Color constants for canvas/image rendering.
 * These mirror CSS custom properties but are needed as plain strings
 * because html2canvas / SVG rendering cannot resolve CSS variables.
 */

/** Dark purple-rose background for share images */
export const CANVAS_DARK = '#4A1942'

/** Text primary color (matches --color-text-primary) */
export const TEXT_PRIMARY = '#831843'

/** Text secondary color (matches --color-text-secondary) */
export const TEXT_SECONDARY = '#9CA3AF'

/** Primary light color (matches --color-primary-light) */
export const PRIMARY_LIGHT = '#F9A8D4'

/** Primary color (matches --color-primary) */
export const PRIMARY = '#EC4899'

/** Primary dark color (matches --color-primary-dark) */
export const PRIMARY_DARK = '#BE185D'

/** Rank badge background (matches --color-rank-badge) */
export const RANK_BADGE_BG = '#FBCFE8'

/** Rank badge text (matches --color-rank-text) */
export const RANK_TEXT = '#9D174D'

/** Secondary color (matches --color-secondary) */
export const SECONDARY = '#8B5CF6'

/** Accent color (matches --color-accent) */
export const ACCENT = '#14B8A6'

/** Muted text for canvas (lavender muted tone on dark bg) */
export const CANVAS_TEXT_MUTED = '#D8B4FE'

/** Image canvas colors used in ImageWorkCard */
export const IMAGE_COLORS = {
  textPrimary: '#fff',
  textSecondary: '#FBCFE8',
  textMuted: '#D8B4FE',
  textSubheading: '#FCE7F3',
  badgeBg: TEXT_PRIMARY,
  rankBadgeBg: RANK_BADGE_BG,
  canvasBg: CANVAS_DARK,
} as const
