import { createJournalEntry, type JournalEntry } from './journalEntry'
import { parseSearchQuery, searchEntries } from './entrySearch'

function entryWith(text: string, title: string | null = null): JournalEntry {
  return {
    ...createJournalEntry(),
    title,
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  }
}

const highlighted = ({
  text,
  ranges,
}: {
  text: string
  ranges: readonly (readonly [number, number])[]
}) => ranges.map(([start, end]) => text.slice(start, end))

describe('searchEntries', () => {
  const entries = [
    entryWith('Rainy morning, made tea and read.', 'Sunday'),
    entryWith('Café visit with Sam. Long walk home.'),
    entryWith('Nothing much happened.'),
  ]

  it('returns everything for an empty query', () => {
    expect(searchEntries(entries, '   ')).toHaveLength(3)
  })

  it('ignores case and accents, and highlights the original letters', () => {
    const [match] = searchEntries(entries, 'CAFE')
    expect(match.entry).toBe(entries[1])
    expect(highlighted(match.title)).toEqual(['Café'])
  })

  it('needs every word, in name or text, in any order', () => {
    expect(
      searchEntries(entries, 'tea sunday').map(({ entry }) => entry),
    ).toEqual([entries[0]])
    expect(searchEntries(entries, 'tea walk')).toEqual([])
  })

  it('shows a snippet when the match is in the text, not the name', () => {
    const [match] = searchEntries(entries, 'tea')
    expect(match.snippet?.text).toContain('made tea and read')
    expect(match.snippet && highlighted(match.snippet)).toEqual(['tea'])
    expect(searchEntries(entries, 'sunday')[0].snippet).toBeNull()
  })

  it('trims long snippets with ellipses around the match', () => {
    const long = entryWith(
      `${'a'.repeat(100)} needle ${'b'.repeat(100)}`,
      'Long day',
    )
    const [match] = searchEntries([long], 'needle')
    expect(match.snippet?.text.startsWith('…')).toBe(true)
    expect(match.snippet?.text.endsWith('…')).toBe(true)
    expect(match.snippet && highlighted(match.snippet)).toEqual(['needle'])
  })
})

describe('parseSearchQuery', () => {
  it('splits, normalizes and deduplicates words', () => {
    expect(parseSearchQuery('  Tea  TÉA walk ')).toEqual(['tea', 'walk'])
  })
})
