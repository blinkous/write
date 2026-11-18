import type { JSONContent } from '@tiptap/react'
import {
  loadEntrySort,
  loadSelectedEntryId,
  saveEntrySort,
  saveSelectedEntryId,
} from './entriesStorage'
import type { EntryStore } from './entryStore'
import { sortEntryIds, type EntrySort } from './entrySort'
import {
  createJournalEntry,
  getFirstLine,
  isEntryEmpty,
  readTitleDocument,
  renameEntryTitle,
  summarizeEntry,
  type EntryChanges,
  type EntrySummary,
  type JournalEntry,
} from './journalEntry'

type JournalOptions = {
  /** Where entries are kept (see openEntryStore). */
  entryStore: EntryStore
}

/** The entry in the editor, and the writing it opened with (the editor holds it from then on). */
export type OpenEntry = { id: string; initialContent: JSONContent }

export type JournalState = {
  /** Every entry's id, in the list's order. Never empty. */
  entryIds: readonly string[]
  /** Chosen in the list; becomes the open entry once its writing has loaded. */
  selectedEntryId: string
  openEntry: OpenEntry
  sort: EntrySort
}

/**
 * What the app knows about the journal: the list's order, a summary of each
 * entry (no writing), which entry is selected and which is open. The writing
 * stays in the entry store and the editor. Components subscribe to the part
 * they show (see useJournalState); actions that need writing
 * read it from the store when they run (getEntry, getAllEntries).
 */
export type Journal = Awaited<ReturnType<typeof openJournal>>

