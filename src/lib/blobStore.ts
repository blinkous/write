import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

/*
 * Files too big for localStorage (e.g. a background picture or video), kept in
 * this browser's IndexedDB. Never uploaded. Opened on first use, so nothing
 * touches IndexedDB until a file is needed.
 */
const DATABASE_NAME = 'write-files'
const DATABASE_VERSION = 1

/*
 * Stored as plain bytes and a type rather than a Blob: Safari's private
 * windows refuse Blobs in IndexedDB but take ArrayBuffers.
 */
type StoredFile = { type: string; bytes: ArrayBuffer }

/* `files` (plural) predates the singular naming: renaming would mean moving every file. */
interface FileDatabaseSchema extends DBSchema {
  /** Validated on read, since what's stored may predate today's format. */
  files: { key: string; value: unknown }
}

let fileDatabase: Promise<IDBPDatabase<FileDatabaseSchema>> | undefined

/* By its tag rather than instanceof, which fails for one cloned from another realm (e.g. in tests). */
function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return Object.prototype.toString.call(value) === '[object ArrayBuffer]'
}

function isStoredFile(value: unknown): value is StoredFile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string' &&
    'bytes' in value &&
    isArrayBuffer(value.bytes)
  )
}

/** Opened once, on first use. A failed open is retried next time instead of being remembered. */
function getFileDatabase(): Promise<IDBPDatabase<FileDatabaseSchema>> {
  fileDatabase ??= openDB<FileDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) database.createObjectStore('files')
    },
    // A newer version opened in another tab: let it upgrade.
    blocking: (_currentVersion, _blockedVersion, event) => {
      const database = event.target
      if (database instanceof IDBDatabase) database.close()
      fileDatabase = undefined
    },
  }).catch((error: unknown) => {
    fileDatabase = undefined
    throw error
  })
  return fileDatabase
}

/** The stored file, or null if there isn't one or storage can't be read. */
export async function readBlob(key: string): Promise<Blob | null> {
  try {
    const storedValue = await (await getFileDatabase()).get('files', key)
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
    await (await getFileDatabase()).put('files', storedFile, key)
    return true
  } catch {
    return false
  }
}

/** Removes the stored file (nothing happens if there isn't one). Returns false if storage is unavailable. */
export async function deleteBlob(key: string): Promise<boolean> {
  try {
    await (await getFileDatabase()).delete('files', key)
    return true
  } catch {
    return false
  }
}

/** The keys of every stored file starting with `prefix`, or null if storage can't be read. */
export async function listBlobKeys(prefix: string): Promise<string[] | null> {
  try {
    const keys = await (await getFileDatabase()).getAllKeys('files')
    return keys.filter((key) => key.startsWith(prefix))
  } catch {
    return null
  }
}

/** Whether a file is stored under the key (false if storage can't be read). */
export async function hasBlob(key: string): Promise<boolean> {
  try {
    return (await (await getFileDatabase()).count('files', key)) > 0
  } catch {
    return false
  }
}
