import { readImage } from './imageFiles'

type ShownImage = { users: number; url: Promise<string | null> }

/* One URL per picture while anything shows it, however many places do. */
const shownImages = new Map<string, ShownImage>()

/**
 * A URL to show a stored picture, or null if it isn't on this device. Call
 * `releaseImageUrl` once it's no longer shown, so its memory is freed.
 */
export function acquireImageUrl(imageId: string): Promise<string | null> {
  const shown = shownImages.get(imageId)
  if (shown) {
    shown.users += 1
    return shown.url
  }
  const url = readImage(imageId).then(
    (file) => file && URL.createObjectURL(file),
  )
  shownImages.set(imageId, { users: 1, url })
  return url
}

export function releaseImageUrl(imageId: string): void {
  const shown = shownImages.get(imageId)
  if (!shown) return
  shown.users -= 1
  if (shown.users > 0) return
  shownImages.delete(imageId)
  void shown.url.then((url) => url && URL.revokeObjectURL(url))
}
