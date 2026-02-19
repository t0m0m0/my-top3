import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export type ShareParams = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
}

type StoreData = Record<string, ShareParams>

function generateId(): string {
  // 8 chars of url-safe base64 (48 bits of entropy)
  return crypto.randomBytes(6).toString('base64url')
}

function loadFromFile(filePath: string): StoreData {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as StoreData
  } catch {
    return {}
  }
}

function saveToFile(filePath: string, data: StoreData): void {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8')
}

export type ShareStore = {
  save: (params: ShareParams) => string
  get: (id: string) => ShareParams | null
}

export function createShareStore(filePath: string): ShareStore {
  return {
    save(params: ShareParams): string {
      const data = loadFromFile(filePath)
      let id = generateId()
      // Ensure uniqueness (extremely unlikely collision but safe)
      while (data[id]) {
        id = generateId()
      }
      data[id] = params
      saveToFile(filePath, data)
      return id
    },

    get(id: string): ShareParams | null {
      const data = loadFromFile(filePath)
      return data[id] ?? null
    },
  }
}
