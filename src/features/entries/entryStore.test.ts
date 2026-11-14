import { resetIndexedDb } from '../../test/resetIndexedDb'
import { openEntryDatabase } from './entryDatabase'
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

async function readDatabaseBackups() {
  const database = await openEntryDatabase()
  const backups = await database.getAll('backup')
  database.close()
  return backups
}

describe('openEntryStore', () => {
  beforeEach(() => {
    resetIndexedDb()
    window.localStorage.clear()
  })
  afterEach(() => vi.restoreAllMocks())

  it('moves the entries from localStorage, then clears them out of it', async () => {
    window.localStorage.setItem(
      LOCAL_STORAGE_ENTRIES_KEY,
      JSON.stringify([monday]),
    )
    window.localStorage.setItem('write.entries.v1', '[]')
    expect((await openEntryStore()).storedEntries).toEqual([monday])
    expect(Object.keys(window.localStorage)).toEqual([
      'write.entriesMovedToIndexedDb.v1',
    ])
  })

  it('moves unreadable journals and old backups to the database before clearing them', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_ENTRIES_KEY, '{unreadable')
    const backupKey = `${LOCAL_STORAGE_ENTRIES_KEY}.backup.2026-11-01T09:00:00.000Z`
    window.localStorage.setItem(backupKey, '[{"id":"old"}]')
    expect((await openEntryStore()).storedEntries).toEqual([])
    expect(await readDatabaseBackups()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          record: '{unreadable',
          source: `localStorage ${LOCAL_STORAGE_ENTRIES_KEY}`,
        }),
        expect.objectContaining({
          record: '[{"id":"old"}]',
          source: `localStorage ${backupKey}`,
        }),
      ]),
    )
    expect(window.localStorage.getItem(backupKey)).toBeNull()
  })

  it('clears a copy left from before the cleanup existed, without backing it up', async () => {
    await openEntryStore()
    window.localStorage.setItem(
      LOCAL_STORAGE_ENTRIES_KEY,
      JSON.stringify([monday]),
    )
    await openEntryStore()
    expect(window.localStorage.getItem(LOCAL_STORAGE_ENTRIES_KEY)).toBeNull()
    expect(await readDatabaseBackups()).toEqual([])
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
