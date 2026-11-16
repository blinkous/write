import type { ButtonHTMLAttributes } from 'react'
import { formatShortcut, toAriaKeyShortcut } from '../../utils/shortcuts'
import styles from './MenuItem.module.css'

type MenuItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  /** Marks the current choice in a menu of options. */
  isSelected?: boolean
  /**
   * Keyboard shortcut in Tiptap form (e.g. "Mod-s"): shown at the end of the
   * row as symbols, and given to screen readers as `aria-keyshortcuts`.
   */
  shortcut?: string
}

/** A row in a menu. Put an icon (aria-hidden) before the text when one helps. */
export function MenuItem({
  isSelected,
  shortcut,
  className = '',
  children,
  ...buttonProps
}: MenuItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${className}`}
      aria-pressed={isSelected}
      aria-keyshortcuts={shortcut && toAriaKeyShortcut(shortcut)}
      data-selected={isSelected}
      {...buttonProps}
    >
      {children}
      {/* Symbols are for the eye; screen readers get aria-keyshortcuts instead. */}
      {shortcut && (
        <kbd aria-hidden="true" className={styles.shortcut}>
          {formatShortcut(shortcut)}
        </kbd>
      )}
    </button>
  )
}
