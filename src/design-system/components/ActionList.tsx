import type { ReactNode } from 'react'
import styles from './ActionList.module.css'

/** A vertical list of MenuItems inside a menu. */
export function ActionList({ children }: { children: ReactNode }) {
  return <div className={styles.actionList}>{children}</div>
}
