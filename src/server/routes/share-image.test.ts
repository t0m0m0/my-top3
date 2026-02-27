// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createShareImageApp } from './share-image'
import type { ShareExistsCheck } from './share-image'

describe('share-image route', () => {
  let tmpDir: string
  let imagesDir: string
  let app: ReturnType<typeof createShareImageApp>
  let existingIds: Set<string>
  let shareExists: ShareExistsCheck

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'share-image-route-'))
    imagesDir = path.join(tmpDir, 'images')
    existingIds = new Set<string>()
    shareExists = (id: string) => existingIds.has(id)
    app = createShareImageApp(imagesDir, shareExists)
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('POST /:id/image', () => {
    it('saves image when share exists', async () => {
      existingIds.add('abc123')
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ])

      const res = await app.request('/abc123/image', {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: pngData,
      })

      expect(res.status).toBe(200)
      const json = (await res.json()) as { ok: boolean }
      expect(json.ok).toBe(true)

      const savedFile = path.join(imagesDir, 'abc123.png')
      expect(fs.existsSync(savedFile)).toBe(true)
      const savedData = fs.readFileSync(savedFile)
      expect(Buffer.compare(savedData, pngData)).toBe(0)
    })

    it('returns 404 when share does not exist', async () => {
      const pngData = Buffer.from([0x89, 0x50, 0x4e, 0x47])

      const res = await app.request('/nonexist/image', {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: pngData,
      })

      expect(res.status).toBe(404)
      const json = (await res.json()) as {
        ok: boolean
        error: { kind: string }
      }
      expect(json.ok).toBe(false)
      expect(json.error.kind).toBe('not_found')
    })

    it('returns 400 for invalid Content-Type', async () => {
      existingIds.add('abc123')

      const res = await app.request('/abc123/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'not an image' }),
      })

      expect(res.status).toBe(400)
      const json = (await res.json()) as {
        ok: boolean
        error: { kind: string; message: string }
      }
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/Content-Type/)
    })

    it('returns 400 for empty body', async () => {
      existingIds.add('abc123')

      const res = await app.request('/abc123/image', {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: new ArrayBuffer(0),
      })

      expect(res.status).toBe(400)
      const json = (await res.json()) as {
        ok: boolean
        error: { kind: string; message: string }
      }
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/Empty body/)
    })

    it('returns 413 for oversized files', async () => {
      existingIds.add('abc123')
      const oversized = Buffer.alloc(2 * 1024 * 1024 + 1, 0xff)

      const res = await app.request('/abc123/image', {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: oversized,
      })

      expect(res.status).toBe(413)
      const json = (await res.json()) as {
        ok: boolean
        error: { kind: string; message: string }
      }
      expect(json.ok).toBe(false)
      expect(json.error.message).toMatch(/too large/)
    })
  })

  describe('GET /:id/image', () => {
    it('returns saved image with correct headers', async () => {
      existingIds.add('abc123')
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ])

      // First, save an image via POST
      await app.request('/abc123/image', {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: pngData,
      })

      // Then, retrieve it via GET
      const res = await app.request('/abc123/image', {
        method: 'GET',
      })

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toBe('image/png')
      expect(res.headers.get('Cache-Control')).toBe(
        'public, max-age=86400, immutable',
      )

      const body = await res.arrayBuffer()
      expect(Buffer.compare(Buffer.from(body), pngData)).toBe(0)
    })

    it('returns 404 when image does not exist', async () => {
      const res = await app.request('/abc123/image', {
        method: 'GET',
      })

      expect(res.status).toBe(404)
      const json = (await res.json()) as {
        ok: boolean
        error: { kind: string }
      }
      expect(json.ok).toBe(false)
      expect(json.error.kind).toBe('not_found')
    })
  })
})
