import { TriangleAlert } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import styles from './Dialog.module.css'

type DialogProps = {
  isOpen: boolean
  title: string
  /** "warning" marks something gone wrong (e.g. a failed save) with a warning icon before the title. */
  tone?: 'neutral' | 'warning'
  children: ReactNode
  /** Buttons along the bottom, e.g. a primary "Got it". */
  actions: ReactNode
  /** Called however it closes: an action, Escape, or the browser. */
  onClose: () => void
  /**
   * For a dialog that opens by itself (not from a click), perhaps mid-typing:
   * focus goes to the dialog instead of its first button, so the next
   * keystroke (Enter, Space) can't press a button before it's read.
   */
  opensUnprompted?: boolean
}

/**
 * A modal built on the native <dialog>, which traps focus, closes on Escape
 * and returns focus to where it was, with no extra JS.
 */
export function Dialog({
  isOpen,
  title,
  tone = 'neutral',
  children,
  actions,
  onClose,
  opensUnprompted = false,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
      if (opensUnprompted) dialog.focus()
    }
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen, opensUnprompted])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Focusable only from code, for opensUnprompted; never a Tab stop.
      tabIndex={opensUnprompted ? -1 : undefined}
      className={styles.dialog}
      onClose={onClose}
    >
      <h2 id={titleId} className={styles.title}>
        {tone === 'warning' && (
          <TriangleAlert className={styles.warningIcon} aria-hidden="true" />
        )}
        {title}
      </h2>
      <div className={styles.body}>{children}</div>
      <div className={styles.actions}>{actions}</div>
    </dialog>
  )
}
