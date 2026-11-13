import type { Editor, JSONContent } from '@tiptap/core'
import { TITLE_HEADING_LEVEL } from '../../journal-document'

/* Two em spaces look like a tab but, unlike a tab, never turn a line into a code block. */
const TAB_REPLACEMENT = '  '
const CODE_FENCE = /^\s*(```|~~~)/

/** Replaces tabs outside fenced code blocks, where they're kept as typed. */
export function replaceTabsOutsideCode(markdown: string): string {
  let isInCodeBlock = false
  return markdown
    .split('\n')
    .map((line) => {
      if (CODE_FENCE.test(line)) {
        isInCodeBlock = !isInCodeBlock
        return line
      }
      return isInCodeBlock ? line : line.replaceAll('\t', TAB_REPLACEMENT)
    })
    .join('\n')
}

/** What to put above the content: a title and/or a line saying when it was written. */
export type MarkdownHeader = { title: string | null; dateLine?: string }

/**
 * With a title, the document gets it as its one `#` heading (content headings
 * start at `##`, so nothing moves). A date line goes under it, in italics.
 */
function withHeader(
  document: JSONContent,
  { title, dateLine }: MarkdownHeader,
): JSONContent {
  const header: JSONContent[] = []
  if (title)
    header.push({
      type: 'heading',
      attrs: { level: TITLE_HEADING_LEVEL },
      content: [{ type: 'text', text: title }],
    })
  if (dateLine) {
    header.push({
      type: 'paragraph',
      content: [{ type: 'text', text: dateLine, marks: [{ type: 'italic' }] }],
    })
  }
  return { ...document, content: [...header, ...(document.content ?? [])] }
}

/**
 * Markdown for any journal document (e.g. an entry's content), ending in a
 * single newline. Only blank lines are trimmed from the start: a plain trim
 * would eat a leading tab.
 */
export function documentToMarkdown(
  editor: Editor,
  document: JSONContent,
  header: MarkdownHeader = { title: null },
): string {
  const { markdown: markdownManager } = editor
  if (!markdownManager)
    throw new Error(
      'The editor needs the Markdown extension to export markdown.',
    )
  const markdown = markdownManager
    .serialize(withHeader(document, header))
    .replace(/^\n+/, '')
    .trimEnd()
  return `${replaceTabsOutsideCode(markdown)}\n`
}

/** Markdown for the open document, under a title when given. */
export function getEditorMarkdown(
  editor: Editor,
  title: string | null = null,
): string {
  return documentToMarkdown(editor, editor.getJSON(), { title })
}
