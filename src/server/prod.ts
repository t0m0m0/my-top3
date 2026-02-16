import 'dotenv/config'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import api from './index.ts'

const app = new Hono()

// Mount API routes
app.route('/', api)

// Serve static files from dist/
app.use('*', serveStatic({ root: './dist' }))

// SPA fallback: serve index.html for non-API routes
app.use('*', serveStatic({ root: './dist', path: 'index.html' }))

const port = Number(process.env['PORT']) || 8000

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})
