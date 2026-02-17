import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import api from './index.ts'
import { injectOgpTags } from './ogp.ts'

const app = new Hono()

// Mount API routes
app.route('/', api)

// OGP meta tag injection for /my-no1s share URLs
app.get('/my-no1s', async (c) => {
  const indexPath = path.resolve('./dist/index.html')
  let html: string
  try {
    html = fs.readFileSync(indexPath, 'utf-8')
  } catch {
    // Fallback to static serving if file not found
    return c.notFound()
  }

  const url = c.req.url
  const searchParams = new URL(url).searchParams

  try {
    html = await injectOgpTags(html, url, searchParams)
  } catch (e) {
    console.error('[ogp] Failed to inject OGP tags:', e)
    // Return original HTML without OGP tags rather than failing
  }

  return c.html(html)
})

// Serve static files from dist/
app.use('*', serveStatic({ root: './dist' }))

// SPA fallback: serve index.html for non-API routes
app.use('*', serveStatic({ root: './dist', path: 'index.html' }))

const port = Number(process.env['PORT']) || 8000

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})
