import {
  createContentFileStore,
  getContentFileId,
} from '../lib/contentFileStore'
import {
  getImageExtension,
  getImageMimeType,
  IMAGE_FORMAT_NAMES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MEGABYTES,
} from './imageFormats'

/*
 * Entries' pictures, each kept once however many entries (or copies in one)
 * use it, named by its content. They don't count toward the backgrounds' room.
 */
const imageFileStore = createContentFileStore('journal-image:')

/*
 * Pictures kept since the app opened, never swept: one just added may not be
 * in its entry's saved writing yet.
 */
const keptThisSession = new Set<string>()

/** A picture's content name (see imageFormats), or null if entries can't hold its type. */
export async function getImageId(file: Blob): Promise<string | null> {
  const extension = getImageExtension(file.type)
  if (!extension) return null
  return `${await getContentFileId(file)}.${extension}`
}

export type StoreImageResult =
  { ok: true; imageId: string } | { ok: false; problem: string }

/** Why a file can't go in an entry, or null if it can. */
export function checkImageFile(file: Blob & { name?: string }): string | null {
  const name = file.name ? `“${file.name}”` : 'It'
  if (!getImageExtension(file.type))
    return `${name} isn’t a picture entries can hold (${IMAGE_FORMAT_NAMES}).`
  if (file.size > MAX_IMAGE_BYTES)
    return `${name} is over ${MAX_IMAGE_MEGABYTES} MB, the most a picture can be. Try a smaller one.`
  return null
}

/** Keeps a picture for an entry; its content name, or why it couldn't. */
export async function storeImage(
  file: Blob & { name?: string },
): Promise<StoreImageResult> {
  const problem = checkImageFile(file)
  if (problem) return { ok: false, problem }
  const imageId = await getImageId(file)
  const storedId = imageId && (await imageFileStore.store(file, imageId))
  if (!storedId)
    return {
      ok: false,
      problem: 'Couldn’t save the picture. Storage may be full.',
    }
  keptThisSession.add(storedId)
  return { ok: true, imageId: storedId }
}

/**
 * Keeps a picture under the content name it came with (e.g. in a backup),
 * once it proves to be that picture. False if it isn't, or couldn't be saved.
 */
export async function restoreImage(
  imageId: string,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<boolean> {
  const mimeType = getImageMimeType(imageId)
  if (!mimeType) return false
  const file = new Blob([bytes], { type: mimeType })
  if ((await getImageId(file)) !== imageId) return false
  if (!(await imageFileStore.store(file, imageId))) return false
  keptThisSession.add(imageId)
  return true
}

/** A stored picture, or null if it isn't on this device. */
export async function readImage(imageId: string): Promise<Blob | null> {
  const file = await imageFileStore.read(imageId)
  const mimeType = getImageMimeType(imageId)
  // Typed by its name, so it shows as what it is.
  return file && mimeType ? new Blob([file], { type: mimeType }) : null
}

/**
 * Deletes every stored picture no entry uses, except those kept since the app
 * opened. Nothing is deleted if they can't be listed.
 */
export function deleteUnusedImages(usedImageIds: Iterable<string>) {
  return imageFileStore.deleteAllBut([...usedImageIds, ...keptThisSession])
}
