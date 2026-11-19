import { useSyncExternalStore } from 'react'
import { z } from 'zod'
import {
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from '../lib/localStore'
import { createObservableValue } from '../utils/observableValue'

const STORAGE_KEY = 'write.showShortcuts.v1'

/*
 * Browsers can't tell whether there's a keyboard. A precise pointer (mouse or
 * trackpad) is the closest sign: desktops and iPads with a keyboard case
 * have one, phones don't.
 */
const KEYBOARD_LIKELY_QUERY = '(any-pointer: fine)'

function isKeyboardLikely(): boolean {
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia(KEYBOARD_LIKELY_QUERY).matches
}

/** Someone's choice, or null to follow the device. */
const shownChoice = createObservableValue<boolean | null>(
  readStoredValue(STORAGE_KEY, z.boolean().nullable(), null),
)

/** Whether menus and tooltips show shortcuts: as chosen, else per device. */
export function areShortcutsShown(): boolean {
  return shownChoice.get() ?? isKeyboardLikely()
}

export function setShortcutsShown(isShown: boolean): void {
  shownChoice.set(isShown)
  writeStoredValue(STORAGE_KEY, isShown)
}

/** Back to following the device. */
export function resetShortcutsShown(): void {
  shownChoice.set(null)
  removeStoredValue(STORAGE_KEY)
}

export function useAreShortcutsShown(): boolean {
  useSyncExternalStore(shownChoice.subscribe, shownChoice.get)
  return areShortcutsShown()
}
