import type { ReactNode } from 'react'
import { LabeledRow } from './LabeledRow'
import { NumberStepper } from './NumberStepper'
import { Popover } from './Popover'
import { PopoverPanel } from './PopoverPanel'
import { ResetMenuItem } from './ResetMenuItem'

type StepperMenuProps = {
  /** Names the value, e.g. "Letter spacing"; the trigger adds the current value to it. */
  label: string
  /** The trigger's icon (aria-hidden). */
  icon: ReactNode
  value: number
  min: number
  max: number
  /** Shown after the number, e.g. "%". */
  unit?: string
  onChange: (value: number) => void
  /** Puts the value back to what it follows (e.g. its style's); the reset is off while there's nothing to undo. */
  onReset: () => void
  canReset: boolean
  onClose?: () => void
}

/**
 * An icon that opens a number stepper, for a toolbar-sized control (e.g.
 * letter spacing), with a reset row under it that puts it back.
 */
export function StepperMenu({
  label,
  icon,
  value,
  min,
  max,
  unit = '',
  onChange,
  onReset,
  canReset,
  onClose,
}: StepperMenuProps) {
  return (
    <Popover
      label={`${label}: ${value}${unit}`}
      trigger={icon}
      onClose={onClose}
    >
      {(_close, refocus) => (
        <>
          <PopoverPanel width="regular">
            <LabeledRow label={label} control="icon">
              <NumberStepper
                label={label}
                value={value}
                min={min}
                max={max}
                unit={unit}
                onChange={onChange}
              />
            </LabeledRow>
          </PopoverPanel>
          <ResetMenuItem
            label={`Reset ${label.toLowerCase()}`}
            canReset={canReset}
            onReset={onReset}
            refocus={refocus}
          />
        </>
      )}
    </Popover>
  )
}
