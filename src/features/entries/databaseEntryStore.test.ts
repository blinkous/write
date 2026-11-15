import { getSaveFailure, reportSaveResult } from '../../lib/saveStatus'
import { resetIndexedDb } from '../../test/resetIndexedDb'
import { createDatabaseEntryStore } from './databaseEntryStore'
import { openEntryDatabase, type EntryDatabase } from './entryDatabase'
import type { EntryStore } from './entryStore'
import { createJournalEntry, type JournalEntry } from './journalEntry'

function createTitledEntry(title: string): JournalEntry {
  return { ...createJournalEntry(), title }
}

/** Fails the database's next transaction, as when storage is full. */
function failNextTransaction(database: EntryDatabase) {
  vi.spyOn(database, 'transaction').mockImplementationOnce(() => {
    throw new DOMException('Full', 'QuotaExceededError')
  })
}

/** Waits until nothing is waiting to be written. */
async function waitForWrites(entryStore: EntryStore, database: EntryDatabase) {
  await vi.waitFor(async () =>
    expect(await database.getAll('entry')).toEqual(
      expect.arrayContaining(await entryStore.getAllEntries()),
    ),
  )
}

describe('createDatabaseEntryStore', () => {
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

  it('writes only the entry that changed, keeping the rest of it as stored', async () => {
    const monday = createTitledEntry('Monday')
    const tuesday = createTitledEntry('Tuesday')
    await database.put('entry', monday)
    await database.put('entry', tuesday)
    // Changed behind the store's back: rewriting Tuesday would undo this.
    await database.put('entry', { ...tuesday, content: { type: 'doc' } })
    const entryStore = createDatabaseEntryStore(database, [])
    entryStore.updateEntry(monday.id, { title: 'Renamed' })
    await waitForWrites(entryStore, database)
    expect(await database.get('entry', monday.id)).toEqual({
      ...monday,
      title: 'Renamed',
    })
    expect(await database.get('entry', tuesday.id)).toEqual({
      ...tuesday,
      content: { type: 'doc' },
    })
  })

  it('reads the latest writing, written or not', async () => {
    const monday = createTitledEntry('Monday')
    const entryStore = createDatabaseEntryStore(database, [])
    entryStore.putEntries([monday])
    entryStore.updateEntry(monday.id, { title: 'First' })
    entryStore.updateEntry(monday.id, { title: 'Second' })
    expect(await entryStore.getEntry(monday.id)).toEqual({
      ...monday,
      title: 'Second',
    })
    entryStore.deleteEntry(monday.id)
    expect(await entryStore.getEntry(monday.id)).toBeNull()
    expect(await entryStore.getAllEntries()).toEqual([])
  })

  it('keeps a failed write, reports it, and writes it with the next change', async () => {
    const monday = createTitledEntry('Monday')
    const tuesday = createTitledEntry('Tuesday')
    const entryStore = createDatabaseEntryStore(database, [])
    failNextTransaction(database)
    entryStore.putEntries([monday])
    await vi.waitFor(() => expect(getSaveFailure()).not.toBeNull())
    // Not saved, but still there for exports.
    expect(await entryStore.getAllEntries()).toEqual([monday])

    entryStore.putEntries([tuesday])
    await vi.waitFor(() => expect(getSaveFailure()).toBeNull())
    expect(await database.getAll('entry')).toEqual(
      expect.arrayContaining([monday, tuesday]),
    )
  })
})
