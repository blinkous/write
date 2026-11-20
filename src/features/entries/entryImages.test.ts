import { storeImage } from '../../journal-images'
import { resetIndexedDb } from '../../test/resetIndexedDb'
import {
  collectEntryImageIds,
  readEntryImages,
  restoreEntryImages,
} from './entryImages'
import { createJournalEntry, type JournalEntry } from './journalEntry'

function entryShowing(...imageIds: string[]): JournalEntry {
  return {
    ...createJournalEntry(new Date('2026-11-20T09:00:00.000Z')),
    content: {
      type: 'doc',
      content: imageIds.map((imageId) => ({
        type: 'image',
        attrs: { imageId, alt: '' },
      })),
    },
  }
}

async function storedGif(content: string) {
  const stored = await storeImage(
    new File([content], 'cat.gif', { type: 'image/gif' }),
  )
  if (!stored.ok) throw new Error(stored.problem)
  return stored.imageId
}

describe('entry images', () => {
  beforeEach(() => resetIndexedDb())

  it('collects every picture the entries show, once each', async () => {
    const [cat, dog] = [`${'a'.repeat(64)}.gif`, `${'b'.repeat(64)}.png`]
    expect([
      ...collectEntryImageIds([entryShowing(cat, dog), entryShowing(cat)]),
    ]).toEqual([cat, dog])
  })

  it('exports the pictures on this device and restores them', async () => {
    const cat = await storedGif('cat')
    const missing = `${'b'.repeat(64)}.png`
    const images = await readEntryImages([entryShowing(cat, missing)])
    expect(images).toEqual({ [cat]: 'Y2F0' })
    const bytes = new Map([[cat, new TextEncoder().encode('cat')]])
    expect(await restoreEntryImages(bytes)).toBe(true)
  })

  it('refuses a picture that isn’t what its name says', async () => {
    const cat = await storedGif('cat')
    const tampered = new Map([[cat, new TextEncoder().encode('dog')]])
    expect(await restoreEntryImages(tampered)).toBe(false)
  })
})
