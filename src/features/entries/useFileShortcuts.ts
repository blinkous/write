import { useEffect, useRef } from 'react'

type FileShortcutActions = {
  exportEntry: () => void
  openExport: () => void
  openImport: () => void
}

/**
 * ⌘S saves a backup of the current entry (as JSON, via the Save dialog); ⇧⌘S
 * opens Export, for everything; ⌘O opens Import's file picker. Writing is
 * already saved as you type; these replace the browser's "save page" and
 * "open file", which are no use here.
 */
export function useFileShortcuts(actions: FileShortcutActions) {
  const latestRef = useRef(actions)
  useEffect(() => {
    latestRef.current = actions
  })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const { metaKey, ctrlKey, altKey, shiftKey, code } = event
      if (!(metaKey || ctrlKey) || altKey) return
      const { exportEntry, openExport, openImport } = latestRef.current
      if (code === 'KeyS') {
        event.preventDefault()
        if (shiftKey) openExport()
        else exportEntry()
      } else if (code === 'KeyO' && !shiftKey) {
        event.preventDefault()
        openImport()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
