import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { X } from 'lucide-react'
import { tabbable } from 'tabbable'
import { Button } from './Button'
import styles from './Dialog.module.css'
import { nextInFocusCycle } from './focusCycle'
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
   * click outside and has no ×, since it wasn't asked for and shouldn't be
   * dismissed unread. Dialogs you opened close on a click outside, Escape or
   * their × (top right).
   */
  opensUnprompted?: boolean
  /**
   * Where the first Tab lands, if not the first control, e.g. the main
   * action. Nothing is focused until that Tab either way.
   */
  firstTabStopRef?: RefObject<HTMLElement | null>
  /**
   * For a dialog that's there to type in (e.g. alt text): its field, focused
   * on open so typing starts at once. Enter there is the dialog's own action,
   * so nothing can be pressed by mistake.
   */
  initialFocusRef?: RefObject<HTMLElement | null>
}

/** Whether a pointer event landed on the backdrop, outside the dialog's box. */
function isOnBackdrop(dialog: HTMLDialogElement, event: PointerEvent) {
  const { top, right, bottom, left } = dialog.getBoundingClientRect()
  const { clientX, clientY } = event
  return clientX < left || clientX > right || clientY < top || clientY > bottom
}

/**
 * Tab and Shift+Tab step through every control in the dialog, wrapping at the
 * ends. Done here because Safari's plain Tab skips buttons, checkboxes and
 * radios (only Option+Tab reaches them), which left nothing in a dialog to
 * land on, and focus fell out to the page behind it.
 */
function cycleFocusWithin(
  dialog: HTMLDialogElement,
  event: KeyboardEvent,
  firstStop: HTMLElement | null | undefined,
) {
  const { key, shiftKey, metaKey, ctrlKey } = event
  if (key !== 'Tab' || metaKey || ctrlKey) return
  const next = nextInFocusCycle(tabbable(dialog), document.activeElement, {
    isBackwards: shiftKey,
    firstStop: firstStop ?? undefined,
  })
  if (!next) return
  event.preventDefault()
  next.focus()
}

/**
 * A modal built on the native <dialog>, which traps focus, closes on Escape
 * and returns focus to where it was, with no extra JS. A click outside closes
 * it too (unless it opened by itself), done here because not every browser
 * supports <dialog closedby>.
 *
 * It takes focus itself rather than its first button: nothing looks chosen
 * until Tab, and a stray Enter or Space can't press anything before the
 * dialog is read. Screen readers still announce it, by its title. A dialog
 * that's there to type in focuses its field instead (initialFocusRef).
 */
export function Dialog({
  isOpen,
  title,
  tone = 'neutral',
  children,
  actions,
  onClose,
  opensUnprompted = false,
  firstTabStopRef,
  initialFocusRef,
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
      const firstFocus = initialFocusRef?.current ?? dialog
      firstFocus.focus()
    }
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen, initialFocusRef])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Focusable only from code, on open; never a Tab stop.
      tabIndex={-1}
      className={styles.dialog}
      onClose={onClose}
      onKeyDown={(event) =>
        cycleFocusWithin(event.currentTarget, event, firstTabStopRef?.current)
      }
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
          <div className={styles.header}>
            <MessageTitle id={titleId} tone={tone}>
              {title}
            </MessageTitle>
            {!opensUnprompted && (
              <Button
                iconOnly
                aria-label="Close"
                title="Close"
                className={styles.close}
                onClick={() => dialogRef.current?.close()}
              >
                <X aria-hidden="true" />
              </Button>
            )}
          </div>
          <div className={styles.body}>{children}</div>
          <div className={styles.actions}>{actions}</div>
        </>
      )}
    </dialog>
  )
}
