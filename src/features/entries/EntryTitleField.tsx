import { EditorContent, type Editor } from '@tiptap/react'

/**
 * The entry's title at the top of the page, like a document title: it scrolls
 * with the writing, can be styled like it, and edits the same name as the
 * sidebar. Blank falls back to the entry's first line.
 */
export function EntryTitleField({ editor }: { editor: Editor }) {
  return <EditorContent editor={editor} />
}
