import { z } from 'zod'
import {
  backUpRawValue,
  findStoredKeys,
  getBackupKeyPrefix,
  hasStoredValue,
  readRawValue,
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from '../../lib/localStore'
import { reportSaveResult } from '../../lib/saveStatus'
import { migrateEntryFromFormat1 } from './entryMigration'
import { DEFAULT_ENTRY_SORT, isEntrySort, type EntrySort } from './entrySort'
import type { JournalEntry } from './journalEntry'
import { storedEntriesSchema } from './storedEntrySchema'

/*
 * Entries live in IndexedDB (see entryDatabase.ts). These localStorage keys
 * held them before, and still do where IndexedDB can't open; once entries
 * have moved, they're cleared (see listLocalStorageJournal). v2 reserves `#`
 * headings for entry titles; v1 is read once and migrated.
 */
const ENTRIES_STORAGE_KEY = 'write.entries.v2'
const FORMAT_1_ENTRIES_STORAGE_KEY = 'write.entries.v1'
const JOURNAL_STORAGE_KEYS = [ENTRIES_STORAGE_KEY, FORMAT_1_ENTRIES_STORAGE_KEY]
const SELECTED_ENTRY_STORAGE_KEY = 'write.selectedEntryId.v1'
const ENTRY_SORT_STORAGE_KEY = 'write.entrySort.v1'
/** Set once the entries have moved to IndexedDB, after which a journal here would be out of date. */
const ENTRIES_MOVED_STORAGE_KEY = 'write.entriesMovedToIndexedDb.v1'

type InvalidValueHandler = (key: string, rawValue: string) => void

function readEntries(
  key: string,
  onInvalidValue?: InvalidValueHandler,
): JournalEntry[] {
  return readStoredValue(key, storedEntriesSchema, [], {
    onInvalidValue: (rawValue) => onInvalidValue?.(key, rawValue),
  })
}

/**
 * The entries kept in localStorage: v2, or on first run after the format
 * change, the v1 entries migrated (saved as v2 by the caller's next save).
 * Idempotent: once v2 exists, v1 is never read again. An unreadable journal
 * reads as empty, handed to `onInvalidValue`.
 */
function readLocalStorageJournal(
  onInvalidValue?: InvalidValueHandler,
): JournalEntry[] {
  if (hasStoredValue(ENTRIES_STORAGE_KEY))
    return readEntries(ENTRIES_STORAGE_KEY, onInvalidValue)
  return readEntries(FORMAT_1_ENTRIES_STORAGE_KEY, onInvalidValue).map(
    migrateEntryFromFormat1,
  )
}

/** For moving to IndexedDB: the entries, with nothing written (an unreadable journal is backed up by the cleanup, see listLocalStorageJournal). */
export function readLocalStorageEntries(): JournalEntry[] {
  return readLocalStorageJournal()
}

/** For when IndexedDB can't open: the entries, an unreadable journal backed up here first so nothing is overwritten. */
export function loadLocalStorageEntries(): JournalEntry[] {
  return readLocalStorageJournal(backUpRawValue)
}

/** A journal key left in localStorage; `needsBackup` unless its entries are readable (so already in IndexedDB). */
export type LocalStorageJournalItem = {
  key: string
  rawValue: string
  needsBackup: boolean
}

/** Everything the journal left in localStorage: its copies (v1, v2) and backups of unreadable ones. */
export function listLocalStorageJournal(): LocalStorageJournalItem[] {
  const copies = JOURNAL_STORAGE_KEYS.flatMap((key) => {
    const rawValue = readRawValue(key)
    if (rawValue === null) return []
    let needsBackup = false
    readEntries(key, () => {
      needsBackup = true
    })
    return [{ key, rawValue, needsBackup }]
  })
  const backups = JOURNAL_STORAGE_KEYS.flatMap((key) =>
    findStoredKeys(getBackupKeyPrefix(key)).flatMap((backupKey) => {
      const rawValue = readRawValue(backupKey)
      return rawValue === null
        ? []
        : [{ key: backupKey, rawValue, needsBackup: true }]
    }),
  )
  return [...copies, ...backups]
}

export function removeLocalStorageJournal(
  items: readonly LocalStorageJournalItem[],
): void {
  for (const { key } of items) removeStoredValue(key)
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
