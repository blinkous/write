import type { ReactNode } from 'react'
import { EntryList } from './EntryList'
import { useJournalState, type Journal } from './journal'
import type { JournalEntry } from './journalEntry'

type JournalEntryListProps = {
  journal: Journal
  /** After an entry is opened or made from the list (e.g. to close the sidebar on phones). */
  onEntryOpened: () => void
  /** A row's actions (e.g. its ⋯ menu), shown on hover or focus. */
  entryActions: (entry: JournalEntry) => ReactNode
}

/** The journal's entries list: the one part outside the page that re-renders as you type (its dates and names follow the writing). */
export function JournalEntryList({
  journal,
  onEntryOpened,
  entryActions,
}: JournalEntryListProps) {
  const entries = useJournalState(journal, (state) => state.entries)
  const selectedEntryId = useJournalState(
    journal,
    (state) => state.selectedEntryId,
  )
  const sort = useJournalState(journal, (state) => state.sort)
  return (
    <EntryList
      entries={entries}
      selectedEntryId={selectedEntryId}
      onSelect={(entryId) => {
        journal.selectEntry(entryId)
        onEntryOpened()
      }}
      onCreate={() => {
        journal.createEntry()
        onEntryOpened()
      }}
      onRename={(entry, rawTitle) => journal.renameEntry(entry.id, rawTitle)}
      sort={sort}
      onSortChange={journal.setSort}
      entryActions={entryActions}
    />
  )
}
