import { useId, useRef, type ReactNode, type ToggleEvent } from 'react'
import { Button } from './Button'
import styles from './Popover.module.css'

type PopoverProps = {
  /** Accessible name for the trigger and panel; must include any visible trigger text. */
  label: string
  /** Visible content of the trigger button. */
  trigger: ReactNode
  /** Square trigger for a lone icon; turn off for triggers that show text. */
  isTriggerIconOnly?: boolean
  /** Content, or a function receiving `close` for actions that should dismiss the panel. */
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: 'start' | 'end'
  /** Turns the trigger off, e.g. when the menu doesn't apply right now. */
  isDisabled?: boolean
  onClose?: () => void
}

/* In order of preference: the selected choice, otherwise the first control. */
const INITIAL_FOCUS_SELECTORS = [
  'input:checked',
  'button, input, select, [tabindex]',
]

/**
 * Moves focus into the panel on open, as expected for a dialog. Only this
 * panel's own controls count, not those of a closed menu nested inside it.
 */
function focusInitialControl(panel: HTMLDivElement) {
  for (const selector of INITIAL_FOCUS_SELECTORS) {
    const control = [...panel.querySelectorAll<HTMLElement>(selector)].find(
      (candidate) => candidate.closest('[popover]') === panel,
    )
    if (control) return control.focus()
  }
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
 * Escape, outside clicks and focus return without extra JS.
 */
export function Popover({
  label,
  trigger,
  isTriggerIconOnly = true,
  children,
  align = 'end',
  isDisabled = false,
  onClose,
}: PopoverProps) {
  const popoverId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const close = () => document.getElementById(popoverId)?.hidePopover()

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
    onClose?.()
  }

  return (
    <div className={styles.anchor}>
      <Button
        ref={triggerRef}
        iconOnly={isTriggerIconOnly}
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
        aria-label={label}
        onToggle={handleToggle}
        className={`${styles.panel} ${styles[align]}`}
      >
        {typeof children === 'function' ? children(close) : children}
      </div>
    </div>
  )
}
