import { useState } from 'react'

/**
 * Manages mobile collapse state for the selection area.
 *
 * - Auto-expands when no items are selected.
 * - Auto-collapses when items are selected.
 * - Resets manual override when selection count changes.
 */
export function useMobileCollapse(selectedCount: number) {
  // null = no manual override; derive from selection count
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null)
  const [prevCount, setPrevCount] = useState(selectedCount)

  // Reset manual override when selection count changes
  // (React-recommended "adjusting state during rendering" pattern)
  if (prevCount !== selectedCount) {
    setPrevCount(selectedCount)
    setManualExpanded(null)
  }

  // Auto: collapsed when items selected, expanded when empty
  const expanded = manualExpanded ?? selectedCount === 0

  const toggle = () => {
    setManualExpanded((prev) => !(prev ?? expanded))
  }

  return { expanded, toggle }
}
