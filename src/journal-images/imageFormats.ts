/** The picture formats entries can hold, by the extension their content names end in. */
const IMAGE_FORMATS = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
} as const satisfies Record<string, string>

type ImageExtension = keyof typeof IMAGE_FORMATS

const IMAGE_EXTENSIONS = Object.keys(IMAGE_FORMATS) as ImageExtension[]

/** What the file picker offers. */
export const IMAGE_ACCEPT = Object.values(IMAGE_FORMATS).join(',')

/** Named for people, in messages. */
export const IMAGE_FORMAT_NAMES = 'PNG, JPEG, GIF, WebP or AVIF'

/** Big enough for long GIFs and camera photos; each image on its own. */
export const MAX_IMAGE_MEGABYTES = 20
export const MAX_IMAGE_BYTES = MAX_IMAGE_MEGABYTES * 1024 * 1024

/** A content name: the file's SHA-256 and its format's extension. */
const IMAGE_ID_PATTERN = new RegExp(
  `^[0-9a-f]{64}\\.(${IMAGE_EXTENSIONS.join('|')})$`,
)

export function isImageId(value: unknown): value is string {
  return typeof value === 'string' && IMAGE_ID_PATTERN.test(value)
}

/** The extension for a picture type, or null if entries can't hold it. */
export function getImageExtension(mimeType: string): ImageExtension | null {
  return (
    IMAGE_EXTENSIONS.find(
      (extension) => IMAGE_FORMATS[extension] === mimeType,
    ) ?? null
  )
}

/** The picture type an image's content name ends in. */
export function getImageMimeType(imageId: string): string | null {
  const extension = IMAGE_EXTENSIONS.find((candidate) =>
    imageId.endsWith(`.${candidate}`),
  )
  return extension ? IMAGE_FORMATS[extension] : null
}

/** Whether a picture may move (GIFs; other formats' animation isn't offered a pause). */
export function isAnimatedImage(imageId: string): boolean {
  return imageId.endsWith('.gif')
}
