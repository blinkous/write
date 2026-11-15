import {
  createJournalEntry,
  entryTitleSchema,
  getEntryTitle,
  isEntryEmpty,
  resolveRenamedTitle,
  summarizeEntry,
  type EntrySummary,
} from './journalEntry'

function createWrittenEntry(
  text: string,
  title: string | null = null,
): EntrySummary {
  return summarizeEntry({
    ...createJournalEntry(),
    title,
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  })
}

describe('getEntryTitle', () => {
  it('prefers the custom title, falling back to the first line', () => {
    expect(getEntryTitle(createWrittenEntry('First line'))).toBe('First line')
    expect(getEntryTitle(createWrittenEntry('First line', 'Named'))).toBe(
      'Named',
    )
  })
})

describe('resolveRenamedTitle', () => {
  it('stores a trimmed custom title', () => {
    expect(resolveRenamedTitle(createWrittenEntry('text'), '  Sunday  ')).toBe(
      'Sunday',
    )
  })

  it('clears the title when blank, returning to the first line', () => {
    expect(
      resolveRenamedTitle(createWrittenEntry('text', 'Named'), '   '),
    ).toBeNull()
  })

  it('keeps following the first line when it is accepted unchanged', () => {
    expect(
      resolveRenamedTitle(createWrittenEntry('First line'), 'First line'),
    ).toBeNull()
  })

  it('keeps a custom title that happens to equal the first line', () => {
    expect(resolveRenamedTitle(createWrittenEntry('Same', 'Old'), 'Same')).toBe(
      'Same',
    )
  })
})

describe('entryTitleSchema', () => {
  it('turns missing or malformed titles into null', () => {
    expect(entryTitleSchema.parse(undefined)).toBeNull()
    expect(entryTitleSchema.parse(42)).toBeNull()
    expect(entryTitleSchema.parse('x'.repeat(500))).toHaveLength(200)
  })
})

describe('isEntryEmpty', () => {
  it('treats a named entry as not empty', () => {
    const blank = summarizeEntry(createJournalEntry())
    expect(isEntryEmpty(blank)).toBe(true)
    expect(isEntryEmpty({ ...blank, title: 'Plans' })).toBe(false)
    expect(isEntryEmpty(createWrittenEntry('Text'))).toBe(false)
  })
})
