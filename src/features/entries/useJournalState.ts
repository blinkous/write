import { useSyncExternalStore } from 'react'
import type { Journal, JournalState } from './journal'
import type { EntrySummary } from './journalEntry'

/**
 * Re-renders the component only when the part of the journal it picks
 * changes. The pick must return something kept as is between changes: a
 * field of the state (e.g. `entryIds`), or a string or number.
 */
export function useJournalState<Picked>(
  journal: Journal,
  pick: (state: JournalState) => Picked,
): Picked {
  return useSyncExternalStore(journal.subscribe, () => pick(journal.getState()))
}

/**
 * Something shown about one entry (e.g. its name); re-renders only when that
 * changes. The same rule applies to the pick as for useJournalState.
 * Undefined once the entry is deleted.
 */
export function useEntrySummary<Picked>(
  journal: Journal,
  entryId: string,
  pick: (summary: EntrySummary, state: JournalState) => Picked,
): Picked | undefined {
  return useSyncExternalStore(journal.subscribe, () => {
    const summary = journal.getSummary(entryId)
    return summary && pick(summary, journal.getState())
  })
}
