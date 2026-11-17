import {
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import styles from './ScrollRow.module.css'

type ScrollRowProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

/** Marks the ends that have content scrolled out of view, for the fades. */
function markHiddenEnds(row: HTMLDivElement) {
  const { scrollLeft, scrollWidth, clientWidth } = row
  // A pixel of slack: zoom can leave fractions at either end.
  row.toggleAttribute('data-more-start', scrollLeft > 1)
  row.toggleAttribute(
    'data-more-end',
    scrollLeft + clientWidth < scrollWidth - 1,
  )
}

/**
 * A row of controls, centered in its space, that scrolls sideways when it
 * doesn't fit (no scrollbar); either end fades while there's more that way.
 * Which ends fade is set on the element directly, so scrolling never re-renders.
 */
export function ScrollRow({
  className = '',
  children,
  ...props
}: ScrollRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    const update = () => markHiddenEnds(row)
    update()
    row.addEventListener('scroll', update, { passive: true })
    // Its width and its contents' widths (e.g. a font name) both change what's hidden.
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(row)
    for (const child of row.children) resizeObserver.observe(child)
    return () => {
      row.removeEventListener('scroll', update)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div ref={rowRef} className={`${styles.row} ${className}`} {...props}>
      {children}
    </div>
  )
}
