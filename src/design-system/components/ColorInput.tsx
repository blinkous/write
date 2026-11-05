import type { InputHTMLAttributes } from 'react'
import styles from './ColorInput.module.css'

type ColorInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function ColorInput({ className = '', ...inputProps }: ColorInputProps) {
  return (
    <input
      type="color"
      className={`${styles.colorInput} ${className}`}
      {...inputProps}
    />
  )
}
