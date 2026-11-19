import { formatShortcut, isApplePlatform } from '../utils/shortcuts'
import { normalizeShortcut } from './shortcutKeys'

/*
 * Keys the browser or system keeps whatever a page asks, or that everyone
 * expects to edit text: a shortcut on them would never run, or would take
 * away copy, paste and undo. (⇧⌘C, Chrome's element inspector, isn't here:
 * other browsers let pages have it, so it's each person's choice.)
 */
const KEPT_SHORTCUTS: Record<string, string> = {
  'Mod-w': 'closes the tab',
  'Mod-Shift-w': 'closes the window',
  'Mod-t': 'opens a tab',
  'Mod-Shift-t': 'reopens a tab',
  'Mod-n': 'opens a window',
  'Mod-Shift-n': 'opens a private window',
  'Mod-q': 'quits the browser',
  'Mod-r': 'reloads the page',
  'Mod-Shift-r': 'reloads the page',
  'Mod-l': 'goes to the address bar',
  'Mod-Tab': 'switches apps or tabs',
  'Mod-h': 'hides the browser',
  'Mod-m': 'minimizes the window',
  'Mod-c': 'copies',
  'Mod-x': 'cuts',
  'Mod-v': 'pastes',
  'Mod-Shift-v': 'pastes without formatting',
  'Mod-a': 'selects all',
  'Mod-z': 'undoes',
  'Mod-Shift-z': 'redoes',
  'Mod-y': 'redoes',
  'Mod-f': 'finds on the page',
}

const KEPT_BY_NORMALIZED = new Map(
  Object.entries(KEPT_SHORTCUTS).map(([shortcut, action]) => [
    normalizeShortcut(shortcut),
    action,
  ]),
)

export type ShortcutCheck =
  { isAllowed: true } | { isAllowed: false; reason: string }

/** Whether a key is one that types something (a letter, digit, symbol or space). */
function isTypingKey(key: string): boolean {
  return key.length === 1 || key === 'Space'
}

/**
 * Whether a recorded shortcut (normalized) can be given to an action. It needs
 * ⌘ or Ctrl, or ⌥ with a key that doesn't type (⌥ alone with a letter types
 * an accent or symbol), so writing never sets one off.
 */
export function checkShortcut(shortcut: string): ShortcutCheck {
  const parts = shortcut.split(/-(?!$)/)
  const key = parts.pop() ?? ''
  const hasCommandKey = parts.includes('Mod') || parts.includes('Ctrl')
  const hasAltWithNonTypingKey = parts.includes('Alt') && !isTypingKey(key)
  if (!hasCommandKey && !hasAltWithNonTypingKey)
    return {
      isAllowed: false,
      reason: `${formatShortcut(shortcut)} would go off while typing. Add ${isApplePlatform() ? '⌘' : 'Ctrl'}.`,
    }
  if (key === 'Tab')
    return {
      isAllowed: false,
      reason: `${formatShortcut(shortcut)} moves between controls, so it stays as it is.`,
    }
  const keptAction = KEPT_BY_NORMALIZED.get(shortcut)
  if (keptAction)
    return {
      isAllowed: false,
      reason: `${formatShortcut(shortcut)} ${keptAction}, so it stays as it is.`,
    }
  return { isAllowed: true }
}
