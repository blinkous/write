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

/** One entry's summary; re-renders only when that entry changes. Undefined once it's deleted. */
export function useEntrySummary(
  journal: Journal,
  entryId: string,
): EntrySummary | undefined {
  return useSyncExternalStore(journal.subscribe, () =>
    journal.getSummary(entryId),
  )
}
