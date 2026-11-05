import type { JSONContent } from '@tiptap/react'
import { useEffect, useReducer } from 'react'
import { createEntriesState, entriesReducer } from './entriesReducer'
import {
  loadEntries,
  loadSelectedEntryId,
  saveEntries,
  saveSelectedEntryId,
} from './entriesStorage'
import {
  createJournalEntry,
  resolveRenamedTitle,
  type JournalEntry,
} from './journalEntry'

function loadInitialState() {
  return createEntriesState(
    loadEntries(),
    loadSelectedEntryId(),
    createJournalEntry(),
  )
}

export function useEntries() {
  const [{ entries, selectedEntryId }, dispatch] = useReducer(
    entriesReducer,
    undefined,
    loadInitialState,
  )
  const selectedEntry =
    entries.find(({ id }) => id === selectedEntryId) ?? entries[0]

  useEffect(() => saveEntries(entries), [entries])
  useEffect(() => saveSelectedEntryId(selectedEntryId), [selectedEntryId])

  return {
    entries,
    selectedEntry,
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
        title: resolveRenamedTitle(entry, rawTitle),
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
