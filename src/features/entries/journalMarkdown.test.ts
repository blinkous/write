import { createTestEditor } from '../../test/createTestEditor'
import { formatEntryTimestamp } from '../../utils/date'
import { editorExtensions } from '../editor/editorExtensions'
import { documentToMarkdown } from '../editor/getEditorMarkdown'
import { createJournalEntry, type JournalEntry } from './journalEntry'
import { journalToMarkdown } from './journalMarkdown'

function entry(
  createdAt: string,
  title: string | null,
  blocks: JournalEntry['content']['content'],
): JournalEntry {
  return {
    ...createJournalEntry(new Date(createdAt)),
    title,
    content: { type: 'doc', content: blocks },
  }
}

const text = (value: string) => [{ type: 'text', text: value }]

describe('journalToMarkdown', () => {
  const editor = createTestEditor({ extensions: editorExtensions })
  const toMarkdown = (
    content: JournalEntry['content'],
    header: { title: string | null; dateLine: string },
  ) => documentToMarkdown(editor, content, header)

  const newer = entry('2026-11-12T09:00:00.000Z', 'Sunday', [
    { type: 'heading', attrs: { level: 1 }, content: text('Morning') },
    { type: 'paragraph', content: text('Rain all day.') },
  ])
  const older = entry('2026-11-10T20:30:00.000Z', null, [
    { type: 'paragraph', content: text('First night here.') },
  ])
  const empty = entry('2026-11-11T08:00:00.000Z', null, [{ type: 'paragraph' }])

  it('writes entries oldest first, with names, times and separators', () => {
    expect(journalToMarkdown([newer, empty, older], toMarkdown)).toBe(
      [
        `*${formatEntryTimestamp(older.createdAt)}*`,
        '',
        'First night here.',
        '',
        '---',
        '',
        '# Sunday',
        '',
        `*${formatEntryTimestamp(newer.createdAt)}*`,
        '',
        '## Morning',
        '',
        'Rain all day.',
        '',
      ].join('\n'),
    )
  })
})
