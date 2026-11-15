import type { EntryChanges, JournalEntry } from './journalEntry'

/**
 * A change to one stored entry that isn't confirmed saved yet: a whole entry
 * (new or imported), changes to the stored one, or its removal.
 */
export type PendingEntryWrite =
  | { kind: 'put'; entry: JournalEntry }
  | { kind: 'update'; changes: EntryChanges }
  | { kind: 'delete' }

/** One write with the same result as `earlier` followed by `later`. */
export function combineEntryWrites(
  earlier: PendingEntryWrite | undefined,
  later: PendingEntryWrite,
): PendingEntryWrite {
  if (!earlier || later.kind !== 'update') return later
  switch (earlier.kind) {
    case 'put':
      return { kind: 'put', entry: { ...earlier.entry, ...later.changes } }
    case 'update':
      return {
        kind: 'update',
        changes: { ...earlier.changes, ...later.changes },
      }
    case 'delete':
      return earlier
  }
}

/** The entry as it is once `write` is saved over the stored one (null: there's none). */
export function applyEntryWrite(
  storedEntry: JournalEntry | null,
  write: PendingEntryWrite | undefined,
): JournalEntry | null {
  switch (write?.kind) {
    case undefined:
      return storedEntry
    case 'put':
      return write.entry
    case 'delete':
      return null
    case 'update':
      return storedEntry && { ...storedEntry, ...write.changes }
  }
}
