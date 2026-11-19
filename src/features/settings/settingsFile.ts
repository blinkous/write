import { parseAppearance, type Appearance } from '../appearance'
import { isEntrySort, type EntrySort } from '../entries'
import {
  parseShortcutOverrides,
  type ShortcutOverrides,
} from '../../keyboard-shortcuts'

/*
 * A settings backup: the look (fonts, text styles, colors, custom color slots,
 * margins, spacing, tab title, background blur and opacity), how entries are
 * sorted and changed keyboard shortcuts. Not the background file itself (too big; it stays in this browser). Not UI state like whether the
 * drawer is open. Imported files are read like stored settings, so each bad
 * value falls back to its default rather than breaking anything.
 */
const SETTINGS_FORMAT = 'write-settings'
const SETTINGS_VERSION = 1
/** Settings files are tiny; anything bigger isn't one. */
const MAX_SETTINGS_FILE_BYTES = 1024 * 1024

export type Settings = {
  appearance: Appearance
  entrySort: EntrySort
  shortcuts: ShortcutOverrides
}

/** The settings as saved: in a settings file, or inside a journal export (see entries' serializeEntries). */
export function toSettingsRecord({
  appearance,
  entrySort,
  shortcuts,
}: Settings) {
  return {
    format: SETTINGS_FORMAT,
    version: SETTINGS_VERSION,
    appearance,
    entrySort,
    shortcuts,
  }
}

export function serializeSettings(
  settings: Settings,
  exportedAt = new Date(),
): string {
  const settingsFile = {
    ...toSettingsRecord(settings),
    exportedAt: exportedAt.toISOString(),
  }
  return `${JSON.stringify(settingsFile, null, 2)}\n`
}

export function getSettingsFileName(exportedAt = new Date()): string {
  return `write-settings-${exportedAt.toISOString().slice(0, 10)}.json`
}

type SettingsFileResult =
  | { kind: 'settings'; settings: Partial<Settings> }
  | { kind: 'invalid'; reason: string }
  /** Not a settings file (e.g. a journal backup): someone else's to import. */
  | { kind: 'other' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseSettingsFile(fileText: string): SettingsFileResult {
  let rawFile: unknown
  try {
    rawFile = JSON.parse(fileText)
  } catch {
    return { kind: 'other' }
  }
  return parseSettingsRecord(rawFile)
}

/** Reads settings as saved by toSettingsRecord, from a settings file or a journal export. */
export function parseSettingsRecord(rawFile: unknown): SettingsFileResult {
  if (!isRecord(rawFile) || rawFile.format !== SETTINGS_FORMAT)
    return { kind: 'other' }
  if (rawFile.version !== SETTINGS_VERSION)
    return {
      kind: 'invalid',
      reason: 'These settings are from a newer version.',
    }
  const appearance = parseAppearance(rawFile.appearance)
  const entrySort = isEntrySort(rawFile.entrySort)
    ? rawFile.entrySort
    : undefined
  // Files from before shortcuts could change have none: they leave them as they are.
  const shortcuts = parseShortcutOverrides(rawFile.shortcuts)
  if (!appearance && !entrySort && !shortcuts)
    return { kind: 'invalid', reason: 'The file has no settings.' }
  return {
    kind: 'settings',
    settings: {
      ...(appearance && { appearance }),
      ...(entrySort && { entrySort }),
      ...(shortcuts && { shortcuts }),
    },
  }
}

export async function readSettingsFile(
  file: File,
): Promise<SettingsFileResult> {
  if (file.size > MAX_SETTINGS_FILE_BYTES) return { kind: 'other' }
  return parseSettingsFile(await file.text())
}
