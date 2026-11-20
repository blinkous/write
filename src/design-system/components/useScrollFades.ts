import { useLayoutEffect, type RefObject } from 'react'
import fadeStyles from './scrollFade.module.css'

export type ScrollAxis = 'horizontal' | 'vertical'

/** Marks the ends that have content scrolled out of view, for the fades. */
function markHiddenEnds(element: HTMLElement, axis: ScrollAxis) {
  const isHorizontal = axis === 'horizontal'
  const scrolled = isHorizontal ? element.scrollLeft : element.scrollTop
  const visible = isHorizontal ? element.clientWidth : element.clientHeight
  const total = isHorizontal ? element.scrollWidth : element.scrollHeight
  // A pixel of slack: zoom can leave fractions at either end.
  element.toggleAttribute('data-more-start', scrolled > 1)
  element.toggleAttribute('data-more-end', scrolled + visible < total - 1)
}

/**
 * Fades a scrolling element's edges while there's more to see that way: put
 * the returned class on it. Which ends fade is set on the element directly
 * (`data-more-start` / `data-more-end`), so scrolling never re-renders. Updates
 * when it scrolls, resizes, or its contents change size or come and go.
 */
export function useScrollFades(
  ref: RefObject<HTMLElement | null>,
  axis: ScrollAxis,
): string {
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => markHiddenEnds(element, axis)
    const resizeObserver = new ResizeObserver(update)
    const observeChildren = () => {
      for (const child of element.children) resizeObserver.observe(child)
      update()
    }
    resizeObserver.observe(element)
    observeChildren()
    const mutationObserver = new MutationObserver(observeChildren)
    mutationObserver.observe(element, { childList: true })
    element.addEventListener('scroll', update, { passive: true })
    return () => {
      element.removeEventListener('scroll', update)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [ref, axis])
  return fadeStyles[axis]
}
