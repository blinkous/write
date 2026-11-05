import type { JSONContent } from '@tiptap/react'
import {
  isEntryEmpty,
  sortEntriesNewestFirst,
  type JournalEntry,
} from './journalEntry'

type EntriesState = {
  /** Always sorted newest first and never empty. */
  entries: JournalEntry[]
  selectedEntryId: string
}

/* Actions carry generated ids and timestamps so the reducer stays pure. */
type EntriesAction =
  | { type: 'create'; newEntry: JournalEntry }
  | { type: 'select'; entryId: string }
  | {
      type: 'updateContent'
      entryId: string
      content: JSONContent
      updatedAt: string
    }
  | { type: 'delete'; entryId: string; replacementEntry: JournalEntry }
  | { type: 'add'; newEntries: readonly JournalEntry[] }
  | { type: 'rename'; entryId: string; title: string | null; updatedAt: string }

export function createEntriesState(
  storedEntries: readonly JournalEntry[],
  storedSelectedEntryId: string | null,
  fallbackEntry: JournalEntry,
): EntriesState {
  const entries = sortEntriesNewestFirst(
    storedEntries.length > 0 ? storedEntries : [fallbackEntry],
  )
  const [newestEntry] = entries
  const hasStoredSelection = entries.some(
    ({ id }) => id === storedSelectedEntryId,
  )
  return {
    entries,
    selectedEntryId:
      hasStoredSelection && storedSelectedEntryId
        ? storedSelectedEntryId
        : newestEntry.id,
  }
}

export function entriesReducer(
  state: EntriesState,
  action: EntriesAction,
): EntriesState {
  switch (action.type) {
    case 'create': {
      // Reuse an existing blank entry so repeated "new entry" clicks don't pile up empties.
      const blankEntry = state.entries.find(isEntryEmpty)
      if (blankEntry) return { ...state, selectedEntryId: blankEntry.id }
      return {
        entries: sortEntriesNewestFirst([action.newEntry, ...state.entries]),
        selectedEntryId: action.newEntry.id,
      }
    }
    case 'select': {
      const entryExists = state.entries.some(({ id }) => id === action.entryId)
      return entryExists ? { ...state, selectedEntryId: action.entryId } : state
    }
    case 'updateContent': {
      return {
        ...state,
        entries: state.entries.map((entry) =>
          entry.id === action.entryId
            ? { ...entry, content: action.content, updatedAt: action.updatedAt }
            : entry,
        ),
      }
    }
    case 'rename': {
      return {
        ...state,
        entries: state.entries.map((entry) =>
          entry.id === action.entryId && entry.title !== action.title
            ? { ...entry, title: action.title, updatedAt: action.updatedAt }
            : entry,
        ),
      }
    }
    case 'add': {
      if (action.newEntries.length === 0) return state
      const [newestAddedEntry] = sortEntriesNewestFirst(action.newEntries)
      return {
        entries: sortEntriesNewestFirst([
          ...state.entries,
          ...action.newEntries,
        ]),
        selectedEntryId: newestAddedEntry.id,
      }
    }
    case 'delete': {
      const deletedIndex = state.entries.findIndex(
        ({ id }) => id === action.entryId,
      )
      if (deletedIndex === -1) return state
      const remainingEntries = state.entries.filter(
        ({ id }) => id !== action.entryId,
      )
      if (remainingEntries.length === 0) {
        return {
          entries: [action.replacementEntry],
          selectedEntryId: action.replacementEntry.id,
        }
      }
      if (state.selectedEntryId !== action.entryId)
        return { ...state, entries: remainingEntries }
      // Select the entry that moved into the deleted one's place, or the new last one.
      const nextSelectedEntry =
        remainingEntries[Math.min(deletedIndex, remainingEntries.length - 1)]
      return {
        entries: remainingEntries,
        selectedEntryId: nextSelectedEntry.id,
      }
    }
  }
}
