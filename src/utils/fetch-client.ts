import type { ApiError, ApiErrorKind, Result } from '../types/common.ts'

const DEFAULT_TIMEOUT_MS = 10_000

export async function fetchJson<T>(
  url: string,
  options: {
    signal?: AbortSignal
    timeoutMs?: number
    validate?: (data: unknown) => T
  } = {},
): Promise<Result<T>> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS, validate } = options

  let timedOut = false
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => {
    timedOut = true
    timeoutController.abort()
  }, timeoutMs)

  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal

  try {
    const response = await fetch(url, { signal: combinedSignal })

    if (!response.ok) {
      return { ok: false, error: mapHttpError(response.status) }
    }

    const raw: unknown = await response.json()

    if (validate) {
      try {
        const data = validate(raw)
        return { ok: true, data }
      } catch (err) {
        return {
          ok: false,
          error: {
            kind: 'parse-error',
            message:
              err instanceof Error ? err.message : 'Response validation failed',
          },
        }
      }
    }

    return { ok: true, data: raw as T }
  } catch (err) {
    return { ok: false, error: mapFetchError(err, timedOut) }
  } finally {
    clearTimeout(timeoutId)
  }
}

function mapHttpError(status: number): ApiError {
  const kind: ApiErrorKind =
    status === 401 || status === 403
      ? 'auth-error'
      : status === 429
        ? 'rate-limited'
        : status === 404
          ? 'not-found'
          : status >= 500
            ? 'server-error'
            : 'unknown'

  return { kind, message: `HTTP ${status}`, status }
}

function mapFetchError(err: unknown, timedOut: boolean): ApiError {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return timedOut
      ? { kind: 'timeout', message: 'Request timed out' }
      : { kind: 'aborted', message: 'Request was aborted' }
  }
  if (err instanceof TypeError) {
    return { kind: 'network', message: err.message }
  }
  if (err instanceof SyntaxError) {
    return { kind: 'parse-error', message: err.message }
  }
  return {
    kind: 'unknown',
    message: err instanceof Error ? err.message : String(err),
  }
}
