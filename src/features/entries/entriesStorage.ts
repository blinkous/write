import type { JSONContent } from '@tiptap/react'
import { z } from 'zod'
import {
  backUpRawValue,
  readStoredValue,
  writeStoredValue,
} from '../../lib/localStore'
import { entryTitleSchema, type JournalEntry } from './journalEntry'

const ENTRIES_STORAGE_KEY = 'write.entries.v1'
const SELECTED_ENTRY_STORAGE_KEY = 'write.selectedEntryId.v1'

function isDocumentContent(value: unknown): value is JSONContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'doc'
  )
}

const journalEntrySchema = z.object({
  id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  title: entryTitleSchema,
  content: z.custom<JSONContent>(isDocumentContent),
})

const entriesSchema = z.array(journalEntrySchema)

/** Unreadable journals are backed up before the app starts fresh, so nothing is overwritten. */
export function loadEntries(): JournalEntry[] {
  return readStoredValue(ENTRIES_STORAGE_KEY, entriesSchema, [], {
    onInvalidValue: (rawValue) => backUpRawValue(ENTRIES_STORAGE_KEY, rawValue),
  })
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
