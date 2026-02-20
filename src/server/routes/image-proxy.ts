import { Hono } from 'hono'

export const ALLOWED_HOSTS = [
  'books.google.com',
  'books.googleusercontent.com',
  'lastfm.freetls.fastly.net',
  'image.tmdb.org',
] as const

const PROXY_TIMEOUT_MS = 10_000
const CACHE_MAX_AGE = 86400 // 1 day
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024 // 10MB

function isAllowedHost(hostname: string): boolean {
  return (ALLOWED_HOSTS as readonly string[]).includes(hostname)
}

function isImageContentType(contentType: string | null): boolean {
  if (!contentType) return false
  return contentType.startsWith('image/')
}

/**
 * ストリーミングでレスポンスを読み込み、上限を超えたら null を返す。
 */
async function readWithSizeLimit(
  response: Response,
  maxSize: number,
): Promise<Uint8Array | null> {
  const reader = response.body?.getReader()
  if (!reader) {
    // body がない場合は空を返す
    return new Uint8Array(0)
  }

  const chunks: Uint8Array[] = []
  let totalSize = 0

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      totalSize += value.byteLength
      if (totalSize > maxSize) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } catch {
    await reader.cancel()
    throw new Error('ストリーム読み込み中にエラーが発生しました')
  }

  const result = new Uint8Array(totalSize)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }
  return result
}

export const imageProxyApp = new Hono()

imageProxyApp.get('/proxy', async (c) => {
  const urlParam = c.req.query('url')

  if (!urlParam) {
    return c.json(
      {
        ok: false,
        error: { kind: 'unknown', message: 'urlパラメータが必要です' },
      },
      400,
    )
  }

  let parsed: URL
  try {
    parsed = new URL(urlParam)
  } catch {
    return c.json(
      { ok: false, error: { kind: 'unknown', message: '無効なURLです' } },
      400,
    )
  }

  if (parsed.protocol !== 'https:') {
    return c.json(
      {
        ok: false,
        error: { kind: 'unknown', message: '許可されていないホストです' },
      },
      403,
    )
  }

  if (!isAllowedHost(parsed.hostname)) {
    return c.json(
      {
        ok: false,
        error: { kind: 'unknown', message: '許可されていないホストです' },
      },
      403,
    )
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS)

    const upstream = await fetch(urlParam, {
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!upstream.ok) {
      return c.json(
        {
          ok: false,
          error: {
            kind: 'unknown',
            message: `上流サーバーがエラーを返しました (status: ${upstream.status})`,
          },
        },
        502,
      )
    }

    const contentType = upstream.headers.get('Content-Type')
    if (!isImageContentType(contentType)) {
      return c.json(
        {
          ok: false,
          error: {
            kind: 'unknown',
            message: '画像以外のコンテンツタイプです',
          },
        },
        400,
      )
    }

    // Content-Length が明示されていて上限超過なら即拒否
    const contentLength = upstream.headers.get('Content-Length')
    if (contentLength && Number(contentLength) > MAX_RESPONSE_SIZE) {
      return c.json(
        {
          ok: false,
          error: {
            kind: 'unknown',
            message: `レスポンスサイズが上限（${MAX_RESPONSE_SIZE} bytes）を超えています`,
          },
        },
        413,
      )
    }

    // ストリーミング読み込みでサイズ制限を強制
    const body = await readWithSizeLimit(upstream, MAX_RESPONSE_SIZE)
    if (body === null) {
      return c.json(
        {
          ok: false,
          error: {
            kind: 'unknown',
            message: `レスポンスサイズが上限（${MAX_RESPONSE_SIZE} bytes）を超えています`,
          },
        },
        413,
      )
    }

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType!,
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, immutable`,
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('[image-proxy] fetch error:', err)
    return c.json(
      {
        ok: false,
        error: { kind: 'unknown', message: '画像の取得に失敗しました' },
      },
      502,
    )
  }
})
