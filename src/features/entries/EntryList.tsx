import { SquarePen } from 'lucide-react'
import { useId, useState } from 'react'
import { Button, SearchField } from '../../design-system'
import { EntrySortMenu } from './EntrySortMenu'
import { searchEntries } from './entrySearch'
import { EntryListItem } from './EntryListItem'
import type { EntrySort } from './entrySort'
import type { JournalEntry } from './journalEntry'
import styles from './EntryList.module.css'

type EntryListProps = {
  entries: readonly JournalEntry[]
  selectedEntryId: string
  onSelect: (entryId: string) => void
  onCreate: () => void
  onRename: (entry: JournalEntry, rawTitle: string) => void
  /** The list's order (entries come sorted); last-edited shows edit dates. */
  sort: EntrySort
  onSortChange: (sort: EntrySort) => void
}

export function EntryList({
  entries,
  selectedEntryId,
  onSelect,
  onCreate,
  onRename,
  sort,
  onSortChange,
}: EntryListProps) {
  const renameHintId = useId()
  const [query, setQuery] = useState('')
  const matches = searchEntries(entries, query)
  const isSearching = query.trim() !== ''

  return (
    <nav aria-label="Journal entries" className={styles.entryList}>
      <div className={styles.header}>
        <SearchField label="Search entries" value={query} onChange={setQuery} />
        <EntrySortMenu sort={sort} onSortChange={onSortChange} />
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
              showsEditedDate={sort === 'last-edited'}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
