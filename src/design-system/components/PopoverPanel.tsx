import type { ReactNode } from 'react'
import styles from './PopoverPanel.module.css'

type PopoverPanelProps = {
  /** `narrow` fits swatch grids; `regular` fits a few lines of controls. */
  width?: 'narrow' | 'regular'
  children: ReactNode
}

/** A section of a menu (e.g. swatches or controls), inset to line up with the text of menu rows. */
export function PopoverPanel({
  width = 'narrow',
  children,
}: PopoverPanelProps) {
  return <div className={`${styles.panel} ${styles[width]}`}>{children}</div>
}
