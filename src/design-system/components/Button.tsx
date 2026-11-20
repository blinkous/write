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
  /**
   * Flashes the button's hover look each time this goes up, so something done
   * another way (e.g. its keyboard shortcut) shows where it happened.
   */
  flashCount?: number
}

/*
 * Two identical flashes, alternated, so each new one starts over (a CSS
 * animation restarts only when its name changes).
 */
function getFlash(flashCount: number): 'odd' | 'even' | undefined {
  if (flashCount === 0) return undefined
  return flashCount % 2 === 1 ? 'odd' : 'even'
}

export function Button({
  variant,
  iconOnly,
  plainWhenExpanded,
  flashCount = 0,
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
      data-flash={getFlash(flashCount)}
      {...buttonProps}
    />
  )
}
