import { getSaveFailure, reportSaveResult } from '../../lib/saveStatus'
import { resetIndexedDb } from '../../test/resetIndexedDb'
import {
  createEntrySaver,
  moveEntriesFromLocalStorage,
  openEntryDatabase,
  readEntries,
  type EntryDatabase,
} from './entryDatabase'
import { createJournalEntry, type JournalEntry } from './journalEntry'

function createTitledEntry(title: string): JournalEntry {
  return { ...createJournalEntry(), title }
}

/** Fails the database's next transaction, as when storage is full. */
function failNextWrite(database: EntryDatabase) {
  vi.spyOn(database, 'transaction').mockImplementationOnce(() => {
    throw new DOMException('Full', 'QuotaExceededError')
  })
}

/** Waits for queued saves: a read waits for the writes before it. */
async function readStoredRecords(database: EntryDatabase) {
  return database.getAll('entry')
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
    reportSaveResult('entries', true)
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
        { backedUpAt: expect.any(String), record: invalidRecord },
      ])
      expect(await database.getAllKeys('entry')).toEqual([monday.id])
    })
  })

  describe('createEntrySaver', () => {
    it('writes only changed entries and deletes removed ones', async () => {
      const monday = createTitledEntry('Monday')
      const tuesday = createTitledEntry('Tuesday')
      await database.put('entry', monday)
      await database.put('entry', tuesday)
      // Changed behind the saver's back: only rewriting Monday would undo this.
      await database.put('entry', { ...monday, title: 'Edited elsewhere' })
      const saveEntries = createEntrySaver(database, [monday, tuesday])

      const wednesday = createTitledEntry('Wednesday')
      saveEntries([monday, wednesday])
      const records = await readStoredRecords(database)
      expect(records).toHaveLength(2)
      expect(records).toEqual(
        expect.arrayContaining([
          { ...monday, title: 'Edited elsewhere' },
          wednesday,
        ]),
      )
    })

    it('reports a failed write, then saves everything once writing works again', async () => {
      const monday = createTitledEntry('Monday')
      const saveEntries = createEntrySaver(database, [])
      failNextWrite(database)
      saveEntries([monday])
      await vi.waitFor(() => expect(getSaveFailure()).not.toBeNull())

      // Tuesday is the only change, but Monday, missed by the failed write, is saved too.
      const tuesday = createTitledEntry('Tuesday')
      saveEntries([monday, tuesday])
      expect(await readStoredRecords(database)).toEqual(
        expect.arrayContaining([monday, tuesday]),
      )
      await vi.waitFor(() => expect(getSaveFailure()).toBeNull())
    })

    it('leaves the database alone when nothing changed', async () => {
      const monday = createTitledEntry('Monday')
      const saveEntries = createEntrySaver(database, [monday])
      const transaction = vi.spyOn(database, 'transaction')
      saveEntries([monday])
      expect(transaction).not.toHaveBeenCalled()
    })
  })
})
