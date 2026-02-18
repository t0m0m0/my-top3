import html2canvas from 'html2canvas'
import { MESSAGES } from '../constants/messages'

const IMAGE_SIZE = 1080
const CANVAS_BG = '#111827'

export async function generateImageBlob(
  element: HTMLElement,
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    scale: 1,
    useCORS: true,
    allowTaint: false,
    backgroundColor: CANVAS_BG,
  })

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('画像の生成に失敗しました。画像データが空です。'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\:*?"<>|\0\n\r]/g, '_')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 50)
}

export function getImageErrorMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === 'SecurityError') {
    return MESSAGES.IMAGE_CORS_ERROR
  }
  if (err instanceof DOMException && err.name === 'QuotaExceededError') {
    return '画像サイズが大きすぎるため生成できませんでした。'
  }
  return '画像の生成に失敗しました。もう一度お試しください。'
}

export function formatDate(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
