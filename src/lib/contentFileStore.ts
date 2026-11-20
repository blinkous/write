import {
  deleteBlob,
  hasBlob,
  listBlobKeys,
  readBlob,
  writeBlob,
} from './blobStore'

/** A file's content name (its SHA-256): the same file always gets the same one. */
export async function getContentFileId(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

/**
 * Files kept once however many places use them, named by their content and
 * stored under `keyPrefix` in the browser's file storage. A file is written
 * before anything points to it, and unused files are only swept between
 * changes, never in the middle of one.
 */
export function createContentFileStore(keyPrefix: string) {
  let pendingChange: Promise<unknown> = Promise.resolve()

  /** Runs one change at a time, after the ones before it. */
  function inOrder<Result>(change: () => Promise<Result>): Promise<Result> {
    const result = pendingChange.then(change, change)
    pendingChange = result.catch(() => undefined)
    return result
  }

  const toKey = (fileId: string) => `${keyPrefix}${fileId}`

  /** Keeps the file (once, however often it's written); its content name, or null if it couldn't be saved. For use inside `inOrder`. */
  async function write(file: Blob, fileId?: string): Promise<string | null> {
    fileId ??= await getContentFileId(file)
    const key = toKey(fileId)
    if (!(await hasBlob(key)) && !(await writeBlob(key, file))) return null
    return fileId
  }

  return {
    inOrder,
    write,
    /** Writes the file in its turn; its content name, or null if it couldn't be saved. */
    store: (file: Blob, fileId?: string) => inOrder(() => write(file, fileId)),
    /** A stored file by its content name, or null if it isn't on this device. */
    read: (fileId: string) => inOrder(() => readBlob(toKey(fileId))),
    /** Deletes every stored file but these. Nothing is deleted if the stored files can't be listed. */
    deleteAllBut: (keptFileIds: Iterable<string>) =>
      inOrder(async () => {
        const keys = await listBlobKeys(keyPrefix)
        if (!keys) return
        const keptKeys = new Set(Array.from(keptFileIds, toKey))
        for (const key of keys) if (!keptKeys.has(key)) await deleteBlob(key)
      }),
  }
}
