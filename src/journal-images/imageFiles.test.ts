import { resetIndexedDb } from '../test/resetIndexedDb'

/** A fresh copy, so each test opens the database anew. */
async function importImageFiles() {
  vi.resetModules()
  return import('./imageFiles')
}

const gif = (content: string) =>
  new File([content], 'cat.gif', { type: 'image/gif' })

describe('image files', () => {
  beforeEach(() => resetIndexedDb())

  it('keeps a picture under its content name and type', async () => {
    const images = await importImageFiles()
    const result = await images.storeImage(gif('cat'))
    if (!result.ok) throw new Error(result.problem)
    expect(result.imageId).toMatch(/^[0-9a-f]{64}\.gif$/)
    const stored = await images.readImage(result.imageId)
    expect(stored?.type).toBe('image/gif')
    expect(await stored?.text()).toBe('cat')
  })

  it('says why a file can’t go in an entry', async () => {
    const images = await importImageFiles()
    const svg = new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' })
    expect(await images.storeImage(svg)).toEqual({
      ok: false,
      problem: expect.stringContaining('“logo.svg” isn’t a picture'),
    })
    const huge = gif('x')
    Object.defineProperty(huge, 'size', { value: 21 * 1024 * 1024 })
    expect(images.checkImageFile(huge)).toContain('over 20 MB')
  })

  it('restores a picture only under its own content name', async () => {
    const images = await importImageFiles()
    const stored = await images.storeImage(gif('cat'))
    if (!stored.ok) throw new Error(stored.problem)
    const bytes = new TextEncoder().encode('cat')
    const reopened = await importImageFiles()
    await reopened.deleteUnusedImages([])
    expect(await reopened.readImage(stored.imageId)).toBeNull()
    expect(await reopened.restoreImage(stored.imageId, bytes)).toBe(true)
    expect(await reopened.readImage(stored.imageId)).not.toBeNull()
    const tampered = new TextEncoder().encode('dog')
    const otherId = `${'0'.repeat(64)}.gif`
    expect(await images.restoreImage(otherId, tampered)).toBe(false)
    expect(await images.readImage(otherId)).toBeNull()
  })

  it('deletes only pictures no entry uses, once the app opens again', async () => {
    const images = await importImageFiles()
    const kept = await images.storeImage(gif('kept'))
    const unused = await images.storeImage(gif('unused'))
    if (!kept.ok || !unused.ok) throw new Error('not stored')
    // Just added, so maybe not in its entry's saved writing yet.
    await images.deleteUnusedImages([kept.imageId])
    expect(await images.readImage(unused.imageId)).not.toBeNull()
    const reopened = await importImageFiles()
    await reopened.deleteUnusedImages([kept.imageId])
    expect(await reopened.readImage(kept.imageId)).not.toBeNull()
    expect(await reopened.readImage(unused.imageId)).toBeNull()
  })
})
