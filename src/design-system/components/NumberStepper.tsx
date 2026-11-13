import { Minus, Plus } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { parseTypedNumber, snapToRange } from '../../utils/numberRange'
import { Button } from './Button'
import styles from './NumberStepper.module.css'

type NumberStepperProps = {
  /** Names the value, e.g. "Title size"; buttons say "Smaller" / "Larger" with it. */
  label: string
  value: number
  min: number
  max: number
  /** How far each press moves the value (default 1); typed values snap to it. */
  step?: number
  /** Shown after the number, e.g. "px". */
  unit?: string
  onChange: (value: number) => void
}

/**
 * − value +: steps a number, stopping at its limits. The value can also be
 * typed (applied on Enter or leaving the field, kept within the limits and on
 * a step) or stepped with the arrow keys, like a native spin button.
 */
export function NumberStepper({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: NumberStepperProps) {
  const range = { min, max, step }
  // What's being typed; null while not editing, so the field shows the value.
  const [draft, setDraft] = useState<string | null>(null)

  function change(nextValue: number) {
    const snapped = snapToRange(nextValue, range)
    if (snapped !== value) onChange(snapped)
  }

  function applyDraft() {
    if (draft === null) return
    const typed = parseTypedNumber(draft)
    if (typed !== null) change(typed)
    setDraft(null)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const { key } = event
    if (key === 'Enter') return applyDraft()
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault()
      setDraft(null)
      return change(value + (key === 'ArrowUp' ? step : -step))
    }
    // Back to the value; Escape still closes the menu it's in.
    if (key === 'Escape') setDraft(null)
  }

  return (
    <div role="group" aria-label={label} className={styles.stepper}>
      <Button
        iconOnly
        variant="ghost"
        aria-label={`${label}: smaller`}
        title="Smaller"
        disabled={value <= min}
        onClick={() => change(value - step)}
      >
        <Minus aria-hidden="true" />
      </Button>
      <input
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={unit ? `${value} ${unit}` : String(value)}
        autoComplete="off"
        spellCheck={false}
        className={styles.value}
        value={draft ?? String(value)}
        onFocus={({ currentTarget }) => currentTarget.select()}
        onChange={({ target }) => setDraft(target.value)}
        onBlur={applyDraft}
        onKeyDown={handleKeyDown}
      />
      {unit && (
        <span className={styles.unit} aria-hidden="true">
          {unit}
        </span>
      )}
      {/* Announces each new value, e.g. after pressing − or +. */}
      <span className="visually-hidden" aria-live="polite">
        {unit ? `${value} ${unit}` : value}
      </span>
      <Button
        iconOnly
        variant="ghost"
        aria-label={`${label}: larger`}
        title="Larger"
        disabled={value >= max}
        onClick={() => change(value + step)}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  )
}
