import { useState, useCallback } from 'react'
import type { MediaCategory } from '../types/common'
import type {
  LayoutConfig,
  SlotPosition,
  VerticalLayoutConfig,
  VerticalSlotPosition,
} from '../constants/image-layout'
import {
  DEFAULT_LAYOUT,
  DEFAULT_VERTICAL_LAYOUT,
  SLOT_POSITIONS,
  VERTICAL_SLOT_POSITIONS,
} from '../constants/image-layout'

export function useLayoutSwap() {
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT)

  const handleLayoutChange = useCallback(
    (slot: SlotPosition, newCategory: MediaCategory) => {
      setLayout((prev) => {
        const otherSlot = SLOT_POSITIONS.find((s) => prev[s] === newCategory)
        if (!otherSlot || otherSlot === slot) return prev

        return {
          ...prev,
          [slot]: newCategory,
          [otherSlot]: prev[slot],
        }
      })
    },
    [],
  )

  return { layout, handleLayoutChange }
}

export function useVerticalLayoutSwap() {
  const [layout, setLayout] = useState<VerticalLayoutConfig>(
    DEFAULT_VERTICAL_LAYOUT,
  )

  const handleLayoutChange = useCallback(
    (slot: VerticalSlotPosition, newCategory: MediaCategory) => {
      setLayout((prev) => {
        const otherSlot = VERTICAL_SLOT_POSITIONS.find(
          (s) => prev[s] === newCategory,
        )
        if (!otherSlot || otherSlot === slot) return prev

        return {
          ...prev,
          [slot]: newCategory,
          [otherSlot]: prev[slot],
        }
      })
    },
    [],
  )

  return { layout, handleLayoutChange }
}
