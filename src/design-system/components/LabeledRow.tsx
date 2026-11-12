import type { ReactNode } from 'react'
import styles from './LabeledRow.module.css'

type LabeledRowProps = {
  /** Visible name of the setting. The control should carry its own accessible name too. */
  label: string
  /** Id of a form control (e.g. a swatch's color input), so clicking the label uses it. */
  controlId?: string
  /**
   * What sits at the end: a `button` (e.g. a menu trigger) has padding, pulled
   * out so its content lines up with the edge; a `swatch` is a tile, sized and
   * flush with the edge.
   */
  control: 'button' | 'swatch'
  children: ReactNode
}

/** A setting's name with its control at the end of the row, e.g. "App   Inter ⌄" or "Text   ■". */
export function LabeledRow({
  label,
  controlId,
  control,
  children,
}: LabeledRowProps) {
  return (
    <div className={styles.row}>
      {controlId ? (
        <label
          htmlFor={controlId}
          className={`${styles.label} ${styles.clickable}`}
        >
          {label}
        </label>
      ) : (
        <span className={styles.label}>{label}</span>
      )}
      <div className={styles[control]}>{children}</div>
    </div>
  )
}
