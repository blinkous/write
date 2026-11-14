import type { ReactNode } from 'react'
import styles from './LabeledRow.module.css'

type LabeledRowProps = {
  /** Visible name of the setting; only the control acts. The control carries its own accessible name too. */
  label: string
  /**
   * What sits at the end, lined up with the row's edge: a `button` with text
   * (e.g. a menu trigger) is pulled out by its padding; an `icon` button by its
   * icon's inset; `swatch` tiles (one or more) are sized and flush; `text`
   * (editable in place) takes the room the name leaves, lined up like a button.
   */
  control: 'button' | 'icon' | 'swatch' | 'text'
  children: ReactNode
}

/** A setting's name with its control at the end of the row, e.g. "Font   Inter ⌄" or "Foreground   ■". */
export function LabeledRow({ label, control, children }: LabeledRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles[control]}>{children}</div>
    </div>
  )
}
