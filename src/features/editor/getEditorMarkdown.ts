import type { Editor } from '@tiptap/core'

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

/**
 * Markdown for the whole document, ending in a single newline. Only blank
 * lines are trimmed from the start: a plain trim would eat a leading tab.
 */
export function getEditorMarkdown(editor: Editor): string {
  const markdown = editor.getMarkdown().replace(/^\n+/, '').trimEnd()
  return `${replaceTabsOutsideCode(markdown)}\n`
}
