import { describe, it, expect } from 'vitest'
import {
  IMAGE_SIZE,
  HALF,
  SEP,
  PORTRAIT_WIDTH,
  PORTRAIT_HEIGHT,
  CATEGORY_COLORS,
  CATEGORY_BORDER_COLORS,
  NO_IMAGE_SRC,
  DEFAULT_LAYOUT,
  DEFAULT_VERTICAL_LAYOUT,
  SLOT_LABELS,
  VERTICAL_SLOT_LABELS,
  CATEGORY_LABELS,
  SLOT_STYLES,
  VERTICAL_SLOT_STYLES,
  VERTICAL_SLOT_POSITIONS,
} from './image-layout'
import type {
  SlotPosition,
  VerticalSlotPosition,
  LayoutConfig,
  VerticalLayoutConfig,
} from './image-layout'

describe('image-layout constants', () => {
  describe('dimensions', () => {
    it('IMAGE_SIZE is 1080', () => {
      expect(IMAGE_SIZE).toBe(1080)
    })

    it('HALF is half of IMAGE_SIZE', () => {
      expect(HALF).toBe(IMAGE_SIZE / 2)
    })

    it('SEP is 2', () => {
      expect(SEP).toBe(2)
    })
  })

  describe('CATEGORY_COLORS', () => {
    it('has colors for all three categories', () => {
      expect(CATEGORY_COLORS.book).toBeDefined()
      expect(CATEGORY_COLORS.music).toBeDefined()
      expect(CATEGORY_COLORS.movie).toBeDefined()
    })
  })

  describe('CATEGORY_BORDER_COLORS', () => {
    it('has border colors for all three categories', () => {
      expect(CATEGORY_BORDER_COLORS.book).toBeDefined()
      expect(CATEGORY_BORDER_COLORS.music).toBeDefined()
      expect(CATEGORY_BORDER_COLORS.movie).toBeDefined()
    })
  })

  describe('NO_IMAGE_SRC', () => {
    it('is a data URI SVG', () => {
      expect(NO_IMAGE_SRC).toMatch(/^data:image\/svg\+xml;base64,/)
    })
  })

  describe('DEFAULT_LAYOUT', () => {
    it('has music on top, book bottom-left, movie bottom-right', () => {
      expect(DEFAULT_LAYOUT).toEqual({
        top: 'music',
        'bottom-left': 'book',
        'bottom-right': 'movie',
      } satisfies LayoutConfig)
    })
  })

  describe('SLOT_LABELS', () => {
    it('has Japanese labels for all slot positions', () => {
      expect(SLOT_LABELS.top).toBe('上')
      expect(SLOT_LABELS['bottom-left']).toBe('左下')
      expect(SLOT_LABELS['bottom-right']).toBe('右下')
    })
  })

  describe('CATEGORY_LABELS', () => {
    it('has Japanese labels with emoji', () => {
      expect(CATEGORY_LABELS.book).toBe('📚 本')
      expect(CATEGORY_LABELS.music).toBe('🎵 音楽')
      expect(CATEGORY_LABELS.movie).toBe('🎬 映画')
    })
  })

  describe('SLOT_STYLES', () => {
    it('top slot spans full width and upper half', () => {
      const top = SLOT_STYLES.top
      expect(top.top).toBe(0)
      expect(top.left).toBe(0)
      expect(top.width).toBe(IMAGE_SIZE)
      expect(top.height).toBe(HALF)
    })

    it('bottom-left slot starts at lower half', () => {
      const bl = SLOT_STYLES['bottom-left']
      expect(bl.top).toBe(HALF + SEP)
      expect(bl.left).toBe(0)
    })

    it('bottom-right slot is offset to right', () => {
      const br = SLOT_STYLES['bottom-right']
      expect(br.top).toBe(HALF + SEP)
      expect(br.left).toBe(HALF + SEP / 2)
    })

    it('top slot has larger font sizes than bottom slots', () => {
      expect(SLOT_STYLES.top.titleSize).toBeGreaterThan(
        SLOT_STYLES['bottom-left'].titleSize,
      )
      expect(SLOT_STYLES.top.subtitleSize).toBeGreaterThan(
        SLOT_STYLES['bottom-left'].subtitleSize,
      )
    })

    it('exports SlotPosition type correctly', () => {
      const slot: SlotPosition = 'top'
      expect(SLOT_STYLES[slot]).toBeDefined()
    })
  })

  describe('portrait dimensions', () => {
    it('PORTRAIT_WIDTH is 1080', () => {
      expect(PORTRAIT_WIDTH).toBe(1080)
    })

    it('PORTRAIT_HEIGHT is 1920', () => {
      expect(PORTRAIT_HEIGHT).toBe(1920)
    })
  })

  describe('DEFAULT_VERTICAL_LAYOUT', () => {
    it('has music on v-top, book v-middle, movie v-bottom', () => {
      expect(DEFAULT_VERTICAL_LAYOUT).toEqual({
        'v-top': 'music',
        'v-middle': 'book',
        'v-bottom': 'movie',
      } satisfies VerticalLayoutConfig)
    })
  })

  describe('VERTICAL_SLOT_LABELS', () => {
    it('has Japanese labels for vertical slot positions', () => {
      expect(VERTICAL_SLOT_LABELS['v-top']).toBe('上')
      expect(VERTICAL_SLOT_LABELS['v-middle']).toBe('中')
      expect(VERTICAL_SLOT_LABELS['v-bottom']).toBe('下')
    })
  })

  describe('VERTICAL_SLOT_STYLES', () => {
    it('all vertical slots span full width', () => {
      for (const slot of VERTICAL_SLOT_POSITIONS) {
        expect(VERTICAL_SLOT_STYLES[slot].width).toBe(PORTRAIT_WIDTH)
      }
    })

    it('v-top slot starts at 0', () => {
      expect(VERTICAL_SLOT_STYLES['v-top'].top).toBe(0)
    })

    it('vertical slots cover the full portrait height', () => {
      const totalHeight =
        VERTICAL_SLOT_STYLES['v-top'].height +
        SEP +
        VERTICAL_SLOT_STYLES['v-middle'].height +
        SEP +
        VERTICAL_SLOT_STYLES['v-bottom'].height
      expect(totalHeight).toBe(PORTRAIT_HEIGHT)
    })

    it('exports VerticalSlotPosition type correctly', () => {
      const slot: VerticalSlotPosition = 'v-top'
      expect(VERTICAL_SLOT_STYLES[slot]).toBeDefined()
    })
  })
})
