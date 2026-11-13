import type { JSONContent } from '@tiptap/react'
import { formatEntryTimestamp } from '../../utils/date'
import { isEntryEmpty, type JournalEntry } from './journalEntry'

/** Turns an entry's content into markdown under an optional title and date line (the editor's job). */
export type ContentToMarkdown = (
  content: JSONContent,
  /** The entry's custom name, and optionally a line saying when it was written. */
  header: { title: string | null; dateLine?: string },
) => string

const ENTRY_SEPARATOR = '\n\n---\n\n'

/**
 * The whole journal as one markdown file, oldest first so it reads like a
 * journal. Each entry starts with its custom name (when it has one) and when it
 * was written; entries are separated by a rule. Empty entries are left out.
 */
export function journalToMarkdown(
  entries: readonly JournalEntry[],
  contentToMarkdown: ContentToMarkdown,
): string {
  const sections = entries
    .filter((entry) => !isEntryEmpty(entry))
    .toSorted((first, second) =>
      first.createdAt.localeCompare(second.createdAt),
    )
    .map(({ content, title, createdAt }) =>
      contentToMarkdown(content, {
        title,
        dateLine: formatEntryTimestamp(createdAt),
      }).trimEnd(),
    )
  return `${sections.join(ENTRY_SEPARATOR)}\n`
}

export function getJournalMarkdownFileName(exportedAt = new Date()): string {
  return `journal-all-${exportedAt.toISOString().slice(0, 10)}.md`
}
