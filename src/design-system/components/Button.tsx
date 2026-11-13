import type { ComponentProps } from 'react'
import styles from './Button.module.css'

/** `row` fills its row edge to edge, its text lined up with the row's other text. */
export type ButtonVariant = 'ghost' | 'subtle' | 'danger' | 'row'

/* Includes `ref` (a regular prop in React 19), passed through to the <button>. */
type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  /** Square button sized for a single icon or glyph; requires an aria-label. */
  iconOnly?: boolean
}

export function Button({
  variant = 'ghost',
  iconOnly = false,
  className = '',
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    iconOnly ? styles.iconOnly : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classNames} {...buttonProps} />
}
