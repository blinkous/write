import { useId, type ReactNode, type ToggleEvent } from 'react'
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
  onClose?: () => void
}

/* The selected choice if there is one, otherwise the first control. */
const INITIAL_FOCUS_SELECTOR =
  'input:checked, button, input, select, [tabindex]'

/** Moves focus into the panel on open, as expected for a dialog. */
function focusFirstControl(panel: HTMLDivElement) {
  panel.querySelector<HTMLElement>(INITIAL_FOCUS_SELECTOR)?.focus()
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
  onClose,
}: PopoverProps) {
  const popoverId = useId()
  const close = () => document.getElementById(popoverId)?.hidePopover()

  function handleToggle({
    newState,
    currentTarget,
  }: ToggleEvent<HTMLDivElement>) {
    if (newState === 'open') focusFirstControl(currentTarget)
    else onClose?.()
  }

  return (
    <div className={styles.anchor}>
      <Button
        iconOnly={isTriggerIconOnly}
        aria-label={label}
        title={label}
        popoverTarget={popoverId}
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
