const MAX_QUERY_LENGTH = 200
const MAX_START_INDEX = 10000

export function validateSearchQuery(query: string): string | null {
  if (query.length > MAX_QUERY_LENGTH) {
    return `Query too long (max ${MAX_QUERY_LENGTH} characters)`
  }
  return null
}

export function clampStartIndex(raw: string): number {
  const value = Number(raw) || 0
  return Math.max(0, Math.min(MAX_START_INDEX, value))
}

export { MAX_QUERY_LENGTH, MAX_START_INDEX }
