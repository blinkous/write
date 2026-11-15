import { createOptionGuard } from '../../utils/options'
import { getEntryTitle, type EntrySummary } from './journalEntry'

export const ENTRY_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'last-edited', label: 'Last edited' },
  { value: 'name', label: 'Name A–Z' },
] as const

export type EntrySort = (typeof ENTRY_SORT_OPTIONS)[number]['value']
export const isEntrySort = createOptionGuard(ENTRY_SORT_OPTIONS)
export const DEFAULT_ENTRY_SORT: EntrySort = 'newest'

/* Names compare like people read them: case and accents aside, "Day 2" before "Day 10". */
const nameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

type EntryComparer = (first: EntrySummary, second: EntrySummary) => number

const byNewest: EntryComparer = (first, second) =>
  second.createdAt.localeCompare(first.createdAt)

const ENTRY_COMPARERS: Record<EntrySort, EntryComparer> = {
  newest: byNewest,
  oldest: (first, second) => -byNewest(first, second),
  'last-edited': (first, second) =>
    second.updatedAt.localeCompare(first.updatedAt) || byNewest(first, second),
  // Untitled, empty entries go last; ties fall back to newest first.
  name: (first, second) => {
    const [firstName, secondName] = [
      getEntryTitle(first) ?? '',
      getEntryTitle(second) ?? '',
    ]
    if (!firstName || !secondName)
      return Number(!firstName) - Number(!secondName) || byNewest(first, second)
    return (
      nameCollator.compare(firstName, secondName) || byNewest(first, second)
    )
  },
}

export function sortEntries<Entry extends EntrySummary>(
  entries: readonly Entry[],
  sort: EntrySort,
): Entry[] {
  return entries.toSorted(ENTRY_COMPARERS[sort])
}

/**
 * Entry ids in the list's order. Returns `currentEntryIds` itself when the
 * order is unchanged, so what shows the list doesn't re-render.
 */
export function sortEntryIds(
  summaries: Iterable<EntrySummary>,
  sort: EntrySort,
  currentEntryIds: readonly string[] = [],
): readonly string[] {
  const entryIds = sortEntries([...summaries], sort).map(({ id }) => id)
  const isSameOrder =
    entryIds.length === currentEntryIds.length &&
    entryIds.every((entryId, index) => entryId === currentEntryIds[index])
  return isSameOrder ? currentEntryIds : entryIds
}
