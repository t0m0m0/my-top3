import type { MediaCategory } from '../types/common'

/** Generic grey placeholder (used in WorkCard etc.) */
export const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="176" fill="%23e5e7eb"><rect width="128" height="176"/><text x="64" y="92" text-anchor="middle" fill="%239ca3af" font-size="12">No Image</text></svg>'

/** Category-specific placeholders with emoji icons */
export const CATEGORY_PLACEHOLDERS: Record<MediaCategory, string> = {
  book: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect fill='%23fef3c7' width='120' height='160'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%23d97706' font-family='sans-serif' font-size='32'%3E📖%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%23b45309' font-family='sans-serif' font-size='11'%3ENo Image%3C/text%3E%3C/svg%3E",
  music:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect fill='%23dbeafe' width='120' height='160'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%232563eb' font-family='sans-serif' font-size='32'%3E🎵%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%231d4ed8' font-family='sans-serif' font-size='11'%3ENo Image%3C/text%3E%3C/svg%3E",
  movie:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect fill='%23ede9fe' width='120' height='160'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%237c3aed' font-family='sans-serif' font-size='32'%3E🎬%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%236d28d9' font-family='sans-serif' font-size='11'%3ENo Image%3C/text%3E%3C/svg%3E",
}

/** Dark-themed placeholder for canvas/image generation (base64) */
export const CANVAS_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
