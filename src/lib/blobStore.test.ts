import { resetIndexedDb } from '../test/resetIndexedDb'

/** A fresh copy of the module, so each test opens the database anew. */
async function importBlobStore() {
  vi.resetModules()
  return import('./blobStore')
}

/** Stores a file the way idb-keyval did: database "write-files", store "files", opened unversioned. */
async function storeLikeIdbKeyval(key: string, value: unknown) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('write-files')
    request.onupgradeneeded = () => request.result.createObjectStore('files')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('files', 'readwrite')
    transaction.objectStore('files').put(value, key)
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
  })
  database.close()
}

describe('blobStore', () => {
  beforeEach(() => resetIndexedDb())

  it('writes, reads and deletes a file', async () => {
    const { deleteBlob, readBlob, writeBlob } = await importBlobStore()
    const picture = new Blob(['pixels'], { type: 'image/png' })
    expect(await writeBlob('picture', picture)).toBe(true)
    const storedPicture = await readBlob('picture')
    expect(storedPicture?.type).toBe('image/png')
    expect(await storedPicture?.text()).toBe('pixels')
    expect(await deleteBlob('picture')).toBe(true)
    expect(await readBlob('picture')).toBeNull()
  })

  it('reads a file stored by the earlier idb-keyval version', async () => {
    const bytes = await new Blob(['frames']).arrayBuffer()
    await storeLikeIdbKeyval('video', { type: 'video/mp4', bytes })
    const { readBlob } = await importBlobStore()
    expect(await (await readBlob('video'))?.text()).toBe('frames')
  })

  it('reads anything unrecognized as no file', async () => {
    await storeLikeIdbKeyval('picture', 'not a file')
    const { readBlob } = await importBlobStore()
    expect(await readBlob('picture')).toBeNull()
  })
})
