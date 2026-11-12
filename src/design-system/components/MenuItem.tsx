import type { ButtonHTMLAttributes } from 'react'
import styles from './MenuItem.module.css'

type MenuItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: 'default' | 'danger'
  /** Marks the current choice in a menu of options. */
  isSelected?: boolean
}

/** A row in a menu. Put an icon (aria-hidden) before the text when one helps. */
export function MenuItem({
  variant = 'default',
  isSelected,
  className = '',
  ...buttonProps
}: MenuItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${variant === 'default' ? '' : styles[variant]} ${className}`}
      aria-pressed={isSelected}
      data-selected={isSelected}
      {...buttonProps}
    />
  )
}
