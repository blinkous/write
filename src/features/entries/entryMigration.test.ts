import type { JSONContent } from '@tiptap/react'
import { createJournalEntry, type JournalEntry } from './journalEntry'
import { migrateEntryFromFormat1 } from './entryMigration'

const heading = (level: number, text: string): JSONContent => ({
  type: 'heading',
  attrs: { level },
  content: [{ type: 'text', text }],
})
const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

function entryWith(
  blocks: JSONContent[],
  title: string | null = null,
): JournalEntry {
  return {
    ...createJournalEntry(),
    title,
    content: { type: 'doc', content: blocks },
  }
}

const levels = (entry: JournalEntry) =>
  (entry.content.content ?? []).map(({ type, attrs }) =>
    type === 'heading' ? `h${attrs?.level}` : type,
  )

describe('migrateEntryFromFormat1', () => {
  it('makes a leading # heading the title of an untitled entry', () => {
    const migrated = migrateEntryFromFormat1(
      entryWith([
        heading(1, ' Sunday '),
        paragraph('Rain.'),
        heading(2, 'Later'),
      ]),
    )
    expect(migrated.title).toBe('Sunday')
    expect(levels(migrated)).toEqual(['paragraph', 'h3'])
  })

  it('keeps a custom title and moves every heading down a level', () => {
    const migrated = migrateEntryFromFormat1(
      entryWith([heading(1, 'Morning'), heading(3, 'Tea')], 'Sunday'),
    )
    expect(migrated.title).toBe('Sunday')
    expect(levels(migrated)).toEqual(['h2', 'h4'])
  })

  it('moves headings down when the entry does not start with one', () => {
    const migrated = migrateEntryFromFormat1(
      entryWith([paragraph('Intro'), heading(1, 'Section')]),
    )
    expect(migrated.title).toBeNull()
    expect(levels(migrated)).toEqual(['paragraph', 'h2'])
  })

  it('never goes past h6', () => {
    expect(
      levels(
        migrateEntryFromFormat1(
          entryWith([paragraph('x'), heading(6, 'deep')]),
        ),
      ),
    ).toEqual(['paragraph', 'h6'])
  })

  it('leaves an empty paragraph when the title was the only block', () => {
    const migrated = migrateEntryFromFormat1(
      entryWith([heading(1, 'Just a title')]),
    )
    expect(migrated.title).toBe('Just a title')
    expect(migrated.content.content).toEqual([{ type: 'paragraph' }])
  })

  it('keeps content that has no headings exactly as it was', () => {
    const entry = entryWith([paragraph('Plain day.')])
    expect(migrateEntryFromFormat1(entry)).toEqual(entry)
  })
})
