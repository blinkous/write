import type { HTMLAttributes } from 'react'
import styles from './Text.module.css'

type TextVariant = 'body' | 'caption'

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  variant?: TextVariant
}

export function Text({
  variant = 'body',
  className = '',
  ...paragraphProps
}: TextProps) {
  return (
    <p
      className={`${styles.text} ${styles[variant]} ${className}`}
      {...paragraphProps}
    />
  )
}
