import type { ComponentProps } from 'react'
import styles from './FormChoice.module.css'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

/** A native checkbox with its label; group several in a ChoiceFieldset. */
export function Checkbox({
  label,
  className = '',
  ...inputProps
}: CheckboxProps) {
  return (
    <label className={styles.choice}>
      <input
        type="checkbox"
        className={`${styles.input} ${className}`}
        {...inputProps}
      />
      {label}
    </label>
  )
}
