import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { JournalEntry } from './journalEntry'
import { storedEntrySchema } from './storedEntrySchema'

/*
 * The journal's entries, one record per entry, in this browser's IndexedDB:
 * far more room than localStorage, and each change writes only the entries it
 * touched (see databaseEntryStore). Owned by the entries feature (files live apart, in lib/blobStore).
 */
const DATABASE_NAME = 'write-journal'
const DATABASE_VERSION = 1
/** In `meta`: when the entries were copied over from localStorage. */
const MOVED_FROM_LOCAL_STORAGE_KEY = 'movedFromLocalStorageAt'

type EntryBackup = {
  backedUpAt: string
  record: unknown
  /** Where the record was: "entry" store, or a localStorage key. Missing on the first backups made. */
  source?: string
}

interface EntryDatabaseSchema extends DBSchema {
  /** Validated on every read, since stored data may predate today's format. */
  entry: { key: string; value: unknown }
  meta: { key: string; value: string }
  /** Entry records that failed validation, kept rather than dropped. */
  backup: { key: number; value: EntryBackup }
}

export type EntryDatabase = IDBPDatabase<EntryDatabaseSchema>

export function openEntryDatabase(): Promise<EntryDatabase> {
  return openDB<EntryDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database, oldVersion) {
      // Each step upgrades from the version before, so any older database catches up.
      if (oldVersion < 1) {
        database.createObjectStore('entry', { keyPath: 'id' })
        database.createObjectStore('meta')
        database.createObjectStore('backup', { autoIncrement: true })
      }
    },
    // A newer version opened in another tab: let it upgrade. Saves here then fail, and say so.
    blocking: (_currentVersion, _blockedVersion, event) => {
      const database = event.target
      if (database instanceof IDBDatabase) database.close()
    },
  })
}

/**
 * Copies the entries kept in localStorage into the database, once: the copy
 * and a marker are written together, so it's never repeated or half done.
 * `loadLocalStorageEntries` is only called (it parses the whole journal) while
 * the move hasn't happened.
 */
export async function moveEntriesFromLocalStorage(
  database: EntryDatabase,
  loadLocalStorageEntries: () => JournalEntry[],
): Promise<void> {
  if (await database.get('meta', MOVED_FROM_LOCAL_STORAGE_KEY)) return
  const localStorageEntries = loadLocalStorageEntries()
  const transaction = database.transaction(['entry', 'meta'], 'readwrite')
  const metaStore = transaction.objectStore('meta')
  const entryStore = transaction.objectStore('entry')
  async function copyUnlessMoved() {
    // Checked again inside the write, in case another tab moved them meanwhile.
    if (await metaStore.get(MOVED_FROM_LOCAL_STORAGE_KEY)) return
    await Promise.all([
      ...localStorageEntries.map((entry) => entryStore.put(entry)),
      metaStore.put(new Date().toISOString(), MOVED_FROM_LOCAL_STORAGE_KEY),
    ])
  }
  await Promise.all([copyUnlessMoved(), transaction.done])
}

/** Every valid entry; invalid records move to `backup` (in the same transaction), never dropped. */
export async function readEntries(
  database: EntryDatabase,
): Promise<JournalEntry[]> {
  const transaction = database.transaction(['entry', 'backup'], 'readwrite')
  const backupStore = transaction.objectStore('backup')
  async function collectValidEntries() {
    const entries: JournalEntry[] = []
    for await (const cursor of transaction.objectStore('entry')) {
      const result = storedEntrySchema.safeParse(cursor.value)
      if (result.success) {
        entries.push(result.data)
        continue
      }
      await Promise.all([
        backupStore.add(createBackup(cursor.value, 'entry')),
        cursor.delete(),
      ])
    }
    return entries
  }
  const [entries] = await Promise.all([collectValidEntries(), transaction.done])
  return entries
}

/** Keeps records that can't be read as entries (e.g. an unreadable localStorage journal) in `backup`. */
export async function backUpRecords(
  database: EntryDatabase,
  records: readonly { record: unknown; source: string }[],
): Promise<void> {
  if (records.length === 0) return
  const transaction = database.transaction('backup', 'readwrite')
  await Promise.all([
    ...records.map(({ record, source }) =>
      transaction.store.add(createBackup(record, source)),
    ),
    transaction.done,
  ])
}

function createBackup(record: unknown, source: string): EntryBackup {
  return { backedUpAt: new Date().toISOString(), record, source }
}

/** A record read back from the database, if it's a valid entry. */
export function parseStoredEntry(record: unknown): JournalEntry | null {
  const result = storedEntrySchema.safeParse(record)
  return result.success ? result.data : null
}
