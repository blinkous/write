import { ChevronDown } from 'lucide-react'
import styles from './Chevron.module.css'

/**
 * The small ⌄ beside a menu trigger's label or a section title, so every
 * chevron has the same size and weight. Decorative: the control names itself.
 */
export function Chevron({ className = '' }: { className?: string }) {
  return (
    <ChevronDown
      aria-hidden="true"
      className={`${styles.chevron} ${className}`}
    />
  )
}
