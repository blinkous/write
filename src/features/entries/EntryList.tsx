import { SquarePen } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { Button, SearchField, type ToastMessage } from '../../design-system'
import { EntryListItem } from './EntryListItem'
import { EntrySortMenu } from './EntrySortMenu'
import type { EntryMatch } from './entrySearch'
import type { Journal, JournalState } from './journal'
import { getEntryTitle, type EntrySummary } from './journalEntry'
import { formatEntryDate } from '../../utils/date'
import { useEntrySearch } from './useEntrySearch'
import { useEntrySummary, useJournalState } from './useJournalState'
import styles from './EntryList.module.css'

type EntryListProps = {
  journal: Journal
  /** After an entry is opened or made from the list (e.g. to close the sidebar on phones). */
  onEntryOpened: () => void
  onStatus: (message: ToastMessage) => void
  /** A row's actions (e.g. its ⋯ menu), shown on hover or focus. */
  entryActions: (entryId: string, title: string | null) => ReactNode
}

/**
 * The journal's entries. The list follows only their order; each row follows
 * its own entry, so typing redraws just the row being written in.
 */
export function EntryList({
  journal,
  onEntryOpened,
  onStatus,
  entryActions,
}: EntryListProps) {
  const renameHintId = useId()
  const [query, setQuery] = useState('')
  const entryIds = useJournalState(journal, (state) => state.entryIds)
  const sort = useJournalState(journal, (state) => state.sort)
  const matchesById = useEntrySearch(journal, query, onStatus)
  const shownEntryIds = matchesById
    ? entryIds.filter((entryId) => matchesById.has(entryId))
    : entryIds

  /** Opening an entry reads its writing, which can fail. */
  function openEntry(open: () => Promise<void>) {
    onEntryOpened()
    open().catch(() =>
      onStatus({ text: 'Couldn’t open that entry.', tone: 'warning' }),
    )
  }

  return (
    <nav aria-label="Journal entries" className={styles.entryList}>
      <div className={styles.header}>
        <SearchField label="Search entries" value={query} onChange={setQuery} />
        <EntrySortMenu sort={sort} onSortChange={journal.setSort} />
        <Button
          iconOnly
          aria-label="New entry"
          title="New entry"
          onClick={() => {
            // A new, empty entry wouldn't match the search, so show everything again.
            setQuery('')
            openEntry(journal.createEntry)
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
          matchesById && shownEntryIds.length === 0
            ? styles.emptyResults
            : 'visually-hidden'
        }
      >
        {matchesById &&
          (shownEntryIds.length === 0
            ? 'No matching entries'
            : `${shownEntryIds.length} matching ${shownEntryIds.length === 1 ? 'entry' : 'entries'}`)}
      </p>
      <ul className={styles.items}>
        {shownEntryIds.map((entryId) => (
          <EntryRow
            key={entryId}
            journal={journal}
            entryId={entryId}
            match={matchesById?.get(entryId) ?? null}
            renameHintId={renameHintId}
            onSelect={() => openEntry(() => journal.selectEntry(entryId))}
            entryActions={entryActions}
          />
        ))}
      </ul>
    </nav>
  )
}

type EntryRowProps = {
  journal: Journal
  entryId: string
  match: EntryMatch | null
  renameHintId: string
  onSelect: () => void
  entryActions: (entryId: string, title: string | null) => ReactNode
}

/**
 * Follows only what it shows, as text: typing in an entry redraws its row
 * only when its name (its first line) or its shown date changes.
 */
function EntryRow({
  journal,
  entryId,
  match,
  renameHintId,
  onSelect,
  entryActions,
}: EntryRowProps) {
  const title = useEntrySummary(journal, entryId, getEntryTitle)
  const dateText = useEntrySummary(journal, entryId, getShownDate)
  const isSelected = useJournalState(
    journal,
    (state) => state.selectedEntryId === entryId,
  )
  // Deleted: the list drops this row in the same update.
  if (title === undefined || dateText === undefined) return null
  return (
    <li className={styles.row}>
      <EntryListItem
        title={title}
        dateText={dateText}
        match={match}
        isSelected={isSelected}
        renameHintId={renameHintId}
        onSelect={onSelect}
        onRename={(rawTitle) => journal.renameEntry(entryId, rawTitle)}
      />
      <div className={styles.rowActions}>{entryActions(entryId, title)}</div>
    </li>
  )
}

/** When the entry was made, or when it was last edited while sorted that way. */
function getShownDate(
  { createdAt, updatedAt }: EntrySummary,
  { sort }: JournalState,
): string {
  return sort === 'last-edited'
    ? `Edited ${formatEntryDate(updatedAt)}`
    : formatEntryDate(createdAt)
}
