import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'ghost' | 'subtle' | 'danger'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
