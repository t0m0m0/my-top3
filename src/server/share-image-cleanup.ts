import fs from 'node:fs'
import path from 'node:path'

/**
 * Delete a share's image file (PNG) from disk.
 * Silently ignores if the file does not exist.
 */
export function deleteShareImage(imagesDir: string, id: string): void {
  const filePath = path.join(imagesDir, `${id}.png`)
  try {
    fs.unlinkSync(filePath)
  } catch {
    // File may not exist — ignore
  }
}

/**
 * Remove orphan image files that have no corresponding ID in the given set.
 * Only `.png` files are considered; other files are ignored.
 * Returns the number of files removed.
 */
export function purgeOrphanImages(
  imagesDir: string,
  validIds: Set<string>,
): number {
  if (!fs.existsSync(imagesDir)) return 0
  const files = fs.readdirSync(imagesDir)
  let removed = 0
  for (const file of files) {
    if (!file.endsWith('.png')) continue
    const id = file.slice(0, -4) // strip .png
    if (!validIds.has(id)) {
      fs.unlinkSync(path.join(imagesDir, file))
      removed++
    }
  }
  return removed
}
