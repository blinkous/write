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

const sized = (content: string, bytes: number) =>
  new Blob([content.padEnd(bytes, '.')], { type: 'image/png' })

async function storedKeys(blobs: {
  listBlobKeys: (prefix: string) => Promise<string[] | null>
}) {
  return (await blobs.listBlobKeys('background-file:'))?.toSorted()
}

const keyOf = (fileId: string | undefined) => `background-file:${fileId}`

describe('background files', () => {
  beforeEach(() => {
    resetIndexedDb()
    window.localStorage.clear()
  })

  it('keeps the same file once, however often it’s stored', async () => {
    const { files, blobs } = await importModules()
    const first = await files.storeBackgroundFile(picture('sky'))
    const second = await files.storeBackgroundFile(picture('sky'))
    expect(first?.fileId).toBe(second?.fileId)
    expect(await blobs.listBlobKeys('background-file:')).toHaveLength(1)
  })

  it('reads a stored file back, and nothing for one that isn’t there', async () => {
    const { files } = await importModules()
    const stored = await files.storeBackgroundFile(picture('sky'))
    const loaded = stored && (await files.readBackgroundFile(stored.fileId))
    expect(loaded?.kind).toBe('image')
    expect(await loaded?.file.text()).toBe('sky')
    expect(await files.readBackgroundFile('missing')).toBeNull()
  })

  it('deletes only files nothing keeps', async () => {
    const { files, blobs } = await importModules()
    const kept = await files.storeBackgroundFile(picture('kept'))
    await files.storeBackgroundFile(picture('unused'))
    await files.deleteUnusedBackgroundFiles({
      keptFileIds: kept ? [kept.fileId] : [],
      undoFileIds: [],
      undoBudgetBytes: 0,
    })
    expect(await storedKeys(blobs)).toEqual([keyOf(kept?.fileId)])
  })

  it('keeps files for undo within its budget, the most recent first', async () => {
    const { files, blobs } = await importModules()
    const recent = await files.storeBackgroundFile(sized('recent', 60))
    const older = await files.storeBackgroundFile(sized('older', 60))
    const small = await files.storeBackgroundFile(sized('small', 30))
    await files.deleteUnusedBackgroundFiles({
      keptFileIds: [],
      undoFileIds: [recent, older, small].flatMap((file) =>
        file ? [file.fileId] : [],
      ),
      undoBudgetBytes: 100,
    })
    // The older one doesn't fit after the recent one; the small one still does.
    expect(await storedKeys(blobs)).toEqual(
      [keyOf(recent?.fileId), keyOf(small?.fileId)].toSorted(),
    )
  })

  it('doesn’t count an undo file against the budget when it’s kept anyway', async () => {
    const { files, blobs } = await importModules()
    const current = await files.storeBackgroundFile(sized('current', 80))
    const previous = await files.storeBackgroundFile(sized('previous', 80))
    const fileIds = [current, previous].flatMap((file) =>
      file ? [file.fileId] : [],
    )
    await files.deleteUnusedBackgroundFiles({
      keptFileIds: fileIds.slice(0, 1),
      undoFileIds: fileIds,
      undoBudgetBytes: 100,
    })
    expect(await storedKeys(blobs)).toEqual(fileIds.map(keyOf).toSorted())
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
