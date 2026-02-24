import { useState, useCallback, useRef } from 'react'

function getClientId(): string {
  let id = localStorage.getItem('clientId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('clientId', id)
  }
  return id
}

function getReactedMap(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem('reactions') ?? '{}') as Record<
      string,
      boolean
    >
  } catch {
    return {}
  }
}

function setReactedMap(shareId: string, reacted: boolean): void {
  const map = getReactedMap()
  if (reacted) {
    map[shareId] = true
  } else {
    delete map[shareId]
  }
  localStorage.setItem('reactions', JSON.stringify(map))
}

export function useReaction(shareId: string, initialCount: number) {
  const [count, setCount] = useState(initialCount)
  const [reacted, setReacted] = useState(() => {
    const map = getReactedMap()
    return !!map[shareId]
  })
  const inflightRef = useRef(false)

  const toggleReaction = useCallback(() => {
    if (inflightRef.current) return
    inflightRef.current = true

    const wasReacted = reacted
    const prevCount = count

    // Optimistic update
    const nextReacted = !wasReacted
    const nextCount = nextReacted ? prevCount + 1 : prevCount - 1
    setReacted(nextReacted)
    setCount(nextCount)
    setReactedMap(shareId, nextReacted)

    const clientId = getClientId()

    fetch(`/api/shares/${shareId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, toggle: wasReacted }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Reaction failed')
        const json = (await res.json()) as {
          ok: boolean
          data: { count: number; reacted: boolean }
        }
        if (json.ok) {
          setCount(json.data.count)
          setReacted(json.data.reacted)
          setReactedMap(shareId, json.data.reacted)
        } else {
          throw new Error('Reaction failed')
        }
      })
      .catch(() => {
        // Revert on failure
        setReacted(wasReacted)
        setCount(prevCount)
        setReactedMap(shareId, wasReacted)
      })
      .finally(() => {
        inflightRef.current = false
      })
  }, [shareId, reacted, count])

  return { count, reacted, toggleReaction }
}
