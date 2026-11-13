import { createStore, del, get, set, type UseStore } from 'idb-keyval'

/*
 * Files too big for localStorage (e.g. a background picture or video), kept in
 * this browser's IndexedDB. Never uploaded. Opened on first use, so nothing
 * touches IndexedDB until a file is needed.
 */
let fileStore: UseStore | undefined

/*
 * Stored as plain bytes and a type rather than a Blob: Safari's private
 * windows refuse Blobs in IndexedDB but take ArrayBuffers.
 */
type StoredFile = { type: string; bytes: ArrayBuffer }

function isStoredFile(value: unknown): value is StoredFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string' &&
    'bytes' in value &&
    value.bytes instanceof ArrayBuffer
  )
}

function getFileStore(): UseStore {
  fileStore ??= createStore('write-files', 'files')
  return fileStore
}

/** The stored file, or null if there isn't one or storage can't be read. */
export async function readBlob(key: string): Promise<Blob | null> {
  try {
    const storedValue: unknown = await get(key, getFileStore())
    if (!isStoredFile(storedValue)) return null
    const { type, bytes } = storedValue
    return new Blob([bytes], { type })
  } catch {
    return null
  }
}

/** Replaces the stored file. Returns false if storage is unavailable or full. */
export async function writeBlob(key: string, blob: Blob): Promise<boolean> {
  try {
    const storedFile: StoredFile = {
      type: blob.type,
      bytes: await blob.arrayBuffer(),
    }
    await set(key, storedFile, getFileStore())
    return true
  } catch {
    return false
  }
}

/** Removes the stored file (nothing happens if there isn't one). Returns false if storage is unavailable. */
export async function deleteBlob(key: string): Promise<boolean> {
  try {
    await del(key, getFileStore())
    return true
  } catch {
    return false
  }
}
