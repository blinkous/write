import type { ComponentProps } from 'react'
import { getButtonClassName, type ButtonVariant } from './buttonClassName'

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
  variant,
  iconOnly,
  plainWhenExpanded,
  className,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClassName({
        variant,
        iconOnly,
        plainWhenExpanded,
        className,
      })}
      {...buttonProps}
    />
  )
}
