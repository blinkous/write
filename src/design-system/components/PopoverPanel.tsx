import type { ReactNode } from 'react'
import styles from './PopoverPanel.module.css'

/** Swatch section of a menu, inset to line up with the text of menu rows. */
export function PopoverPanel({ children }: { children: ReactNode }) {
  return <div className={styles.panel}>{children}</div>
}
