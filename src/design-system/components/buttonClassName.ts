import styles from './Button.module.css'

export type ButtonVariant = 'ghost' | 'subtle'

type ButtonLookOptions = {
  variant?: ButtonVariant
  iconOnly?: boolean
  plainWhenExpanded?: boolean
  className?: string
}

/** The classes that give a button its look, shared with links drawn as buttons. */
export function getButtonClassName({
  variant = 'ghost',
  iconOnly = false,
  plainWhenExpanded = false,
  className = '',
}: ButtonLookOptions): string {
  return [
    styles.button,
    styles[variant],
    iconOnly ? styles.iconOnly : '',
    plainWhenExpanded ? styles.plainWhenExpanded : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
