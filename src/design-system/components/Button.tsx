import type { ComponentProps } from 'react'
import styles from './Button.module.css'

/** `row` fills its row edge to edge, its text lined up with the row's other text. */
export type ButtonVariant = 'ghost' | 'subtle' | 'danger' | 'row'

/* Includes `ref` (a regular prop in React 19), passed through to the <button>. */
type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  /** Square button sized for a single icon or glyph; requires an aria-label. */
  iconOnly?: boolean
  /**
   * For a toggle (`aria-expanded`) whose open panel is plain to see, e.g. the
   * sidebar: it doesn't look on while open. Screen readers still hear "expanded".
   */
  plainWhenExpanded?: boolean
}

export function Button({
  variant = 'ghost',
  iconOnly = false,
  plainWhenExpanded = false,
  className = '',
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    iconOnly ? styles.iconOnly : '',
    plainWhenExpanded ? styles.plainWhenExpanded : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classNames} {...buttonProps} />
}
