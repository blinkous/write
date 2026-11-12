import { EditorContent, type Editor } from '@tiptap/react'
import type { ReactNode } from 'react'
import { KEYBOARD_HINT_ID } from './tabIndent'
import styles from './JournalPage.module.css'

type JournalPageProps = {
  editor: Editor
  /** Shown above the writing and scrolls with it, e.g. the entry's title. */
  header?: ReactNode
}

/** The endlessly scrolling writing page, sized by the margins setting. */
export function JournalPage({ editor, header }: JournalPageProps) {
  return (
    <div className={styles.page}>
      <p id={KEYBOARD_HINT_ID} className="visually-hidden">
        Tab inserts a tab. To leave the editor, press Escape, then Tab.
      </p>
      {header}
      <EditorContent editor={editor} className={styles.writing} />
    </div>
  )
}
