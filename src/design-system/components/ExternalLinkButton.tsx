import type { ReactNode } from 'react'
import { getButtonClassName, type ButtonVariant } from './buttonClassName'

type ExternalLinkButtonProps = {
  href: string
  variant?: ButtonVariant
  /** The visible label, optionally with an icon first. */
  children: ReactNode
}

/**
 * A link to another site, drawn as a button. It opens in a new tab, so the
 * journal stays open, and screen readers hear that it does.
 */
export function ExternalLinkButton({
  href,
  variant,
  children,
}: ExternalLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={getButtonClassName({ variant })}
    >
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}
