import type { ComponentProps } from 'react'
import styles from './TextInput.module.css'

type TextInputVariant = 'boxed' | 'inline'

type TextInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** "inline" edits text in place: same font and box as the text it replaces, so nothing shifts. */
  variant?: TextInputVariant
}

export function TextInput({
  variant = 'boxed',
  className = '',
  ...inputProps
}: TextInputProps) {
  return (
    <input
      type="text"
      className={`${styles.textInput} ${styles[variant]} ${className}`}
      {...inputProps}
    />
  )
}
