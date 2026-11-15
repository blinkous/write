import { useEffect, useState } from 'react'
import type { ToastMessage } from '../../design-system'
import type { Journal } from './journal'
import { parseSearchQuery, searchEntries, type EntryMatch } from './entrySearch'

/**
 * Entries matching the query, by id; null while not searching. Searching
 * reads every entry's writing from storage, once per query change. Until the
 * first results arrive, the latest ones (or none) stay shown.
 */
export function useEntrySearch(
  journal: Journal,
  query: string,
  onStatus: (message: ToastMessage) => void,
): ReadonlyMap<string, EntryMatch> | null {
  const [matchesById, setMatchesById] = useState<ReadonlyMap<
    string,
    EntryMatch
  > | null>(null)
  const isSearching = parseSearchQuery(query).length > 0

  useEffect(() => {
    if (!isSearching) return
    let isCurrent = true
    journal.getAllEntries().then(
      (entries) => {
        if (!isCurrent) return
        const matches = searchEntries(entries, query)
        setMatchesById(new Map(matches.map((match) => [match.entry.id, match])))
      },
      () => {
        if (isCurrent)
          onStatus({ text: 'Couldn’t search the journal.', tone: 'warning' })
      },
    )
    return () => {
      isCurrent = false
    }
  }, [journal, query, isSearching, onStatus])

  return isSearching ? matchesById : null
}
