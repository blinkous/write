import { useEffect, useRef, useState, type ReactNode } from 'react'
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

/** Resolves once every animation on the element and inside it (its content's slide) has ended. */
function waitForAnimations(element: Element) {
  return Promise.allSettled(
    element.getAnimations({ subtree: true }).map(({ finished }) => finished),
  )
}

/**
 * Something that folds away under a quiet title (its summary) (native details/summary, so
 * it's keyboard and screen reader friendly). Its chevron is down to unfold
 * and up to fold, and while open shows only on hover or focus (as in macOS
 * sidebars), so it isn't mistaken for a dropdown's. Folding and unfolding
 * slide; browsers hide a closed details' content at once, so to fold it stays
 * open while its content slides shut, then closes.
 */
export function Disclosure({
  summary,
  isOpen,
  onToggle,
  children,
}: DisclosureProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const details = detailsRef.current
    if (!isClosing || !details) return
    // Unfolding again mid-slide cancels the close; the slide reverses on its own.
    const cancelClose = new AbortController()
    void waitForAnimations(details).then(() => {
      if (cancelClose.signal.aborted) return
      // Fires toggle, so onToggle reports the fold as usual.
      details.open = false
      setIsClosing(false)
    })
    return () => cancelClose.abort()
  }, [isClosing])

  return (
    <details
      ref={detailsRef}
      className={styles.disclosure}
      open={isOpen}
      data-closing={isClosing || undefined}
      // React bubbles toggle events: only this details' own fold counts, not a popover inside it.
      onToggle={({ target, currentTarget }) => {
        if (target === currentTarget) onToggle?.(currentTarget.open)
      }}
    >
      <summary
        className={styles.summary}
        onClick={(event) => {
          if (!detailsRef.current?.open) return
          // Folding (or unfolding again mid-fold) is handled here rather than by the browser.
          event.preventDefault()
          setIsClosing((wasClosing) => !wasClosing)
        }}
      >
        {summary}
        <Chevron className={styles.chevron} />
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  )
}
