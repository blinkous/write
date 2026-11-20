import { collectImageIds } from '../../journal-document'
import { deleteUnusedImages } from '../../journal-images'
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
