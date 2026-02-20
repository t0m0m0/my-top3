export function assertObject(
  data: unknown,
  label: string,
): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error(`Expected object response from ${label}`)
  }
  return data as Record<string, unknown>
}

export function assertField<T>(
  obj: Record<string, unknown>,
  field: string,
  type: string,
  label: string,
): T {
  if (typeof obj[field] !== type) {
    throw new Error(`Missing or invalid ${field} in ${label}`)
  }
  return obj[field] as T
}

export function assertArray(
  obj: Record<string, unknown>,
  field: string,
  label: string,
): unknown[] {
  if (!Array.isArray(obj[field])) {
    throw new Error(`Missing or invalid ${field} in ${label}`)
  }
  return obj[field] as unknown[]
}

export function assertOptionalArray(
  obj: Record<string, unknown>,
  field: string,
  label: string,
): unknown[] | undefined {
  if (obj[field] !== undefined && !Array.isArray(obj[field])) {
    throw new Error(`Invalid ${field} field in ${label}`)
  }
  return obj[field] as unknown[] | undefined
}
