import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, PointerEvent } from 'react'
import { formatShortcut, toAriaKeyShortcut } from '../../utils/shortcuts'
import styles from './MenuItem.module.css'

type MenuItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  /** Shown before the label, when one helps. */
  icon?: LucideIcon
  /** Marks the current choice in a menu of options. */
  isSelected?: boolean
  /**
   * Keyboard shortcut in Tiptap form (e.g. "Mod-s"): shown at the end of the
   * row as symbols, and given to screen readers as `aria-keyshortcuts`.
   * Null or absent for none.
   */
  shortcut?: string | null
}

/**
 * Shows the whole label as a tooltip only when it's cut short, so rows that
 * fit don't get one.
 */
function showFullLabelIfCut({ currentTarget }: PointerEvent<HTMLElement>) {
  const label = currentTarget.querySelector<HTMLElement>(`.${styles.label}`)
  if (!label) return
  const isCut = label.scrollWidth > label.clientWidth
  if (isCut) currentTarget.title = label.textContent ?? ''
  else currentTarget.removeAttribute('title')
}

/**
 * A row in a menu: icon, label, then its shortcut at the end. It never
 * scrolls or hides the end: a label too long for the menu is cut short with
 * "…", and the full label shows on hover (and is still read in full).
 */
export function MenuItem({
  icon: Icon,
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
      aria-keyshortcuts={shortcut ? toAriaKeyShortcut(shortcut) : undefined}
      data-selected={isSelected}
      onPointerEnter={buttonProps.title ? undefined : showFullLabelIfCut}
      {...buttonProps}
    >
      {Icon && <Icon aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
      {/* Symbols are for the eye; screen readers get aria-keyshortcuts instead. */}
      {shortcut && (
        <kbd aria-hidden="true" className={styles.shortcut}>
          {formatShortcut(shortcut)}
        </kbd>
      )}
    </button>
  )
}
