import type { HTMLAttributes } from 'react'
import styles from './Text.module.css'

type TextVariant = 'body' | 'caption'

type TextProps = HTMLAttributes<HTMLElement> & {
  variant?: TextVariant
  /** A paragraph by default; a span inside phrasing content, e.g. a button. */
  as?: 'p' | 'span'
}

export function Text({
  variant = 'body',
  as: Element = 'p',
  className = '',
  ...textProps
}: TextProps) {
  return (
    <Element
      className={`${styles.text} ${styles[variant]} ${className}`}
      {...textProps}
    />
  )
}
