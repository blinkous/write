import {
  useId,
  useRef,
  useState,
  type ReactNode,
  type ToggleEvent,
} from 'react'
import { flushSync } from 'react-dom'
import { Button } from './Button'
import type { ButtonVariant } from './buttonClassName'
import styles from './Popover.module.css'

type PopoverProps = {
  /** Accessible name for the trigger and panel; must include any visible trigger text. */
  label: string
  /** Visible content of the trigger button. */
  trigger: ReactNode
  /** Square trigger for a lone icon; turn off for triggers that show text. */
  isTriggerIconOnly?: boolean
  triggerVariant?: ButtonVariant
  /**
   * Content, or a function receiving `close` for actions that should dismiss the
   * panel, and `refocus` for actions that disable themselves (e.g. a reset), so
   * focus moves back to where the panel opened with it instead of being lost.
   */
  children: ReactNode | ((close: () => void, refocus: () => void) => ReactNode)
  /** `below` the trigger, lined up with its `align` edge, or `beside` it, lined up with its top. */
  placement?: 'below' | 'beside'
  align?: 'start' | 'end'
  /** Turns the trigger off, e.g. when the menu doesn't apply right now. */
  isDisabled?: boolean
  onClose?: () => void
}

/**
 * Moves focus into the panel on open, as expected for a dialog: onto the
 * current choice of a pick-one menu (already shown as chosen, and where the
 * arrow keys start), otherwise onto the panel itself, so nothing looks chosen
 * until Tab and a stray Enter or Space can't press anything (as in `Dialog`).
 * Only this panel's own choices count, not those of a menu nested inside it.
 */
function focusInitialControl(panel: HTMLDivElement) {
  const currentChoice = [
    ...panel.querySelectorAll<HTMLElement>('input:checked'),
  ].find((choice) => choice.closest('[popover]') === panel)
  ;(currentChoice ?? panel).focus()
}

/** Focus was inside the closed panel, or nowhere (e.g. a nested menu closed after a click). */
function isFocusLost(panel: HTMLDivElement): boolean {
  const { activeElement } = document
  return (
    activeElement === null ||
    activeElement === document.body ||
    panel.contains(activeElement)
  )
}

/**
 * Light-dismiss panel built on the native Popover API, which handles
 * Escape, outside clicks and focus return without extra JS. Its content is
 * only rendered while open: closed menus would otherwise re-render with the
 * app on every keystroke (whole font lists and swatch grids), garbage WebKit
 * is slow to give back.
 */
export function Popover({
  label,
  trigger,
  isTriggerIconOnly = true,
  triggerVariant,
  children,
  placement = 'below',
  align = 'end',
  isDisabled = false,
  onClose,
}: PopoverProps) {
  const popoverId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const getPanel = () => document.getElementById(popoverId)
  const close = () => getPanel()?.hidePopover()
  const refocus = () => {
    const panel = getPanel()
    if (panel instanceof HTMLDivElement) focusInitialControl(panel)
  }

  /* Rendered before the panel shows (not after), so it opens at its full size and the focus below finds its controls. */
  function handleBeforeToggle({
    newState,
    target,
    currentTarget,
  }: ToggleEvent<HTMLDivElement>) {
    if (target === currentTarget && newState === 'open')
      flushSync(() => setIsOpen(true))
  }

  function handleToggle({
    newState,
    target,
    currentTarget,
  }: ToggleEvent<HTMLDivElement>) {
    // React bubbles toggle events: ignore those from a menu nested inside this one.
    if (target !== currentTarget) return
    if (newState === 'open') return focusInitialControl(currentTarget)
    // Back to the trigger, so keyboard users keep their place (onClose may move it on, e.g. to the text).
    if (isFocusLost(currentTarget)) triggerRef.current?.focus()
    setIsOpen(false)
    onClose?.()
  }

  return (
    <div className={styles.anchor}>
      <Button
        ref={triggerRef}
        iconOnly={isTriggerIconOnly}
        variant={triggerVariant}
        className={isTriggerIconOnly ? undefined : styles.textTrigger}
        aria-label={label}
        title={label}
        popoverTarget={popoverId}
        disabled={isDisabled}
      >
        {trigger}
      </Button>
      <div
        id={popoverId}
        popover="auto"
        role="dialog"
        // Focusable only from code, on open; never a Tab stop.
        tabIndex={-1}
        aria-label={label}
        onBeforeToggle={handleBeforeToggle}
        onToggle={handleToggle}
        className={`${styles.panel} ${placement === 'beside' ? styles.beside : styles[align]}`}
      >
        {isOpen &&
          (typeof children === 'function'
            ? children(close, refocus)
            : children)}
      </div>
    </div>
  )
}
