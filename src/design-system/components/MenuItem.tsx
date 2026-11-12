import type { ButtonHTMLAttributes } from 'react'
import styles from './MenuItem.module.css'

type MenuItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: 'default' | 'danger'
  /** Marks the current choice in a menu of options. */
  isSelected?: boolean
  /** Keyboard shortcut shown at the end of the row, e.g. "⌘S". */
  shortcut?: string
}

/** A row in a menu. Put an icon (aria-hidden) before the text when one helps. */
export function MenuItem({
  variant = 'default',
  isSelected,
  shortcut,
  className = '',
  children,
  ...buttonProps
}: MenuItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${variant === 'default' ? '' : styles[variant]} ${className}`}
      aria-pressed={isSelected}
      data-selected={isSelected}
      {...buttonProps}
    >
      {children}
      {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
    </button>
  )
}
