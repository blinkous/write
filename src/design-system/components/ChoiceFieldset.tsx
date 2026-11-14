import type { ReactNode } from 'react'
import styles from './FormChoice.module.css'

type ChoiceFieldsetProps = {
  /** Names the group, shown above it and read with each choice. */
  legend: string
  /** A note under the choices, e.g. why one is off. */
  hint?: string
  /** Checkboxes, or the radios of a RadioGroup. */
  children: ReactNode
}

/** A labeled row of choices (checkboxes or radios), wrapping when narrow. */
export function ChoiceFieldset({
  legend,
  hint,
  children,
}: ChoiceFieldsetProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>{children}</div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </fieldset>
  )
}
