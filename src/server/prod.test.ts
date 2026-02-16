// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

vi.mock('@hono/node-server', () => ({
  serve: vi.fn(),
}))
vi.mock('@hono/node-server/serve-static', () => ({
  serveStatic: vi.fn(() => vi.fn()),
}))
vi.mock('./index.ts', () => {
  const { Hono } = require('hono')
  return { default: new Hono() }
})

describe('prod server', () => {
  it('calls serve with port from PORT env var', async () => {
    process.env['PORT'] = '3456'
    const { serve } = await import('@hono/node-server')
    await import('./prod.ts')
    expect(serve).toHaveBeenCalledWith(
      expect.objectContaining({ port: 3456 }),
      expect.any(Function),
    )
    delete process.env['PORT']
  })

  it('defaults to port 8000 when PORT is not set', async () => {
    vi.resetModules()

    vi.mock('@hono/node-server', () => ({
      serve: vi.fn(),
    }))
    vi.mock('@hono/node-server/serve-static', () => ({
      serveStatic: vi.fn(() => vi.fn()),
    }))
    vi.mock('./index.ts', () => {
      const { Hono } = require('hono')
      return { default: new Hono() }
    })

    delete process.env['PORT']
    const { serve } = await import('@hono/node-server')
    await import('./prod.ts')
    expect(serve).toHaveBeenCalledWith(
      expect.objectContaining({ port: 8000 }),
      expect.any(Function),
    )
  })

  it('serves static files from dist directory', async () => {
    vi.resetModules()

    vi.mock('@hono/node-server', () => ({
      serve: vi.fn(),
    }))
    vi.mock('@hono/node-server/serve-static', () => ({
      serveStatic: vi.fn(() => vi.fn()),
    }))
    vi.mock('./index.ts', () => {
      const { Hono } = require('hono')
      return { default: new Hono() }
    })

    const { serveStatic } = await import('@hono/node-server/serve-static')
    await import('./prod.ts')
    expect(serveStatic).toHaveBeenCalledWith(
      expect.objectContaining({ root: './dist' }),
    )
  })
})
