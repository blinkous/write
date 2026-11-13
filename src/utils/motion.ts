/** Whether the system asks for less motion right now (false where it can't be read, e.g. tests). */
export function prefersReducedMotion(): boolean {
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  )
}
