import type { ReactNode } from 'react'
import styles from './MessagePage.module.css'

type MessagePageProps = {
  /** A MessageTitle, then the message's text and actions. */
  children: ReactNode
}

/** A message shown in place of the whole app, laid out like a dialog. */
export function MessagePage({ children }: MessagePageProps) {
  return (
    <main className={styles.page}>
      <h1 className="visually-hidden">Write</h1>
      {children}
    </main>
  )
}
