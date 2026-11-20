import { isApplePlatform } from './shortcuts'

export type UndoKey = 'undo' | 'redo'

/**
 * The platform's undo and redo keys: ⌘Z and ⇧⌘Z on Apple devices; Ctrl+Z,
 * Ctrl+Shift+Z and Ctrl+Y elsewhere. Null for any other key.
 */
export function getUndoKey(
  { key, metaKey, ctrlKey, shiftKey, altKey }: KeyboardEvent,
  isApple = isApplePlatform(),
): UndoKey | null {
  const isModPressed = isApple ? metaKey && !ctrlKey : ctrlKey && !metaKey
  if (!isModPressed || altKey) return null
  const pressedKey = key.toLowerCase()
  if (pressedKey === 'z') return shiftKey ? 'redo' : 'undo'
  if (pressedKey === 'y' && !isApple && !shiftKey) return 'redo'
  return null
}
