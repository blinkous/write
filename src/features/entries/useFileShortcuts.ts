import { useEffect, useRef } from 'react'

type FileShortcutActions = {
  exportEntry: () => void
  openExport: () => void
  openImport: () => void
}

type FileShortcut = {
  /** `KeyboardEvent.code`, so the shortcut stays on the same key in any layout. */
  code: string
  shiftKey: boolean
  action: keyof FileShortcutActions
}

/*
 * Each with ⌘ (Ctrl elsewhere), never ⌥. ⌘S saves a backup of the current
 * entry (as JSON, via the Save dialog); ⇧⌘S opens Export, for everything, and
 * so does ⇧⌘E (unlisted, for "export"); ⌘O opens Import's file picker.
 * Writing is already saved as you type; these replace the browser's "save
 * page" and "open file", which are no use here.
 */
const FILE_SHORTCUTS: readonly FileShortcut[] = [
  { code: 'KeyS', shiftKey: false, action: 'exportEntry' },
  { code: 'KeyS', shiftKey: true, action: 'openExport' },
  { code: 'KeyE', shiftKey: true, action: 'openExport' },
  { code: 'KeyO', shiftKey: false, action: 'openImport' },
]

export function useFileShortcuts(actions: FileShortcutActions) {
  const latestRef = useRef(actions)
  useEffect(() => {
    latestRef.current = actions
  })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const { metaKey, ctrlKey, altKey, shiftKey, code } = event
      if (!(metaKey || ctrlKey) || altKey) return
      const shortcut = FILE_SHORTCUTS.find(
        (candidate) =>
          candidate.code === code && candidate.shiftKey === shiftKey,
      )
      if (!shortcut) return
      event.preventDefault()
      latestRef.current[shortcut.action]()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
