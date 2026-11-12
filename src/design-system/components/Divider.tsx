import styles from './Divider.module.css'

type DividerProps = {
  /** "vertical" separates groups in a row (toolbar); "horizontal" separates sections in a menu. */
  orientation?: 'vertical' | 'horizontal'
}

export function Divider({ orientation = 'vertical' }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`${styles.divider} ${styles[orientation]}`}
    />
  )
}
