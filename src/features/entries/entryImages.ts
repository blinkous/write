import { collectImageIds } from '../../journal-document'
import {
  deleteUnusedImages,
  readImage,
  restoreImage,
} from '../../journal-images'
import { bytesToBase64 } from '../../utils/base64'
import type { ImportedImages } from './entryTransfer'
import type { JournalEntry } from './journalEntry'

/** Every picture the entries show, each once. */
export function collectEntryImageIds(
  entries: readonly JournalEntry[],
): Set<string> {
  const imageIds = new Set<string>()
  for (const { content } of entries) collectImageIds(content, imageIds)
  return imageIds
}

/**
 * Frees the pictures no entry shows anymore (deleted, or their entry
 * deleted). Run as the journal opens, so undo never needs one that's gone.
 */
export async function deleteImagesNoEntryShows(
  getAllEntries: () => Promise<readonly JournalEntry[]>,
): Promise<void> {
  await deleteUnusedImages(collectEntryImageIds(await getAllEntries()))
}

/** The entries' pictures that are on this device, by content name. */
export async function readEntryImageFiles(
  entries: readonly JournalEntry[],
): Promise<Map<string, Blob>> {
  const files = new Map<string, Blob>()
  for (const imageId of collectEntryImageIds(entries)) {
    const file = await readImage(imageId)
    if (file) files.set(imageId, file)
  }
  return files
}

/** The entries' pictures as an export file keeps them: base64 by content name. */
export async function readEntryImages(
  entries: readonly JournalEntry[],
): Promise<Record<string, string>> {
  const images: Record<string, string> = {}
  for (const [imageId, file] of await readEntryImageFiles(entries))
    images[imageId] = bytesToBase64(new Uint8Array(await file.arrayBuffer()))
  return images
}

/** Keeps an import's pictures; false if one isn't what its name says or can't be saved. */
export async function restoreEntryImages(
  images: ImportedImages,
): Promise<boolean> {
  for (const [imageId, bytes] of images)
    if (!(await restoreImage(imageId, bytes))) return false
  return true
}
