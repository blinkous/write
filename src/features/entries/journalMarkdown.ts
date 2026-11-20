import type { JSONContent } from '@tiptap/react'
import { MARKDOWN_IMAGE_FOLDER } from '../../journal-document'
import type { SaveFileOptions } from '../../lib/saveFile'
import { zipFiles } from '../../lib/zipFiles'
import { formatEntryTimestamp } from '../../utils/date'
import { collectEntryImageIds, readEntryImageFiles } from './entryImages'
import { isEntryEmpty, summarizeEntry, type JournalEntry } from './journalEntry'

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
    .filter((entry) => !isEntryEmpty(summarizeEntry(entry)))
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

/**
 * The journal as markdown to save: one .md file, or with pictures a .zip of
 * the .md and an images folder its pictures link to (those on this device,
 * read once saving starts).
 */
export function journalMarkdownExport(
  entries: readonly JournalEntry[],
  contentToMarkdown: ContentToMarkdown,
  exportedAt = new Date(),
): SaveFileOptions {
  const markdownFileName = getJournalMarkdownFileName(exportedAt)
  const markdown = journalToMarkdown(entries, contentToMarkdown)
  if (collectEntryImageIds(entries).size === 0)
    return {
      suggestedName: markdownFileName,
      contents: markdown,
      mimeType: 'text/markdown',
      description: 'Markdown',
      extension: '.md',
    }
  return {
    suggestedName: markdownFileName.replace(/\.md$/, '.zip'),
    contents: async () => {
      const pictures = await readEntryImageFiles(entries)
      const pictureFiles = await Promise.all(
        Array.from(pictures, async ([imageId, file]) => ({
          path: `${MARKDOWN_IMAGE_FOLDER}/${imageId}`,
          contents: new Uint8Array(await file.arrayBuffer()),
        })),
      )
      return zipFiles([
        { path: markdownFileName, contents: markdown },
        ...pictureFiles,
      ])
    },
    mimeType: 'application/zip',
    description: 'Markdown with pictures',
    extension: '.zip',
  }
}
