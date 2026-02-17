import { useState, useCallback } from 'react'
import type { MediaCategory } from '../types/common'
import type { LayoutConfig, SlotPosition } from '../constants/image-layout'
import { DEFAULT_LAYOUT, SLOT_POSITIONS } from '../constants/image-layout'

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
