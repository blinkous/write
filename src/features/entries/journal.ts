import type { JSONContent } from '@tiptap/react'
import { useSyncExternalStore } from 'react'
import {
  createEntriesState,
  entriesReducer,
  type EntriesAction,
  type EntriesState,
} from './entriesReducer'
import {
  loadEntrySort,
  loadSelectedEntryId,
  saveEntrySort,
  saveSelectedEntryId,
} from './entriesStorage'
import type { EntryStore } from './entryStore'
import type { EntrySort } from './entrySort'
import {
  createJournalEntry,
  readTitleDocument,
  renameEntryTitle,
  type JournalEntry,
} from './journalEntry'

type JournalOptions = {
  /** Where entries are loaded from and saved to (see openEntryStore). */
  entryStore: EntryStore
  /** What an empty journal starts with (e.g. a welcome entry); a blank entry by default. */
  createFirstEntry?: () => JournalEntry
}

/**
 * The journal's entries, which entry is open, and the list's order, held
 * outside React: content changes on every keystroke, and only what shows it
 * should re-render. Components subscribe to the part they show
 * (useJournalState); actions read the current entries when they run
 * (getState). Every change is saved, as before.
 */
export type Journal = ReturnType<typeof createJournal>

export function createJournal({
  entryStore: { storedEntries, saveEntries },
  createFirstEntry = createJournalEntry,
}: JournalOptions) {
  let state = createEntriesState(
    storedEntries,
    loadSelectedEntryId(),
    createFirstEntry(),
    loadEntrySort(),
  )
  const listeners = new Set<() => void>()

  /** Saves what changed (all of it at the start, e.g. a new first entry). */
  function save(previousState: EntriesState | null) {
    const { entries, selectedEntryId, sort } = state
    if (entries !== previousState?.entries) saveEntries(entries)
    if (selectedEntryId !== previousState?.selectedEntryId)
      saveSelectedEntryId(selectedEntryId)
    if (sort !== previousState?.sort) saveEntrySort(sort)
  }

  function dispatch(action: EntriesAction) {
    const previousState = state
    state = entriesReducer(state, action)
    if (state === previousState) return
    save(previousState)
    for (const listener of listeners) listener()
  }

  save(null)

  return {
    getState: (): EntriesState => state,
    /** The open entry, as it is now. */
    getSelectedEntry: (): JournalEntry =>
      findEntry(state, state.selectedEntryId),
    /** An entry as it is now, e.g. for an action on it. */
    getEntry: (entryId: string): JournalEntry => findEntry(state, entryId),
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setSort: (sort: EntrySort) => dispatch({ type: 'sort', sort }),
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
    renameEntry: (entryId: string, rawTitle: string) =>
      dispatch({
        type: 'rename',
        entryId,
        ...renameEntryTitle(findEntry(state, entryId), rawTitle),
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

/** The entry with this id; the first one if it's gone (the journal is never empty). */
function findEntry({ entries }: EntriesState, entryId: string): JournalEntry {
  return entries.find(({ id }) => id === entryId) ?? entries[0]
}

/**
 * Re-renders the component only when the part of the journal it picks
 * changes. The pick must return something kept as is between changes: a
 * field of the state (e.g. `entries`), or a string or number.
 */
export function useJournalState<Picked>(
  journal: Journal,
  pick: (state: EntriesState) => Picked,
): Picked {
  return useSyncExternalStore(journal.subscribe, () => pick(journal.getState()))
}
