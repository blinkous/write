import { z } from 'zod'
import {
  deleteBlob,
  hasBlob,
  listBlobKeys,
  readBlob,
  writeBlob,
} from '../../lib/blobStore'
import { readStoredValue } from '../../lib/localStore'
import {
  BACKGROUND_MEDIA_STORAGE_KEY,
  getBackgroundMediaKind,
  type BackgroundMediaKind,
} from './backgroundMedia'

/*
 * Background files, each kept once however many places use it: the current
 * background, theme packs and recent undo steps point to the same stored
 * bytes, named by their content. A file is deleted once nothing points to it.
 */

/** Stored files are named by this plus their content's SHA-256. */
const BACKGROUND_FILE_KEY_PREFIX = 'background-file:'

/**
 * Briefly, which stored file was the current background (localStorage). It's
 * now one of the settings (`backgroundFileId`), which read it once.
 */
const CURRENT_BACKGROUND_STORAGE_KEY = 'write.currentBackgroundFile.v1'

/** A stored file's content name, or null for none. */
export const backgroundFileIdSchema = z.string().min(1).nullable()

/** A stored background file: its content name, kind and size. */
export type StoredBackgroundFile = {
  fileId: string
  kind: BackgroundMediaKind
  bytes: number
}

function toFileKey(fileId: string): string {
  return `${BACKGROUND_FILE_KEY_PREFIX}${fileId}`
}

async function hashFile(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

/*
 * One change at a time: a file is written before anything points to it, and
 * unused files are only swept between changes, never in the middle of one.
 */
let pendingChange: Promise<unknown> = Promise.resolve()

function inOrder<Result>(change: () => Promise<Result>): Promise<Result> {
  const result = pendingChange.then(change, change)
  pendingChange = result.catch(() => undefined)
  return result
}

/** Keeps the file (once, however often it's stored). Null if it isn't a picture or video or can't be saved. */
async function storeFile(file: Blob): Promise<StoredBackgroundFile | null> {
  const kind = getBackgroundMediaKind(file.type)
  if (!kind) return null
  const fileId = await hashFile(file)
  const key = toFileKey(fileId)
  if (!(await hasBlob(key)) && !(await writeBlob(key, file))) return null
  return { fileId, kind, bytes: file.size }
}

/** Stores a background file. Null if it isn't a picture or video or couldn't be saved. */
export function storeBackgroundFile(
  file: Blob,
): Promise<StoredBackgroundFile | null> {
  return inOrder(() => storeFile(file))
}

/** The current background as briefly saved on its own, for settings saved before it was one of them. */
export function readLegacyCurrentBackgroundFileId(): string | null {
  return readStoredValue(
    CURRENT_BACKGROUND_STORAGE_KEY,
    backgroundFileIdSchema,
    null,
  )
}

/*
 * The background used to be stored on its own under one key. It moves to the
 * shared files once; the old copy is deleted only after the move is saved, so
 * an interrupted move simply runs again. The caller makes it the current one.
 */
export function moveLegacyBackgroundFile(): Promise<string | null> {
  return inOrder(async () => {
    const legacyFile = await readBlob(BACKGROUND_MEDIA_STORAGE_KEY)
    if (!legacyFile) return null
    const stored = await storeFile(legacyFile)
    if (!stored) return null
    await deleteBlob(BACKGROUND_MEDIA_STORAGE_KEY)
    return stored.fileId
  })
}

export type LoadedBackgroundFile = StoredBackgroundFile & { file: Blob }

/** A stored file by its content name, or null if it isn't on this device. */
export function readBackgroundFile(
  fileId: string,
): Promise<LoadedBackgroundFile | null> {
  return inOrder(async () => {
    const file = await readBlob(toFileKey(fileId))
    const kind = file && getBackgroundMediaKind(file.type)
    if (!file || !kind) return null
    return { fileId, kind, bytes: file.size, file }
  })
}

export type BackgroundFileUses = {
  /** Always kept: the current background and the theme packs'. */
  keptFileIds: readonly string[]
  /** Kept for undo, most recent first, while they fit `undoBudgetBytes`. */
  undoFileIds: readonly string[]
  undoBudgetBytes: number
}

/**
 * Deletes every stored background file nothing keeps. Files only undo steps
 * point to stay while they fit the undo budget, the most recent first; older
 * ones go, so undoing that far brings back the rest of the settings without
 * them. Nothing is deleted if the stored files can't be listed.
 */
export function deleteUnusedBackgroundFiles({
  keptFileIds,
  undoFileIds,
  undoBudgetBytes,
}: BackgroundFileUses): Promise<void> {
  return inOrder(async () => {
    const keys = await listBlobKeys(BACKGROUND_FILE_KEY_PREFIX)
    if (!keys) return
    const usedKeys = new Set(keptFileIds.map(toFileKey))
    let undoBytes = 0
    for (const fileId of new Set(undoFileIds)) {
      const key = toFileKey(fileId)
      if (usedKeys.has(key)) continue
      const file = await readBlob(key)
      if (!file || undoBytes + file.size > undoBudgetBytes) continue
      undoBytes += file.size
      usedKeys.add(key)
    }
    for (const key of keys) if (!usedKeys.has(key)) await deleteBlob(key)
  })
}
