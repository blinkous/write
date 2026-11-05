import type { ReactNode } from 'react'
import styles from './ActionList.module.css'

/** Vertical list of actions, e.g. inside a ⋯ menu. Children are Buttons. */
export function ActionList({ children }: { children: ReactNode }) {
  return <div className={styles.actionList}>{children}</div>
}
