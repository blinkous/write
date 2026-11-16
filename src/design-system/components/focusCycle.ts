type FocusCycleOptions<Control> = {
  isBackwards: boolean
  /** Where the first Tab from outside the controls lands, if not the first one. */
  firstStop?: Control
}

/**
 * The control Tab should move to, among a container's controls in Tab order:
 * the next one (or previous, going backwards), wrapping at either end. From
 * anywhere else, e.g. the container itself, it starts at `firstStop` if that's
 * one of the controls, else the first (or the last, going backwards).
 */
export function nextInFocusCycle<Control>(
  controls: readonly Control[],
  current: unknown,
  { isBackwards, firstStop }: FocusCycleOptions<Control>,
): Control | undefined {
  const currentIndex = controls.findIndex((control) => control === current)
  const hasFirstStop = controls.some((control) => control === firstStop)
  if (currentIndex === -1 && !isBackwards && hasFirstStop) return firstStop
  const step = isBackwards ? -1 : 1
  const startIndex = isBackwards ? controls.length : -1
  const fromIndex = currentIndex === -1 ? startIndex : currentIndex
  return controls.at((fromIndex + step) % controls.length)
}
