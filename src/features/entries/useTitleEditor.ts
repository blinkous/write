import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, type JSONContent } from '@tiptap/react'
import { useEffect } from 'react'
import { titleExtensions } from '../../journal-document'
import { WRITING_ASSISTANT_OPT_OUT } from '../../lib/writingAssistants'
import {
  getTitleDocument,
  MAX_ENTRY_TITLE_LENGTH,
  readTitleDocument,
  type JournalEntry,
} from './journalEntry'
import { TitleBehavior } from './titleBehavior'
import styles from './EntryTitleField.module.css'

type UseTitleEditorOptions = {
  entry: JournalEntry
  onChange: (entryId: string, titleDocument: JSONContent) => void
  /** Moves on into the writing (Enter, or ↓ at the end of the title). */
  onContinue: () => void
}

/**
 * The editor for the entry's title on the page: one line, styled like the
 * writing. A fresh editor per entry, so each keeps its own undo history.
 */
export function useTitleEditor({
  entry,
  onChange,
  onContinue,
}: UseTitleEditorOptions) {
  const editor = useEditor(
    {
      extensions: [
        ...titleExtensions,
        Placeholder.configure({ placeholder: 'Untitled' }),
        TitleBehavior.configure({ maxLength: MAX_ENTRY_TITLE_LENGTH }),
      ],
      content: getTitleDocument(entry),
      // Loaded from tiptapBase.css instead; the CSP blocks inline <style> tags.
      injectCSS: false,
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-label': 'Entry title',
          'aria-multiline': 'false',
          ...WRITING_ASSISTANT_OPT_OUT,
          class: styles.title,
        },
      },
      onUpdate: ({ editor: titleEditor }) =>
        onChange(entry.id, titleEditor.getJSON()),
    },
    [entry.id],
  )

  /*
   * When the entry changes, Tiptap destroys this editor and makes a new one;
   * for that one render the old, destroyed editor is still returned. Effects
   * skip it and run again with the new editor.
   */
  useEffect(() => {
    if (editor.isDestroyed) return
    editor.commands.setContinueHandler(onContinue)
  })

  // A rename from the sidebar: show it, unless the title is being edited here.
  const { title } = entry
  useEffect(() => {
    if (
      editor.isDestroyed ||
      editor.isFocused ||
      readTitleDocument(editor.getJSON()).title === title
    )
      return
    editor.commands.setContent(getTitleDocument(entry), { emitUpdate: false })
  }, [editor, entry, title])

  return editor
}
