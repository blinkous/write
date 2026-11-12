/*
 * Keyboard shortcuts are written once, in Tiptap / ProseMirror form
 * ("Mod-Shift-x"), and shown from that: as symbols for people ("⇧⌘X" on a
 * Mac, "Ctrl+Shift+X" elsewhere) and as names for screen readers.
 */

function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad/.test(navigator.platform)
}

const MAC_SYMBOLS: Record<string, string> = {
  Mod: '⌘',
  Ctrl: '⌃',
  Alt: '⌥',
  Shift: '⇧',
}
/* Apple's order for modifier symbols. */
const MAC_ORDER = ['Ctrl', 'Alt', 'Shift', 'Mod']

function splitShortcut(shortcut: string): { modifiers: string[]; key: string } {
  const parts = shortcut.split('-')
  const key = parts.at(-1) ?? ''
  return {
    modifiers: parts.slice(0, -1),
    key: key.length === 1 ? key.toUpperCase() : key,
  }
}

/** "Mod-Shift-x" → "⇧⌘X" (Mac) or "Ctrl+Shift+X". */
export function formatShortcut(
  shortcut: string,
  isApple = isApplePlatform(),
): string {
  const { modifiers, key } = splitShortcut(shortcut)
  if (!isApple)
    return [
      ...modifiers.map((modifier) => (modifier === 'Mod' ? 'Ctrl' : modifier)),
      key,
    ].join('+')
  const ordered = modifiers.toSorted(
    (first, second) => MAC_ORDER.indexOf(first) - MAC_ORDER.indexOf(second),
  )
  return [
    ...ordered.map((modifier) => MAC_SYMBOLS[modifier] ?? modifier),
    key,
  ].join('')
}

/** "Mod-Shift-x" → "Meta+Shift+X", for `aria-keyshortcuts`. */
export function toAriaKeyShortcut(
  shortcut: string,
  isApple = isApplePlatform(),
): string {
  const { modifiers, key } = splitShortcut(shortcut)
  const modKey = isApple ? 'Meta' : 'Control'
  return [
    ...modifiers.map((modifier) => (modifier === 'Mod' ? modKey : modifier)),
    key,
  ].join('+')
}
