import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import api from './index.ts'
import { injectOgpTags } from './ogp.ts'
import { createShareStore } from './share-store.ts'
import { deleteShareImage, purgeOrphanImages } from './share-image-cleanup.ts'

const imagesDir = path.resolve(process.cwd(), 'data', 'images')

/** Build public-facing URL from the request, respecting reverse proxy headers */
function publicUrl(c: {
  req: { url: string; header(name: string): string | undefined }
}): string {
  const proto = c.req.header('x-forwarded-proto') ?? 'http'
  const host =
    c.req.header('x-forwarded-host') ?? c.req.header('host') ?? 'localhost:8000'
  const pathname = new URL(c.req.url).pathname + new URL(c.req.url).search
  return `${proto}://${host}${pathname}`
}

const sharesDataPath =
  process.env['SHARES_DATA_PATH'] ||
  path.resolve(process.cwd(), 'data', 'shares.db')

const shareStore = createShareStore(sharesDataPath, {
  onDelete: (id) => deleteShareImage(imagesDir, id),
})

// Periodic orphan image cleanup (every 6 hours)
const ORPHAN_CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000
const orphanCleanupTimer = setInterval(() => {
  try {
    const validIds = new Set(shareStore.getAllIds())
    const removed = purgeOrphanImages(imagesDir, validIds)
    if (removed > 0) {
      console.log(`[cleanup] Removed ${removed} orphan image(s)`)
    }
  } catch (e) {
    console.error('[cleanup] Failed to purge orphan images:', e)
  }
}, ORPHAN_CLEANUP_INTERVAL_MS)
orphanCleanupTimer.unref()

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

  const url = publicUrl(c)
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

    // Check if OGP image exists for this share
    const imageFile = path.join(imagesDir, `${id}.png`)
    const url = publicUrl(c)
    const baseUrl = url.replace(/\/s\/.*$/, '')
    const imageUrl = fs.existsSync(imageFile)
      ? `${baseUrl}/api/shares/${id}/image`
      : undefined

    try {
      html = await injectOgpTags(html, url, searchParams, imageUrl)
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

const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})

// Graceful shutdown: close SQLite connection on process termination
const shutdown = () => {
  console.log('Shutting down...')
  shareStore.close()
  server.close()
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
