import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { showFullTextIfCut } from './fullTextIfCut'
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
  /**
   * Shown before the label. A row with one sits among MenuItems (in an
   * ActionList) and is padded like them, so icons, labels and ends line up.
   */
  icon?: LucideIcon
  children: ReactNode
}

/**
 * A setting's name with its control at the end of the row, e.g. "Font   Inter ⌄"
 * or "Foreground   ■". When room runs out the name gives way ("…", whole on
 * hover), never the control.
 */
export function LabeledRow({
  label,
  control,
  icon: Icon,
  children,
}: LabeledRowProps) {
  return (
    <div className={`${styles.row} ${Icon ? styles.withIcon : ''}`}>
      <span className={styles.label}>
        {Icon && <Icon aria-hidden="true" className={styles.labelIcon} />}
        <span
          className={styles.labelText}
          onPointerEnter={({ currentTarget }) =>
            showFullTextIfCut(currentTarget, currentTarget)
          }
        >
          {label}
        </span>
      </span>
      <div className={styles[control]}>{children}</div>
    </div>
  )
}
