import type { ReactNode } from 'react'
import { Chevron } from './Chevron'
import styles from './Disclosure.module.css'

type DisclosureProps = {
  /** What's always shown; the whole line toggles. */
  summary: ReactNode
  /** Controlled when given (with onToggle); otherwise it starts folded and keeps its own state. */
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  children: ReactNode
}

/**
 * Something that folds away under a quiet title (its summary) (native details/summary, so
 * it's keyboard and screen reader friendly). Its chevron is down to unfold
 * and up to fold, and while open shows only on hover or focus (as in macOS
 * sidebars), so it isn't mistaken for a dropdown's.
 */
export function Disclosure({
  summary,
  isOpen,
  onToggle,
  children,
}: DisclosureProps) {
  return (
    <details
      className={styles.disclosure}
      open={isOpen}
      // React bubbles toggle events: only this details' own fold counts, not a popover inside it.
      onToggle={({ target, currentTarget }) => {
        if (target === currentTarget) onToggle?.(currentTarget.open)
      }}
    >
      <summary className={styles.summary}>
        {summary}
        <Chevron className={styles.chevron} />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  )
}
