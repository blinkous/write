import type { JSONContent } from '@tiptap/react'
import { useEffect, useReducer } from 'react'
import { createEntriesState, entriesReducer } from './entriesReducer'
import {
  loadEntries,
  loadEntrySort,
  loadSelectedEntryId,
  saveEntries,
  saveEntrySort,
  saveSelectedEntryId,
} from './entriesStorage'
import type { EntrySort } from './entrySort'
import {
  createJournalEntry,
  readTitleDocument,
  renameEntryTitle,
  type JournalEntry,
} from './journalEntry'

type UseEntriesOptions = {
  /** What an empty journal starts with (e.g. a welcome entry); a blank entry by default. */
  createFirstEntry?: () => JournalEntry
}

export function useEntries({
  createFirstEntry = createJournalEntry,
}: UseEntriesOptions = {}) {
  const [{ entries, selectedEntryId, sort }, dispatch] = useReducer(
    entriesReducer,
    createFirstEntry,
    (createFallbackEntry) =>
      createEntriesState(
        loadEntries(),
        loadSelectedEntryId(),
        createFallbackEntry(),
        loadEntrySort(),
      ),
  )
  const selectedEntry =
    entries.find(({ id }) => id === selectedEntryId) ?? entries[0]

  useEffect(() => saveEntries(entries), [entries])
  useEffect(() => saveSelectedEntryId(selectedEntryId), [selectedEntryId])
  useEffect(() => saveEntrySort(sort), [sort])

  return {
    entries,
    selectedEntry,
    sort,
    setSort: (nextSort: EntrySort) =>
      dispatch({ type: 'sort', sort: nextSort }),
    createEntry: () =>
      dispatch({ type: 'create', newEntry: createJournalEntry() }),
    selectEntry: (entryId: string) => dispatch({ type: 'select', entryId }),
    updateEntryContent: (entryId: string, content: JSONContent) =>
      dispatch({
        type: 'updateContent',
        entryId,
        content,
        updatedAt: new Date().toISOString(),
      }),
    renameEntry: (entry: JournalEntry, rawTitle: string) =>
      dispatch({
        type: 'rename',
        entryId: entry.id,
        ...renameEntryTitle(entry, rawTitle),
        updatedAt: new Date().toISOString(),
      }),
    /** Sets the title as typed and styled on the page (text trimmed). */
    setEntryTitle: (entryId: string, titleDocument: JSONContent) =>
      dispatch({
        type: 'rename',
        entryId,
        ...readTitleDocument(titleDocument),
        updatedAt: new Date().toISOString(),
      }),
    addEntries: (newEntries: readonly JournalEntry[]) =>
      dispatch({ type: 'add', newEntries }),
    deleteEntry: (entryId: string) =>
      dispatch({
        type: 'delete',
        entryId,
        replacementEntry: createJournalEntry(),
      }),
  }
}
