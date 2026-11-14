import {
  backUpRecords,
  createEntrySaver,
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
import type { JournalEntry } from './journalEntry'

/** Where the journal's entries are kept: what was stored at startup, and how to save changes. */
export type EntryStore = {
  storedEntries: JournalEntry[]
  saveEntries: (entries: readonly JournalEntry[]) => void
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
    return {
      storedEntries,
      saveEntries: createEntrySaver(database, storedEntries),
    }
  } catch (error) {
    if (haveEntriesMovedToIndexedDb())
      throw new JournalUnavailableError('IndexedDB is unavailable', {
        cause: error,
      })
    return {
      storedEntries: loadLocalStorageEntries(),
      saveEntries: saveLocalStorageEntries,
    }
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
