import { useEffect, useRef } from 'react'
import {
  PAGE_SHORTCUT_COMMAND_IDS,
  type PageShortcutCommandId,
} from './shortcutCommands'
import { findShortcutCommand } from './findShortcutCommand'

type PageShortcutActions = Record<PageShortcutCommandId, () => void>

/**
 * Runs page-wide actions on their shortcuts, wherever focus is, instead of
 * what the browser would do (⌘S saving the page, ⌘O opening a file).
 * Key presses the editor already handled are left alone.
 */
export function usePageShortcuts(actions: PageShortcutActions) {
  const latestRef = useRef(actions)
  useEffect(() => {
    latestRef.current = actions
  })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return
      const commandId = findShortcutCommand(event, PAGE_SHORTCUT_COMMAND_IDS)
      if (!commandId) return
      event.preventDefault()
      latestRef.current[commandId]()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
