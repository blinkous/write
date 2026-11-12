import type { JSONContent } from '@tiptap/react'
import { DEFAULT_ENTRY_SORT, sortEntries, type EntrySort } from './entrySort'
import {
  isEntryEmpty,
  sortEntriesNewestFirst,
  type JournalEntry,
} from './journalEntry'

type EntriesState = {
  /** Never empty, and always in `sort` order (the order the list shows). */
  entries: JournalEntry[]
  selectedEntryId: string
  sort: EntrySort
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
  | { type: 'sort'; sort: EntrySort }
  | {
      type: 'rename'
      entryId: string
      title: string | null
      titleContent: JSONContent | null
      updatedAt: string
    }

export function createEntriesState(
  storedEntries: readonly JournalEntry[],
  storedSelectedEntryId: string | null,
  fallbackEntry: JournalEntry,
  sort: EntrySort = DEFAULT_ENTRY_SORT,
): EntriesState {
  const entries = sortEntries(
    storedEntries.length > 0 ? storedEntries : [fallbackEntry],
    sort,
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
    sort,
  }
}

/** Applies the action, then keeps the entries in the chosen order. */
export function entriesReducer(
  state: EntriesState,
  action: EntriesAction,
): EntriesState {
  const nextState = reduceEntries(state, action)
  if (nextState.entries === state.entries && nextState.sort === state.sort)
    return nextState
  return {
    ...nextState,
    entries: sortEntries(nextState.entries, nextState.sort),
  }
}

function reduceEntries(
  state: EntriesState,
  action: EntriesAction,
): EntriesState {
  switch (action.type) {
    case 'create': {
      // Reuse an existing blank entry so repeated "new entry" clicks don't pile up empties.
      const blankEntry = state.entries.find(isEntryEmpty)
      if (blankEntry) return { ...state, selectedEntryId: blankEntry.id }
      return {
        ...state,
        entries: [action.newEntry, ...state.entries],
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
          entry.id === action.entryId &&
          (entry.title !== action.title ||
            entry.titleContent !== action.titleContent)
            ? {
                ...entry,
                title: action.title,
                titleContent: action.titleContent,
                updatedAt: action.updatedAt,
              }
            : entry,
        ),
      }
    }
    case 'add': {
      if (action.newEntries.length === 0) return state
      const [newestAddedEntry] = sortEntriesNewestFirst(action.newEntries)
      return {
        ...state,
        entries: [...state.entries, ...action.newEntries],
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
          ...state,
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
        ...state,
        entries: remainingEntries,
        selectedEntryId: nextSelectedEntry.id,
      }
    }
    case 'sort': {
      return { ...state, sort: action.sort }
    }
  }
}
