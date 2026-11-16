import {
  useEffect,
  useId,
  useRef,
  type PointerEvent,
  type ReactNode,
} from 'react'
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
  /** Called however it closes: an action, Escape, a click outside, or the browser. */
  onClose: () => void
  /**
   * For a dialog that opens by itself (not from a click): it stays open on a
   * click outside, since it wasn't asked for and a stray click shouldn't
   * dismiss it unread. Dialogs you opened close on one, like Escape.
   */
  opensUnprompted?: boolean
}

/** Whether a pointer event landed on the backdrop, outside the dialog's box. */
function isOnBackdrop(dialog: HTMLDialogElement, event: PointerEvent) {
  const { top, right, bottom, left } = dialog.getBoundingClientRect()
  const { clientX, clientY } = event
  return clientX < left || clientX > right || clientY < top || clientY > bottom
}

/**
 * A modal built on the native <dialog>, which traps focus, closes on Escape
 * and returns focus to where it was, with no extra JS. A click outside closes
 * it too (unless it opened by itself), done here because not every browser
 * supports <dialog closedby>.
 *
 * It takes focus itself rather than its first button: nothing looks chosen
 * until Tab, and a stray Enter or Space can't press anything before the
 * dialog is read. Screen readers still announce it, by its title.
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
  // Both ends of the click must be outside, so a text selection dragged out of the dialog doesn't close it.
  const pressStartedOnBackdropRef = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
      dialog.focus()
    }
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Focusable only from code, on open; never a Tab stop.
      tabIndex={-1}
      className={styles.dialog}
      onClose={onClose}
      onPointerDown={(event) => {
        pressStartedOnBackdropRef.current =
          !opensUnprompted && isOnBackdrop(event.currentTarget, event)
      }}
      onPointerUp={(event) => {
        const dialog = event.currentTarget
        if (pressStartedOnBackdropRef.current && isOnBackdrop(dialog, event))
          dialog.close()
        pressStartedOnBackdropRef.current = false
      }}
    >
      {/* Like closed menus, a closed dialog renders nothing (see Popover). */}
      {isOpen && (
        <>
          <MessageTitle id={titleId} tone={tone}>
            {title}
          </MessageTitle>
          <div className={styles.body}>{children}</div>
          <div className={styles.actions}>{actions}</div>
        </>
      )}
    </dialog>
  )
}
