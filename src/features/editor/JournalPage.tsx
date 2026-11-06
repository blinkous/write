import { EditorContent, type Editor } from '@tiptap/react'
import { KEYBOARD_HINT_ID } from './tabIndent'
import styles from './JournalPage.module.css'

/** The endlessly scrolling writing page, sized by the margins setting. */
export function JournalPage({ editor }: { editor: Editor }) {
  return (
    <>
      <p id={KEYBOARD_HINT_ID} className="visually-hidden">
        Tab inserts a tab. To leave the editor, press Escape, then Tab.
      </p>
      <EditorContent editor={editor} className={styles.page} />
    </>
  )
}
