import { createJournalEntry, type JournalEntry } from './journalEntry'
import { sortEntries } from './entrySort'

function entry(
  title: string | null,
  createdAt: string,
  updatedAt = createdAt,
): JournalEntry {
  return {
    ...createJournalEntry(),
    id: title ?? createdAt,
    title,
    createdAt,
    updatedAt,
  }
}

const monday = entry(
  'Monday',
  '2026-11-09T09:00:00.000Z',
  '2026-11-12T09:00:00.000Z',
)
const day10 = entry('Day 10', '2026-11-10T09:00:00.000Z')
const day2 = entry('day 2', '2026-11-11T09:00:00.000Z')
const untitled = entry(null, '2026-11-08T09:00:00.000Z')
const all = [monday, day10, day2, untitled]
const ids = (entries: JournalEntry[]) => entries.map(({ id }) => id)

describe('sortEntries', () => {
  it('sorts by when entries were made', () => {
    expect(ids(sortEntries(all, 'newest'))).toEqual([
      'day 2',
      'Day 10',
      'Monday',
      untitled.id,
    ])
    expect(ids(sortEntries(all, 'oldest'))).toEqual([
      untitled.id,
      'Monday',
      'Day 10',
      'day 2',
    ])
  })

  it('puts the most recently edited first', () => {
    expect(ids(sortEntries(all, 'last-edited'))[0]).toBe('Monday')
  })

  it('sorts names naturally, ignoring case, with unnamed entries last', () => {
    expect(ids(sortEntries(all, 'name'))).toEqual([
      'day 2',
      'Day 10',
      'Monday',
      untitled.id,
    ])
  })
})
