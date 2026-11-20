import { resetIndexedDb } from '../test/resetIndexedDb'

/** A fresh copy, so each test opens the database anew. */
async function importModules() {
  vi.resetModules()
  return {
    stores: await import('./contentFileStore'),
    blobs: await import('./blobStore'),
  }
}

const file = (content: string) => new Blob([content], { type: 'image/png' })

describe('content file store', () => {
  beforeEach(() => resetIndexedDb())

  it('names a file by its content and keeps it once', async () => {
    const { stores, blobs } = await importModules()
    const store = stores.createContentFileStore('test:')
    const first = await store.store(file('sky'))
    const second = await store.store(file('sky'))
    expect(first).toBe(await stores.getContentFileId(file('sky')))
    expect(second).toBe(first)
    expect(await blobs.listBlobKeys('test:')).toEqual([`test:${first}`])
    expect(await (await store.read(first ?? ''))?.text()).toBe('sky')
  })

  it('sweeps only its own unused files', async () => {
    const { stores, blobs } = await importModules()
    const pictures = stores.createContentFileStore('pictures:')
    const others = stores.createContentFileStore('others:')
    const kept = await pictures.store(file('kept'))
    await pictures.store(file('unused'))
    const other = await others.store(file('other'))
    await pictures.deleteAllBut([kept ?? ''])
    expect(await blobs.listBlobKeys('pictures:')).toEqual([`pictures:${kept}`])
    expect(await blobs.listBlobKeys('others:')).toEqual([`others:${other}`])
  })
})
