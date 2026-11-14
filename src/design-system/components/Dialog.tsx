import { useEffect, useId, useRef, type ReactNode } from 'react'
import styles from './Dialog.module.css'
import { MessageTitle, type MessageTone } from './MessageTitle'

type DialogProps = {
  isOpen: boolean
  title: string
  /** See MessageTitle. */
  tone?: MessageTone
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
      <MessageTitle id={titleId} tone={tone}>
        {title}
      </MessageTitle>
      <div className={styles.body}>{children}</div>
      <div className={styles.actions}>{actions}</div>
    </dialog>
  )
}
