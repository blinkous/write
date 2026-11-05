import { EditorContent, type Editor } from '@tiptap/react'
import styles from './JournalPage.module.css'

/** The endlessly scrolling writing page, sized by the margins setting. */
export function JournalPage({ editor }: { editor: Editor }) {
  return <EditorContent editor={editor} className={styles.page} />
}
