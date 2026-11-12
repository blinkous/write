import type { ReactNode } from 'react'
import styles from './MenuFooter.module.css'

/**
 * Small, low-key actions at the bottom of a menu (e.g. undo, reset), as icon
 * buttons aligned to the end. For rarely used actions that shouldn't be rows.
 */
export function MenuFooter({ children }: { children: ReactNode }) {
  return <div className={styles.footer}>{children}</div>
}
