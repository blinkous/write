import { useEditor, type JSONContent } from '@tiptap/react'
import { editorExtensions } from './editorExtensions'
import { WRITING_ASSISTANT_OPT_OUT } from '../../lib/writingAssistants'
import { KEYBOARD_HINT_ID } from './tabIndent'
import styles from './JournalPage.module.css'
import './tiptapBase.css'

type UseJournalEditorOptions = {
  entryId: string
  initialContent: JSONContent
  onChange: (entryId: string, content: JSONContent) => void
}

/**
 * Creates the editor for one entry. A fresh editor is made whenever the
 * entry changes, so each entry keeps its own undo history.
 */
export function useJournalEditor({
  entryId,
  initialContent,
  onChange,
}: UseJournalEditorOptions) {
  return useEditor(
    {
      extensions: editorExtensions,
      content: initialContent,
      autofocus: 'end',
      // Loaded from tiptapBase.css instead; the CSP blocks inline <style> tags.
      injectCSS: false,
      editorProps: {
        attributes: {
          'aria-label': 'Journal entry',
          'aria-describedby': KEYBOARD_HINT_ID,
          // Ask writing assistants not to read or send this text (well-behaved ones honor these).
          ...WRITING_ASSISTANT_OPT_OUT,
          class: styles.prose,
        },
      },
      onUpdate: ({ editor }) => onChange(entryId, editor.getJSON()),
    },
    [entryId],
  )
}
