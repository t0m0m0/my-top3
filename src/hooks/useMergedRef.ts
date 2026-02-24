import { useCallback } from 'react'
import type { Ref, RefCallback } from 'react'

type MergeableRef<T> = Ref<T> | undefined

function setRef<T>(ref: MergeableRef<T>, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref && 'current' in ref) {
    ;(ref as React.MutableRefObject<T | null>).current = value
  }
}

export function useMergedRef<T>(
  ...refs: ReadonlyArray<MergeableRef<T>>
): RefCallback<T> {
  return useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        setRef(ref, node)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  )
}
