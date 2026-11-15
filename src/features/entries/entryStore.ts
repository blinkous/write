import { createDatabaseEntryStore } from './databaseEntryStore'
import {
  backUpRecords,
  moveEntriesFromLocalStorage,
  openEntryDatabase,
  readEntries,
  type EntryDatabase,
} from './entryDatabase'
import {
  haveEntriesMovedToIndexedDb,
  listLocalStorageJournal,
  loadLocalStorageEntries,
  markEntriesMovedToIndexedDb,
  readLocalStorageEntries,
  removeLocalStorageJournal,
  saveLocalStorageEntries,
} from './entriesStorage'
import {
  summarizeEntry,
  type EntryChanges,
  type EntrySummary,
  type JournalEntry,
} from './journalEntry'

/**
 * Where the journal's entries are kept, and the only place that holds all of
 * them. Reads include every change made so far, saved or not yet; writes
 * apply in the order they're made.
 */
export type EntryStore = {
  /** Every entry as stored at startup, without its writing. */
  storedSummaries: EntrySummary[]
  /** The entry, or null if there's none with this id. */
  getEntry: (entryId: string) => Promise<JournalEntry | null>
  getAllEntries: () => Promise<JournalEntry[]>
  /** Adds the entries (new, or imported). */
  putEntries: (entries: readonly JournalEntry[]) => void
  updateEntry: (entryId: string, changes: EntryChanges) => void
  deleteEntry: (entryId: string) => void
}

/** IndexedDB won't open, and the localStorage copy is out of date (see openEntryStore). */
export class JournalUnavailableError extends Error {}

/**
 * Opens the entries in IndexedDB, first moving them over from localStorage
 * (once), then clearing the journal out of localStorage. If IndexedDB can't be used, the entries stay in localStorage, unless
 * they've already moved: that copy is then out of date, so starting from it
 * would hide newer writing, and this throws JournalUnavailableError instead.
 */
export async function openEntryStore(): Promise<EntryStore> {
  try {
    const database = await openEntryDatabase()
    await moveEntriesFromLocalStorage(database, readLocalStorageEntries)
    markEntriesMovedToIndexedDb()
    // Housekeeping: if it fails, the journal opens anyway and it's tried again next time.
    await clearLocalStorageJournal(database).catch(() => {})
    const storedEntries = await readEntries(database)
    return createDatabaseEntryStore(database, storedEntries.map(summarizeEntry))
  } catch (error) {
    if (haveEntriesMovedToIndexedDb())
      throw new JournalUnavailableError('IndexedDB is unavailable', {
        cause: error,
      })
    return createMemoryEntryStore(
      loadLocalStorageEntries(),
      saveLocalStorageEntries,
    )
  }
}

/**
 * Entries kept here whole, each change handing all of them to `save`: for
 * localStorage, which holds the journal as one value (when IndexedDB can't
 * be used), and for tests.
 */
export function createMemoryEntryStore(
  entries: readonly JournalEntry[],
  save: (entries: JournalEntry[]) => void = () => {},
): EntryStore {
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]))
  const saveAll = () => save([...entriesById.values()])
  return {
    storedSummaries: entries.map(summarizeEntry),
    getEntry: async (entryId) => entriesById.get(entryId) ?? null,
    getAllEntries: async () => [...entriesById.values()],
    putEntries(newEntries) {
      for (const entry of newEntries) entriesById.set(entry.id, entry)
      saveAll()
    },
    updateEntry(entryId, changes) {
      const entry = entriesById.get(entryId)
      if (!entry) return
      entriesById.set(entryId, { ...entry, ...changes })
      saveAll()
    },
    deleteEntry(entryId) {
      entriesById.delete(entryId)
      saveAll()
    },
  }
}
/**
 * Removes the journal's localStorage copies once they're in IndexedDB, first
 * moving anything unreadable (backups, a journal that failed validation) to
 * the database's backups, so no writing is lost. If removal fails after the
 * backups are made, the next run backs them up again: duplicated, never lost.
 */
async function clearLocalStorageJournal(database: EntryDatabase) {
  const items = listLocalStorageJournal()
  await backUpRecords(
    database,
    items
      .filter(({ needsBackup }) => needsBackup)
      .map(({ key, rawValue }) => ({
        record: rawValue,
        source: `localStorage ${key}`,
      })),
  )
  removeLocalStorageJournal(items)
}
