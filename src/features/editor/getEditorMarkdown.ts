import type { Editor } from '@tiptap/core'

/** Markdown for the whole document, ending in a single newline. */
export function getEditorMarkdown(editor: Editor): string {
  return `${editor.getMarkdown().trim()}\n`
}
