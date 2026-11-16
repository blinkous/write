/**
 * The control Tab should move to, among a container's controls in Tab order:
 * the next one (or previous, going backwards), wrapping at either end. From
 * anywhere else, e.g. the container itself, it starts at the first (or last).
 */
export function nextInFocusCycle<Control>(
  controls: readonly Control[],
  current: unknown,
  isBackwards: boolean,
): Control | undefined {
  const step = isBackwards ? -1 : 1
  const currentIndex = controls.findIndex((control) => control === current)
  const startIndex = isBackwards ? controls.length : -1
  const fromIndex = currentIndex === -1 ? startIndex : currentIndex
  return controls.at((fromIndex + step) % controls.length)
}
