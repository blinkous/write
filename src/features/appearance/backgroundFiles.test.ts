import { resetIndexedDb } from '../../test/resetIndexedDb'

/** Fresh copies, so each test opens the database anew. */
async function importModules() {
  vi.resetModules()
  return {
    files: await import('./backgroundFiles'),
    blobs: await import('../../lib/blobStore'),
  }
}

const picture = (content: string) => new Blob([content], { type: 'image/png' })

async function storedKeys(blobs: {
  listBlobKeys: (prefix: string) => Promise<string[] | null>
}) {
  return (await blobs.listBlobKeys('background-file:'))?.toSorted()
}

const keyOf = (fileId: string | undefined) => `background-file:${fileId}`

type FilesModule = typeof import('./backgroundFiles')

/** Stores a file under its content name, as choosing a background does. */
async function store(files: FilesModule, file: Blob) {
  return files.storeBackgroundFile(file, await files.getBackgroundFileId(file))
}

describe('background files', () => {
  beforeEach(() => {
    resetIndexedDb()
    window.localStorage.clear()
  })

  it('keeps the same file once, however often it’s stored', async () => {
    const { files, blobs } = await importModules()
    const first = await store(files, picture('sky'))
    const second = await store(files, picture('sky'))
    expect(first?.fileId).toBe(second?.fileId)
    expect(await blobs.listBlobKeys('background-file:')).toHaveLength(1)
  })

  it('reads a stored file back, and nothing for one that isn’t there', async () => {
    const { files } = await importModules()
    const stored = await store(files, picture('sky'))
    const loaded = stored && (await files.readBackgroundFile(stored.fileId))
    expect(loaded?.kind).toBe('image')
    expect(await loaded?.file.text()).toBe('sky')
    expect(await files.readBackgroundFile('missing')).toBeNull()
  })

  it('deletes every file but the ones kept', async () => {
    const { files, blobs } = await importModules()
    const kept = await store(files, picture('kept'))
    await store(files, picture('unused'))
    await files.deleteUnusedBackgroundFiles(kept ? [kept.fileId] : [])
    expect(await storedKeys(blobs)).toEqual([keyOf(kept?.fileId)])
  })

  it('names the same content the same, and different content differently', async () => {
    const { files } = await importModules()
    expect(await files.getBackgroundFileId(picture('sky'))).toBe(
      await files.getBackgroundFileId(picture('sky')),
    )
    expect(await files.getBackgroundFileId(picture('sky'))).not.toBe(
      await files.getBackgroundFileId(picture('sea')),
    )
  })

  it('moves a background saved the old way, once, then drops the old copy', async () => {
    const { files, blobs } = await importModules()
    await blobs.writeBlob('background-media.v1', picture('old'))
    const movedFileId = await files.moveLegacyBackgroundFile()
    const moved = movedFileId
      ? await files.readBackgroundFile(movedFileId)
      : null
    expect(await moved?.file.text()).toBe('old')
    expect(await blobs.readBlob('background-media.v1')).toBeNull()
    expect(await files.moveLegacyBackgroundFile()).toBeNull()
  })

  it('reads the briefly separate current background for older settings', async () => {
    const { files } = await importModules()
    window.localStorage.setItem(
      'write.currentBackgroundFile.v1',
      JSON.stringify('abc'),
    )
    expect(files.readLegacyCurrentBackgroundFileId()).toBe('abc')
  })
})
