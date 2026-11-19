import type { ShortcutCommandId } from './shortcutCommands'
import { shortcutsForEvent } from './shortcutKeys'
import { getShortcut } from './shortcutStore'

/** Which of the given actions the key press is the shortcut for, if any. */
export function findShortcutCommand<Id extends ShortcutCommandId>(
  event: KeyboardEvent,
  commandIds: readonly Id[],
): Id | null {
  const pressed = shortcutsForEvent(event)
  return (
    commandIds.find((id) => {
      const shortcut = getShortcut(id)
      return shortcut !== null && pressed.includes(shortcut)
    }) ?? null
  )
}
