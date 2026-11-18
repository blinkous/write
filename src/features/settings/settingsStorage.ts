import { z } from 'zod'
import {
  hasStoredValue,
  readStoredValue,
  writeStoredValue,
} from '../../lib/localStore'

const SETTINGS_OPEN_STORAGE_KEY = 'write.settingsOpen.v1'
const OPEN_SECTIONS_STORAGE_KEY = 'write.settingsOpenSections.v1'
/*
 * Before sections started folded, the folded ones were remembered instead. It's
 * read once (while open sections aren't saved yet) and left as a backup.
 */
const CLOSED_SECTIONS_STORAGE_KEY = 'write.settingsClosedSections.v1'

/** Open until first closed, so a first look shows what the app can do. */
export function loadIsSettingsOpen(): boolean {
  return readStoredValue(SETTINGS_OPEN_STORAGE_KEY, z.boolean(), true)
}

export function saveIsSettingsOpen(isOpen: boolean): void {
  writeStoredValue(SETTINGS_OPEN_STORAGE_KEY, isOpen)
}

const sectionIdsSchema = z.array(z.string())

/**
 * Open sections, by id; anything not listed (including sections added later)
 * is folded. Before anything is saved, the default open sections are open.
 * Someone who folded sections before keeps the rest open.
 */
export function loadOpenSectionIds(
  allSectionIds: readonly string[],
  defaultOpenSectionIds: readonly string[],
): string[] {
  if (hasStoredValue(OPEN_SECTIONS_STORAGE_KEY))
    return readStoredValue(OPEN_SECTIONS_STORAGE_KEY, sectionIdsSchema, [])
  if (!hasStoredValue(CLOSED_SECTIONS_STORAGE_KEY))
    return [...defaultOpenSectionIds]
  const closedSectionIds = readStoredValue(
    CLOSED_SECTIONS_STORAGE_KEY,
    sectionIdsSchema,
    [],
  )
  return allSectionIds.filter(
    (sectionId) => !closedSectionIds.includes(sectionId),
  )
}

export function saveOpenSectionIds(sectionIds: readonly string[]): void {
  writeStoredValue(OPEN_SECTIONS_STORAGE_KEY, sectionIds)
}
