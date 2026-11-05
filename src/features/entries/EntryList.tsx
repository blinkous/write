import { SquarePen } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { Button } from '../../design-system'
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
  return (
    <nav aria-label="Journal entries" className={styles.entryList}>
      <div className={styles.header}>
        <Button
          iconOnly
          aria-label="New entry"
          title="New entry"
          onClick={onCreate}
        >
          <SquarePen aria-hidden="true" />
        </Button>
        {actions}
      </div>
      <p id={renameHintId} className="visually-hidden">
        Activate the open entry to rename it.
      </p>
      <ul className={styles.items}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <EntryListItem
              entry={entry}
              isSelected={entry.id === selectedEntryId}
              renameHintId={renameHintId}
              onSelect={() => onSelect(entry.id)}
              onRename={(rawTitle) => onRename(entry, rawTitle)}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
