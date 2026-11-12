import { useEffect, useId, useRef, type ReactNode } from 'react'
import styles from './Dialog.module.css'

type DialogProps = {
  isOpen: boolean
  title: string
  children: ReactNode
  /** Buttons along the bottom, e.g. a primary "Got it". */
  actions: ReactNode
  /** Called however it closes: an action, Escape, or the browser. */
  onClose: () => void
}

/**
 * A modal built on the native <dialog>, which traps focus, closes on Escape
 * and returns focus to where it was, with no extra JS.
 */
export function Dialog({
  isOpen,
  title,
  children,
  actions,
  onClose,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={styles.dialog}
      onClose={onClose}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <div className={styles.body}>{children}</div>
      <div className={styles.actions}>{actions}</div>
    </dialog>
  )
}