/** Rejects if the open entry's writing can't be read. */
export async function openJournal({ entryStore }: JournalOptions) {
  const summaries = new Map(
    entryStore.storedSummaries.map((summary) => [summary.id, summary]),
  )
  // An empty journal starts with a blank entry, ready to write in.
  let firstEntry: JournalEntry | null = null
  if (summaries.size === 0) {
    firstEntry = createJournalEntry()
    entryStore.putEntries([firstEntry])
    summaries.set(firstEntry.id, summarizeEntry(firstEntry))
  }
  const sort = loadEntrySort()
  const entryIds = sortEntryIds(summaries.values(), sort)
  const storedSelectedEntryId = loadSelectedEntryId()
  const selectedEntryId =
    storedSelectedEntryId && summaries.has(storedSelectedEntryId)
      ? storedSelectedEntryId
      : entryIds[0]
  const openEntry = firstEntry
    ? { id: firstEntry.id, initialContent: firstEntry.content }
    : await loadOpenEntry(selectedEntryId)

  let state: JournalState = { entryIds, selectedEntryId, openEntry, sort }
  const listeners = new Set<() => void>()
  saveSelectedEntryId(selectedEntryId)

  async function loadOpenEntry(entryId: string): Promise<OpenEntry> {
    const entry = await entryStore.getEntry(entryId)
    if (!entry) throw new Error(`Entry ${entryId} isn't stored`)
    return { id: entry.id, initialContent: entry.content }
  }

  function notify() {
    for (const listener of listeners) listener()
  }

  function setState(changes: Partial<JournalState>) {
    const previousState = state
    state = { ...state, ...changes }
    if (state.selectedEntryId !== previousState.selectedEntryId)
      saveSelectedEntryId(state.selectedEntryId)
    if (state.sort !== previousState.sort) saveEntrySort(state.sort)
    notify()
  }

  /** The list's order after summaries change; the same array when the order didn't. */
  function reorder(sort = state.sort): readonly string[] {
    return sortEntryIds(summaries.values(), sort, state.entryIds)
  }

  /** Saves the changes, and shows them wherever the entry is shown. */
  function changeEntry(entryId: string, changes: EntryChanges) {
    const summary = summaries.get(entryId)
    // Gone (e.g. deleted while its editor was still showing): nothing to change.
    if (!summary) return
    const { content, ...summaryChanges } = changes
    summaries.set(entryId, {
      ...summary,
      ...summaryChanges,
      ...(content && { firstLine: getFirstLine(content) }),
    })
    entryStore.updateEntry(entryId, changes)
    setState({ entryIds: reorder() })
  }

  /** Opens a new entry, whose writing is already at hand. */
  function openNewEntry(entry: JournalEntry) {
    setState({
      entryIds: reorder(),
      selectedEntryId: entry.id,
      openEntry: { id: entry.id, initialContent: entry.content },
    })
  }

  /** Selects it at once, and opens it once its writing has loaded (if it's still selected then). */
  async function selectEntry(entryId: string): Promise<void> {
    if (!summaries.has(entryId) || entryId === state.selectedEntryId) return
    if (entryId === state.openEntry.id) {
      setState({ selectedEntryId: entryId })
      return
    }
    setState({ selectedEntryId: entryId })
    try {
      const openEntry = await loadOpenEntry(entryId)
      if (state.selectedEntryId === entryId) setState({ openEntry })
    } catch (error) {
      // Back to the entry still in the editor.
      if (state.selectedEntryId === entryId)
        setState({ selectedEntryId: state.openEntry.id })
      throw error
    }
  }

  return {
    getState: (): JournalState => state,
    getSummary: (entryId: string): EntrySummary | undefined =>
      summaries.get(entryId),
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    /** The entry with its writing, as it is now. */
    async getEntry(entryId: string): Promise<JournalEntry> {
      const entry = await entryStore.getEntry(entryId)
      if (!entry) throw new Error(`Entry ${entryId} isn't stored`)
      return entry
    },
    /** Every entry with its writing, in the list's order. */
    async getAllEntries(): Promise<JournalEntry[]> {
      const entries = await entryStore.getAllEntries()
      const positions = new Map(state.entryIds.map((id, index) => [id, index]))
      return entries
        .filter(({ id }) => positions.has(id))
        .toSorted(
          (first, second) =>
            (positions.get(first.id) ?? 0) - (positions.get(second.id) ?? 0),
        )
    },
    setSort: (sort: EntrySort) => setState({ sort, entryIds: reorder(sort) }),
    selectEntry,
    /** Opens a blank entry: an existing one if there is one, so blanks don't pile up. */
    async createEntry(): Promise<void> {
      const blankEntryId = state.entryIds.find((entryId) => {
        const summary = summaries.get(entryId)
        return summary && isEntryEmpty(summary)
      })
      if (blankEntryId) return selectEntry(blankEntryId)
      const newEntry = createJournalEntry()
      entryStore.putEntries([newEntry])
      summaries.set(newEntry.id, summarizeEntry(newEntry))
      openNewEntry(newEntry)
    },
    updateEntryContent: (entryId: string, content: JSONContent) =>
      changeEntry(entryId, { content, updatedAt: new Date().toISOString() }),
    /** A rename from the list (plain text). */
    renameEntry(entryId: string, rawTitle: string) {
      const summary = summaries.get(entryId)
      if (!summary) return
      const renamed = renameEntryTitle(summary, rawTitle)
      if (
        renamed.title === summary.title &&
        renamed.titleContent === summary.titleContent
      )
        return
      changeEntry(entryId, { ...renamed, updatedAt: new Date().toISOString() })
    },
    /** Sets the title as typed and styled on the page (text trimmed). */
    setEntryTitle: (entryId: string, titleDocument: JSONContent) =>
      changeEntry(entryId, {
        ...readTitleDocument(titleDocument),
        updatedAt: new Date().toISOString(),
      }),
    /** Adds entries (e.g. imported ones) and opens the newest of them. */
    addEntries(newEntries: readonly JournalEntry[]) {
      const [newestEntry] = newEntries.toSorted((first, second) =>
        second.createdAt.localeCompare(first.createdAt),
      )
      if (!newestEntry) return
      entryStore.putEntries(newEntries)
      for (const entry of newEntries)
        summaries.set(entry.id, summarizeEntry(entry))
      openNewEntry(newestEntry)
    },
    /**
     * Deletes it; if it was selected, the entry that moves into its place is
     * opened. The last entry is replaced by a blank one: never empty.
     */
    async deleteEntry(entryId: string): Promise<void> {
      const deletedIndex = state.entryIds.indexOf(entryId)
      if (deletedIndex === -1) return
      summaries.delete(entryId)
      entryStore.deleteEntry(entryId)
      if (summaries.size === 0) {
        const replacementEntry = createJournalEntry()
        entryStore.putEntries([replacementEntry])
        summaries.set(replacementEntry.id, summarizeEntry(replacementEntry))
        openNewEntry(replacementEntry)
        return
      }
      const entryIds = reorder()
      const wasSelected = entryId === state.selectedEntryId
      setState({ entryIds })
      if (wasSelected)
        await selectEntry(entryIds[Math.min(deletedIndex, entryIds.length - 1)])
    },
  }
}
