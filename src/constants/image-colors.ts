/**
 * Color constants for canvas/image rendering.
 * These mirror CSS custom properties but are needed as plain strings
 * because html2canvas / SVG rendering cannot resolve CSS variables.
 */

/** Dark warm background for share images */
export const CANVAS_DARK = '#2a2420'

/** Text primary color (matches --color-text-primary) */
export const TEXT_PRIMARY = '#3d3028'

/** Text secondary color (matches --color-text-secondary) */
export const TEXT_SECONDARY = '#8c7e72'

/** Primary light color (matches --color-primary-light) */
export const PRIMARY_LIGHT = '#c4a882'

/** Primary color (matches --color-primary) */
export const PRIMARY = '#a0845e'

/** Primary dark color (matches --color-primary-dark) */
export const PRIMARY_DARK = '#7c6544'

/** Rank badge background (matches --color-rank-badge) */
export const RANK_BADGE_BG = '#e8d5b8'

/** Rank badge text (matches --color-rank-text) */
export const RANK_TEXT = '#5c4a2e'

/** Secondary color (matches --color-secondary) */
export const SECONDARY = '#d4829c'

/** Accent color (matches --color-accent) */
export const ACCENT = '#7dad8e'

/** Muted text for canvas (warm muted tone on dark bg) */
export const CANVAS_TEXT_MUTED = '#a89888'

/** Image canvas colors used in ImageWorkCard */
export const IMAGE_COLORS = {
  textPrimary: '#fff',
  textSecondary: '#e8ddd0',
  textMuted: '#c4b5a5',
  textSubheading: '#f0e8de',
  badgeBg: TEXT_PRIMARY,
  rankBadgeBg: RANK_BADGE_BG,
  canvasBg: CANVAS_DARK,
} as const
