import type { ReactNode } from 'react'
import styles from './Field.module.css'

type FieldProps = {
  label: string
  children: ReactNode
  /** Renders as a fieldset/legend; use when wrapping a group of inputs. */
  isGroup?: boolean
}

export function Field({ label, children, isGroup = false }: FieldProps) {
  if (isGroup) {
    return (
      <fieldset className={styles.field}>
        <legend className={styles.label}>{label}</legend>
        {children}
      </fieldset>
    )
  }
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  )
}
