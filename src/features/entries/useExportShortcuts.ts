import { useEffect, useRef } from 'react'

type ExportShortcutActions = {
  exportEntry: () => void
  exportAllEntries: () => void
}

/**
 * ⌘S saves a backup of the current entry, ⇧⌘S of all entries (as JSON, via the
 * Save dialog). Writing is already saved as you type; these replace the
 * browser's "save page", which is no use here.
 */
export function useExportShortcuts(actions: ExportShortcutActions) {
  const latestRef = useRef(actions)
  useEffect(() => {
    latestRef.current = actions
  })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.code === 'KeyS'
      if (!isSaveShortcut) return
      event.preventDefault()
      const { exportEntry, exportAllEntries } = latestRef.current
      if (event.shiftKey) exportAllEntries()
      else exportEntry()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
