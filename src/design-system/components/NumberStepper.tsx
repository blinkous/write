import { Minus, Plus } from 'lucide-react'
import { Button } from './Button'
import styles from './NumberStepper.module.css'

type NumberStepperProps = {
  /** Names the value, e.g. "Title size"; buttons say "Smaller" / "Larger" with it. */
  label: string
  value: number
  min: number
  max: number
  /** Shown after the number, e.g. "px". */
  unit?: string
  onChange: (value: number) => void
}

/** − value +: steps a number by one, stopping at its limits. */
export function NumberStepper({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
}: NumberStepperProps) {
  return (
    <div role="group" aria-label={label} className={styles.stepper}>
      <Button
        iconOnly
        variant="ghost"
        aria-label={`${label}: smaller`}
        title="Smaller"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus aria-hidden="true" />
      </Button>
      {/* Announced when it changes, so the new value is heard after each step. */}
      <output aria-live="polite" className={styles.value}>
        {value}
        {unit && <span className={styles.unit}> {unit}</span>}
      </output>
      <Button
        iconOnly
        variant="ghost"
        aria-label={`${label}: larger`}
        title="Larger"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  )
}
