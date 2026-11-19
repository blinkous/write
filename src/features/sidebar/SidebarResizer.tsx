import {
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  getChosenSidebarWidth,
  getDraggedWidth,
  getSidebarWidth,
  getSidebarWidthRange,
  resetSidebarWidth,
  saveSidebarWidth,
  setSidebarWidth,
  stepSidebarWidth,
  subscribeToSidebarWidth,
} from './sidebarWidth'
import styles from './SidebarResizer.module.css'

type SidebarResizerProps = {
  /** The sidebar's id, which this resizes. */
  sidebarId: string
  /** Enter or Escape: done resizing, so focus moves on (e.g. back to the writing). */
  onDone: () => void
}

type Drag = { startX: number; startWidth: number }

/**
 * The divider on the sidebar's edge, a window splitter (WAI-ARIA): drag it,
 * or focus it and use ←/→ (Home/End for narrowest and widest), then Enter or
 * Escape when done; double-click puts the default back. Hidden on narrow screens, where the sidebar overlays
 * the page instead.
 */
export function SidebarResizer({ sidebarId, onDone }: SidebarResizerProps) {
  useSyncExternalStore(subscribeToSidebarWidth, getChosenSidebarWidth)
  const dragRef = useRef<Drag | null>(null)
  const width = getSidebarWidth()
  const { min, max } = getSidebarWidthRange()

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    const { currentTarget, clientX, pointerId } = event
    // Focused, so arrow keys carry on from here (WebKit doesn't focus on click).
    currentTarget.focus()
    currentTarget.setPointerCapture?.(pointerId)
    dragRef.current = { startX: clientX, startWidth: getSidebarWidth() }
  }

  function drag({ clientX }: PointerEvent<HTMLDivElement>) {
    const dragStart = dragRef.current
    if (!dragStart) return
    const { startX, startWidth } = dragStart
    // Saved once, when the drag ends.
    setSidebarWidth(getDraggedWidth(startWidth, clientX - startX), {
      isSaved: false,
    })
  }

  function endDrag() {
    if (!dragRef.current) return
    dragRef.current = null
    saveSidebarWidth()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => stepSidebarWidth(-1),
      ArrowRight: () => stepSidebarWidth(1),
      Home: () => setSidebarWidth(min),
      End: () => setSidebarWidth(max),
      Enter: onDone,
      Escape: onDone,
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Sidebar width"
      aria-controls={sidebarId}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(width)}
      aria-valuetext={`${Math.round(width)} of ${max}`}
      tabIndex={0}
      title="Drag to resize; double-click for the default width"
      className={styles.resizer}
      onPointerDown={startDrag}
      onPointerMove={drag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={resetSidebarWidth}
      onKeyDown={handleKeyDown}
    />
  )
}
