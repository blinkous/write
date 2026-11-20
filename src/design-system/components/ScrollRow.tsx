import { useRef, type HTMLAttributes, type ReactNode } from 'react'
import styles from './ScrollRow.module.css'
import { useScrollFades } from './useScrollFades'

type ScrollRowProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

/**
 * A row of controls, centered in its space (or at its start, see the CSS), that scrolls sideways when it
 * doesn't fit (no scrollbar); either end fades while there's more that way.
 */
export function ScrollRow({
  className = '',
  children,
  ...props
}: ScrollRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const fadeClassName = useScrollFades(rowRef, 'horizontal')
  return (
    <div
      ref={rowRef}
      className={`${styles.row} ${fadeClassName} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
