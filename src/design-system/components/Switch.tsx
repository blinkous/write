import type { ComponentProps } from 'react'
import styles from './Switch.module.css'

type SwitchProps = Omit<ComponentProps<'input'>, 'type' | 'role'> & {
  label: string
}

/**
 * An on/off setting that applies the moment it's flipped: its name, then the
 * switch at the row's end. A native checkbox underneath (Space toggles it),
 * announced as a switch. Choices a form applies later stay Checkboxes.
 */
export function Switch({ label, className = '', ...inputProps }: SwitchProps) {
  return (
    <label className={styles.row}>
      <span className={styles.label}>{label}</span>
      <input
        type="checkbox"
        role="switch"
        className={`${styles.switch} ${className}`}
        {...inputProps}
      />
    </label>
  )
}
