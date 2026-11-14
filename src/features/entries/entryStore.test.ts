import { resetIndexedDb } from '../../test/resetIndexedDb'
import { JournalUnavailableError, openEntryStore } from './entryStore'
import { createJournalEntry } from './journalEntry'

const LOCAL_STORAGE_ENTRIES_KEY = 'write.entries.v2'

const monday = { ...createJournalEntry(), title: 'Monday' }

/** Makes IndexedDB refuse to open, as some browsers' strict privacy settings do. */
function breakIndexedDb() {
  vi.spyOn(indexedDB, 'open').mockImplementation(() => {
    throw new DOMException('Blocked', 'SecurityError')
  })
}

describe('openEntryStore', () => {
  beforeEach(() => {
    resetIndexedDb()
    window.localStorage.clear()
  })
  afterEach(() => vi.restoreAllMocks())

  it('moves the entries from localStorage, keeping that copy as a backup', async () => {
    const storedJournal = JSON.stringify([monday])
    window.localStorage.setItem(LOCAL_STORAGE_ENTRIES_KEY, storedJournal)
    expect((await openEntryStore()).storedEntries).toEqual([monday])
    expect(window.localStorage.getItem(LOCAL_STORAGE_ENTRIES_KEY)).toBe(
      storedJournal,
    )
  })

  it('loads what was saved to IndexedDB, not the old localStorage copy', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_ENTRIES_KEY, JSON.stringify([]))
    const { saveEntries } = await openEntryStore()
    saveEntries([monday])
    expect((await openEntryStore()).storedEntries).toEqual([monday])
  })

  it('keeps using localStorage when IndexedDB never opened', async () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_ENTRIES_KEY,
      JSON.stringify([monday]),
    )
    breakIndexedDb()
    const { storedEntries, saveEntries } = await openEntryStore()
    expect(storedEntries).toEqual([monday])
    saveEntries([])
    expect(window.localStorage.getItem(LOCAL_STORAGE_ENTRIES_KEY)).toBe('[]')
  })

  it('refuses the out-of-date localStorage copy once the entries have moved', async () => {
    await openEntryStore()
    breakIndexedDb()
    await expect(openEntryStore()).rejects.toThrow(JournalUnavailableError)
  })
})
