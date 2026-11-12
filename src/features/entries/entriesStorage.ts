import type { JSONContent } from '@tiptap/react'
import { z } from 'zod'
import {
  backUpRawValue,
  hasStoredValue,
  readStoredValue,
  writeStoredValue,
} from '../../lib/localStore'
import { migrateEntryFromFormat1 } from './entryMigration'
import { DEFAULT_ENTRY_SORT, isEntrySort, type EntrySort } from './entrySort'
import {
  entryTitleSchema,
  reconcileTitleContent,
  type JournalEntry,
} from './journalEntry'

/*
 * v2 reserves `#` headings for entry titles. v1 is read once, migrated, and
 * left in place untouched as a backup.
 */
const ENTRIES_STORAGE_KEY = 'write.entries.v2'
const FORMAT_1_ENTRIES_STORAGE_KEY = 'write.entries.v1'
const SELECTED_ENTRY_STORAGE_KEY = 'write.selectedEntryId.v1'
const ENTRY_SORT_STORAGE_KEY = 'write.entrySort.v1'

function isDocumentContent(value: unknown): value is JSONContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'doc'
  )
}

const journalEntrySchema = z
  .object({
    id: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    title: entryTitleSchema,
    titleContent: z.unknown().optional(),
    content: z.custom<JSONContent>(isDocumentContent),
  })
  // Styling that's invalid or no longer matches the title is dropped, keeping the title.
  .transform(({ titleContent, ...entry }) => ({
    ...entry,
    titleContent: reconcileTitleContent(entry.title, titleContent),
  }))

const entriesSchema = z.array(journalEntrySchema)

/** Unreadable journals are backed up before the app starts fresh, so nothing is overwritten. */
function readEntries(key: string): JournalEntry[] {
  return readStoredValue(key, entriesSchema, [], {
    onInvalidValue: (rawValue) => backUpRawValue(key, rawValue),
  })
}

/**
 * Current entries, or on first run after the format change, the v1 entries
 * migrated (saved as v2 by the caller's next save). Idempotent: once v2 exists,
 * v1 is never read again.
 */
export function loadEntries(): JournalEntry[] {
  if (hasStoredValue(ENTRIES_STORAGE_KEY))
    return readEntries(ENTRIES_STORAGE_KEY)
  return readEntries(FORMAT_1_ENTRIES_STORAGE_KEY).map(migrateEntryFromFormat1)
}

export function saveEntries(entries: readonly JournalEntry[]): void {
  writeStoredValue(ENTRIES_STORAGE_KEY, entries)
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

export function saveEntrySort(sort: EntrySort): void {
  writeStoredValue(ENTRY_SORT_STORAGE_KEY, sort)
}
