import type { JSONContent } from '@tiptap/react'
import { shiftHeadingsDown, TITLE_HEADING_LEVEL } from '../../journal-document'
import type { JournalEntry } from './journalEntry'

const EMPTY_PARAGRAPH: JSONContent = { type: 'paragraph' }

function collectText({ text = '', content = [] }: JSONContent): string {
  return text + content.map(collectText).join('')
}

/**
 * Format 1 used `#` headings inside entries. Format 2 reserves `#` for the
 * entry's title, so: an untitled entry that starts with a `#` heading gets that
 * heading as its title, and every other heading moves down a level, keeping the
 * outline's shape (h1 → h2, h2 → h3 …).
 */
export function migrateEntryFromFormat1(entry: JournalEntry): JournalEntry {
  const [firstBlock, ...otherBlocks] = entry.content.content ?? []
  const leadingTitle =
    entry.title === null &&
    firstBlock?.type === 'heading' &&
    firstBlock.attrs?.level === TITLE_HEADING_LEVEL
      ? collectText(firstBlock).trim()
      : ''
  const remainingBlocks = leadingTitle
    ? otherBlocks
    : (entry.content.content ?? [])
  const shiftedBlocks =
    shiftHeadingsDown({ ...entry.content, content: remainingBlocks }).content ??
    []
  return {
    ...entry,
    title: leadingTitle || entry.title,
    content: {
      ...entry.content,
      content: shiftedBlocks.length > 0 ? shiftedBlocks : [EMPTY_PARAGRAPH],
    },
  }
}
