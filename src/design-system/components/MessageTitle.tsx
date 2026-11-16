import type { ReactNode } from 'react'
import styles from './MessageTitle.module.css'
import { WarningIcon } from './WarningIcon'

export type MessageTone = 'neutral' | 'warning'

type MessageTitleProps = {
  id?: string
  /** "warning" marks something gone wrong (e.g. a failed save) with a warning icon before the title. */
  tone?: MessageTone
  children: ReactNode
}

/** The title of a message to the user: a dialog's, or a page shown in place of the app. */
export function MessageTitle({
  id,
  tone = 'neutral',
  children,
}: MessageTitleProps) {
  return (
    <h2 id={id} className={styles.title}>
      {tone === 'warning' && <WarningIcon />}
      {children}
    </h2>
  )
}
