import Placeholder from '@tiptap/extension-placeholder'
import { useEditor } from '@tiptap/react'
import { useEffect } from 'react'
import { titleExtensions } from '../../journal-document'
import { WRITING_ASSISTANT_OPT_OUT } from '../../lib/writingAssistants'
import type { Journal } from './journal'
import {
  getTitleDocument,
  MAX_ENTRY_TITLE_LENGTH,
  readTitleDocument,
} from './journalEntry'
import { TitleBehavior } from './titleBehavior'
import styles from './EntryTitleField.module.css'

type UseTitleEditorOptions = {
  journal: Journal
  /** The open entry. */
  entryId: string
  /** Moves on into the writing (Enter, or ↓ at the end of the title). */
  onContinue: () => void
}

/**
 * The editor for the entry's title on the page: one line, styled like the
 * writing. A fresh editor per entry, so each keeps its own undo history.
 */
export function useTitleEditor({
  journal,
  entryId,
  onContinue,
}: UseTitleEditorOptions) {
  const editor = useEditor(
    {
      extensions: [
        ...titleExtensions,
        Placeholder.configure({ placeholder: 'Untitled' }),
        TitleBehavior.configure({ maxLength: MAX_ENTRY_TITLE_LENGTH }),
      ],
      // Read once per entry: the editor holds the title from then on.
      content: getTitleDocument(getSummaryOrBlank(journal, entryId)),
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
        journal.setEntryTitle(entryId, titleEditor.getJSON()),
    },
    [entryId],
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
  // Followed straight from the journal, so changes don't re-render whoever holds this editor.
  useEffect(
    () =>
      journal.subscribe(() => {
        const summary = journal.getSummary(entryId)
        if (
          !summary ||
          editor.isDestroyed ||
          editor.isFocused ||
          readTitleDocument(editor.getJSON()).title === summary.title
        )
          return
        editor.commands.setContent(getTitleDocument(summary), {
          emitUpdate: false,
        })
      }),
    [editor, journal, entryId],
  )

  return editor
}

/** The entry's title fields; none if it was just deleted (its editor is about to go). */
function getSummaryOrBlank(journal: Journal, entryId: string) {
  return journal.getSummary(entryId) ?? { title: null, titleContent: null }
}
