import { resetIndexedDb } from '../../test/resetIndexedDb'
import {
  moveEntriesFromLocalStorage,
  openEntryDatabase,
  readEntries,
  type EntryDatabase,
} from './entryDatabase'
import { createJournalEntry, type JournalEntry } from './journalEntry'

function createTitledEntry(title: string): JournalEntry {
  return { ...createJournalEntry(), title }
}

describe('entryDatabase', () => {
  let database: EntryDatabase
  beforeEach(async () => {
    resetIndexedDb()
    database = await openEntryDatabase()
  })
  afterEach(() => {
    database.close()
    vi.restoreAllMocks()
  })

  describe('moveEntriesFromLocalStorage', () => {
    it('copies the entries over once, never reading localStorage again', async () => {
      const monday = createTitledEntry('Monday')
      const loadLocalStorageEntries = vi.fn(() => [monday])
      await moveEntriesFromLocalStorage(database, loadLocalStorageEntries)
      await moveEntriesFromLocalStorage(database, loadLocalStorageEntries)
      expect(loadLocalStorageEntries).toHaveBeenCalledOnce()
      expect(await readEntries(database)).toEqual([monday])
    })

    it('counts an empty journal as moved', async () => {
      await moveEntriesFromLocalStorage(database, () => [])
      const loadLocalStorageEntries = vi.fn(() => [])
      await moveEntriesFromLocalStorage(database, loadLocalStorageEntries)
      expect(loadLocalStorageEntries).not.toHaveBeenCalled()
    })
  })

  describe('readEntries', () => {
    it('moves invalid records to the backup store instead of dropping them', async () => {
      const monday = createTitledEntry('Monday')
      const invalidRecord = { id: 'broken', content: 'not a document' }
      await database.put('entry', monday)
      await database.put('entry', invalidRecord)
      expect(await readEntries(database)).toEqual([monday])
      expect(await database.getAll('backup')).toEqual([
        {
          backedUpAt: expect.any(String),
          record: invalidRecord,
          source: 'entry',
        },
      ])
      expect(await database.getAllKeys('entry')).toEqual([monday.id])
    })
  })
})
