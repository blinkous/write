import type { InputHTMLAttributes } from 'react'
import styles from './TextInput.module.css'

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function TextInput({ className = '', ...inputProps }: TextInputProps) {
  return (
    <input
      type="text"
      className={`${styles.textInput} ${className}`}
      {...inputProps}
    />
  )
}
