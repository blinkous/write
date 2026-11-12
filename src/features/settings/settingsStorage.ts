import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'

const SETTINGS_OPEN_STORAGE_KEY = 'write.settingsOpen.v1'
const CLOSED_SECTIONS_STORAGE_KEY = 'write.settingsClosedSections.v1'

export function loadIsSettingsOpen(): boolean {
  return readStoredValue(SETTINGS_OPEN_STORAGE_KEY, z.boolean(), false)
}

export function saveIsSettingsOpen(isOpen: boolean): void {
  writeStoredValue(SETTINGS_OPEN_STORAGE_KEY, isOpen)
}

/** Folded sections, by id; anything not listed (including new sections) is open. */
export function loadClosedSectionIds(): string[] {
  return readStoredValue(CLOSED_SECTIONS_STORAGE_KEY, z.array(z.string()), [])
}

export function saveClosedSectionIds(sectionIds: readonly string[]): void {
  writeStoredValue(CLOSED_SECTIONS_STORAGE_KEY, sectionIds)
}
