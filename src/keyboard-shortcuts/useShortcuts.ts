import { useSyncExternalStore } from 'react'
import {
  getShortcut,
  getShortcutOverrides,
  subscribeToShortcuts,
} from './shortcutStore'
import { useAreShortcutsShown } from './shortcutVisibility'

/**
 * Looks up actions' current shortcuts (null for none), re-rendering when
 * any changes: controls show whatever someone set.
 */
export function useShortcuts(): typeof getShortcut {
  useShortcutOverrides()
  return getShortcut
}

/** Only the changed shortcuts, e.g. to save with settings. */
export function useShortcutOverrides() {
  return useSyncExternalStore(subscribeToShortcuts, getShortcutOverrides)
}

/**
 * Like useShortcuts, for showing beside controls: null for every action
 * while shortcuts are hidden (e.g. on a phone), where they'd only take room.
 * They still work.
 */
export function useShownShortcuts(): typeof getShortcut {
  const getShortcutNow = useShortcuts()
  const isShown = useAreShortcutsShown()
  return (id) => (isShown ? getShortcutNow(id) : null)
}
