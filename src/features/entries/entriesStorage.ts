import { z } from 'zod'
import {
  backUpRawValue,
  hasStoredValue,
  readStoredValue,
  writeStoredValue,
} from '../../lib/localStore'
import { reportSaveResult } from '../../lib/saveStatus'
import { migrateEntryFromFormat1 } from './entryMigration'
import { DEFAULT_ENTRY_SORT, isEntrySort, type EntrySort } from './entrySort'
import type { JournalEntry } from './journalEntry'
import { storedEntriesSchema } from './storedEntrySchema'

/*
 * Entries live in IndexedDB (see entryDatabase.ts). These localStorage keys
 * held them before, and still do where IndexedDB can't open. v2 reserves `#`
 * headings for entry titles; v1 is read once, migrated, and left in place
 * untouched as a backup.
 */
const ENTRIES_STORAGE_KEY = 'write.entries.v2'
const FORMAT_1_ENTRIES_STORAGE_KEY = 'write.entries.v1'
const SELECTED_ENTRY_STORAGE_KEY = 'write.selectedEntryId.v1'
const ENTRY_SORT_STORAGE_KEY = 'write.entrySort.v1'
/** Set once the entries have moved to IndexedDB, after which the copy here is out of date. */
const ENTRIES_MOVED_STORAGE_KEY = 'write.entriesMovedToIndexedDb.v1'

/** Unreadable journals are backed up before the app starts fresh, so nothing is overwritten. */
function readEntries(key: string): JournalEntry[] {
  return readStoredValue(key, storedEntriesSchema, [], {
    onInvalidValue: (rawValue) => backUpRawValue(key, rawValue),
  })
}

/**
 * The entries kept in localStorage, or on first run after the format change,
 * the v1 entries migrated (saved as v2 by the caller's next save). Idempotent:
 * once v2 exists, v1 is never read again.
 */
export function loadLocalStorageEntries(): JournalEntry[] {
  if (hasStoredValue(ENTRIES_STORAGE_KEY))
    return readEntries(ENTRIES_STORAGE_KEY)
  return readEntries(FORMAT_1_ENTRIES_STORAGE_KEY).map(migrateEntryFromFormat1)
}

/** Saves the entries to localStorage; a failure (e.g. storage is full) is reported, never ignored (see lib/saveStatus). */
export function saveLocalStorageEntries(
  entries: readonly JournalEntry[],
): void {
  reportSaveResult('entries', writeStoredValue(ENTRIES_STORAGE_KEY, entries))
}

export function markEntriesMovedToIndexedDb(): void {
  writeStoredValue(ENTRIES_MOVED_STORAGE_KEY, true)
}

export function haveEntriesMovedToIndexedDb(): boolean {
  return readStoredValue(ENTRIES_MOVED_STORAGE_KEY, z.boolean(), false)
}

export function loadSelectedEntryId(): string | null {
  return readStoredValue(
    SELECTED_ENTRY_STORAGE_KEY,
    z.string().nullable(),
    null,
  )
}

export function saveSelectedEntryId(entryId: string): void {
  writeStoredValue(SELECTED_ENTRY_STORAGE_KEY, entryId)
}

/** The list's sort order; unknown values fall back to the default. */
export function loadEntrySort(): EntrySort {
  return readStoredValue(
    ENTRY_SORT_STORAGE_KEY,
    z.custom<EntrySort>(isEntrySort),
    DEFAULT_ENTRY_SORT,
  )
}

/** The sort is a setting (exported with settings), so a failed save is reported too. */
export function saveEntrySort(sort: EntrySort): void {
  reportSaveResult('entrySort', writeStoredValue(ENTRY_SORT_STORAGE_KEY, sort))
}
