import type { ReactNode } from 'react'
import styles from './MenuActionRow.module.css'

type MenuActionRowProps = {
  /** The row itself: a MenuItem. */
  children: ReactNode
  /** An icon button (or a Popover's) for the row's own action, e.g. editing what the row applies. */
  action: ReactNode
}

/**
 * A menu row with its own action at the end, always shown so it's reachable
 * by touch too. A MenuItem is a button, so the action sits beside it, not in it;
 * the two light up together.
 */
export function MenuActionRow({ children, action }: MenuActionRowProps) {
  return (
    <div className={styles.row}>
      {children}
      {action}
    </div>
  )
}
