import { Hono } from 'hono'

const debugLogApp = new Hono()

debugLogApp.post('/', async (c) => {
  let body: Record<string, unknown>
  try {
    body = (await c.req.json()) as Record<string, unknown>
  } catch {
    return c.json({ ok: false, error: 'invalid json' }, 400)
  }
  const { level, args, timestamp, url } = body as {
    level: string
    args: unknown[]
    timestamp: string
    url: string
  }

  const tag = `[browser:${level}]`
  const loc = url ? ` (${url})` : ''
  console.log(`${tag}${loc} ${timestamp}`)
  for (const arg of args) {
    if (typeof arg === 'string') {
      console.log(`  ${arg}`)
    } else {
      console.log(`  ${JSON.stringify(arg, null, 2)}`)
    }
  }

  return c.json({ ok: true })
})

export { debugLogApp }
