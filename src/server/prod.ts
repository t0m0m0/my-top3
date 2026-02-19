import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import api from './index.ts'
import { injectOgpTags } from './ogp.ts'
import { createShareStore } from './share-store.ts'

const sharesDataPath =
  process.env['SHARES_DATA_PATH'] ||
  path.resolve(process.cwd(), 'data', 'shares.json')
const shareStore = createShareStore(sharesDataPath)

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

// OGP meta tag injection for short share URLs
app.get('/s/:id', async (c) => {
  const indexPath = path.resolve('./dist/index.html')
  let html: string
  try {
    html = fs.readFileSync(indexPath, 'utf-8')
  } catch {
    return c.notFound()
  }

  const id = c.req.param('id')
  const params = shareStore.get(id)

  if (params) {
    // Build equivalent search params for OGP injection
    const searchParams = new URLSearchParams()
    if (params.theme) searchParams.set('theme', params.theme)
    if (params.bookId) searchParams.set('book', params.bookId)
    if (params.musicId) searchParams.set('music', params.musicId)
    if (params.movieId) searchParams.set('movie', params.movieId)

    try {
      html = await injectOgpTags(html, c.req.url, searchParams)
    } catch (e) {
      console.error('[ogp] Failed to inject OGP tags for short URL:', e)
    }
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
