import type { ReactNode } from 'react'
import styles from './NestedRows.module.css'

type NestedRowsProps = {
  /** What the rows belong to, e.g. "Background picture or video"; read by screen readers. */
  label: string
  children: ReactNode
}

/** Rows that belong to the row above (e.g. a background's blur and opacity), indented under it like a nested section's contents. */
export function NestedRows({ label, children }: NestedRowsProps) {
  return (
    <div role="group" aria-label={label} className={styles.nestedRows}>
      {children}
    </div>
  )
}
