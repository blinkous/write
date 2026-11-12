import { SquarePen } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { Button, SearchField } from '../../design-system'
import { searchEntries } from './entrySearch'
import { EntryListItem } from './EntryListItem'
import type { JournalEntry } from './journalEntry'
import styles from './EntryList.module.css'

type EntryListProps = {
  entries: readonly JournalEntry[]
  selectedEntryId: string
  onSelect: (entryId: string) => void
  onCreate: () => void
  onRename: (entry: JournalEntry, rawTitle: string) => void
  /** Extra controls shown beside "New entry", e.g. a journal menu. */
  actions?: ReactNode
}

export function EntryList({
  entries,
  selectedEntryId,
  onSelect,
  onCreate,
  onRename,
  actions,
}: EntryListProps) {
  const renameHintId = useId()
  const [query, setQuery] = useState('')
  const matches = searchEntries(entries, query)
  const isSearching = query.trim() !== ''

  return (
    <nav aria-label="Journal entries" className={styles.entryList}>
      <div className={styles.header}>
        <SearchField label="Search entries" value={query} onChange={setQuery} />
        <Button
          iconOnly
          aria-label="New entry"
          title="New entry"
          onClick={() => {
            // A new, empty entry wouldn't match the search, so show everything again.
            setQuery('')
            onCreate()
          }}
        >
          <SquarePen aria-hidden="true" />
        </Button>
        {actions}
      </div>
      <p id={renameHintId} className="visually-hidden">
        Activate the open entry to rename it.
      </p>
      <p
        role="status"
        className={
          isSearching && matches.length === 0
            ? styles.emptyResults
            : 'visually-hidden'
        }
      >
        {isSearching &&
          (matches.length === 0
            ? 'No matching entries'
            : `${matches.length} matching ${matches.length === 1 ? 'entry' : 'entries'}`)}
      </p>
      <ul className={styles.items}>
        {matches.map((match) => (
          <li key={match.entry.id}>
            <EntryListItem
              match={match}
              isSelected={match.entry.id === selectedEntryId}
              renameHintId={renameHintId}
              onSelect={() => onSelect(match.entry.id)}
              onRename={(rawTitle) => onRename(match.entry, rawTitle)}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
