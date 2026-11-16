import { TriangleAlert } from 'lucide-react'
import styles from './WarningIcon.module.css'

/**
 * Marks something gone wrong (a failed save, a file that won't load). It's
 * drawn in the text color, never a warning color, which could clash with a
 * customized palette; the shape is the signal. Decorative: the words say what
 * went wrong.
 */
export function WarningIcon() {
  return <TriangleAlert className={styles.icon} aria-hidden="true" />
}
