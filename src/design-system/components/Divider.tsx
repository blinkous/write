import styles from './Divider.module.css'

/** Vertical rule separating groups of controls in a row. */
export function Divider() {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className={styles.divider}
    />
  )
}
