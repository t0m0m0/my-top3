import { Hono } from 'hono'

export const ALLOWED_HOSTS = [
  'books.google.com',
  'books.googleusercontent.com',
  'i.scdn.co',
  'image.tmdb.org',
] as const

const PROXY_TIMEOUT_MS = 10_000
const CACHE_MAX_AGE = 86400 // 1 day

function isAllowedHost(hostname: string): boolean {
  return (ALLOWED_HOSTS as readonly string[]).includes(hostname)
}

function isImageContentType(contentType: string | null): boolean {
  if (!contentType) return false
  return contentType.startsWith('image/')
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

    const body = await upstream.arrayBuffer()

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
