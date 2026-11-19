import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../lib/localStore'
import { createObservableValue } from '../utils/observableValue'
import {
  getShortcutCommand,
  isShortcutCommandId,
  SHORTCUT_COMMANDS,
  type ShortcutCommandId,
} from './shortcutCommands'
import { normalizeShortcut } from './shortcutKeys'
import { checkShortcut } from './shortcutRules'

const STORAGE_KEY = 'write.shortcuts.v1'

/**
 * Only the shortcuts someone changed, by action; null means none. Everything
 * else keeps its default, so defaults can improve later.
 */
export type ShortcutOverrides = Partial<
  Record<ShortcutCommandId, string | null>
>

const storedOverridesSchema = z.record(z.string(), z.string().nullable())

/**
 * Reads overrides from storage or a settings file: unknown actions and
 * shortcuts that aren't allowed are dropped, each on its own. Null when it
 * isn't a set of overrides at all.
 */
export function parseShortcutOverrides(
  rawOverrides: unknown,
): ShortcutOverrides | null {
  const parseResult = storedOverridesSchema.safeParse(rawOverrides)
  if (!parseResult.success) return null
  const overrides: ShortcutOverrides = {}
  for (const [id, shortcut] of Object.entries(parseResult.data)) {
    if (!isShortcutCommandId(id)) continue
    if (shortcut === null) {
      overrides[id] = null
      continue
    }
    const normalized = normalizeShortcut(shortcut)
    if (checkShortcut(normalized).isAllowed) overrides[id] = normalized
  }
  return overrides
}

function loadOverrides(): ShortcutOverrides {
  return (
    parseShortcutOverrides(readStoredValue(STORAGE_KEY, z.unknown(), {})) ?? {}
  )
}

const shortcutOverrides = createObservableValue(loadOverrides())

function getDefaultShortcut(id: ShortcutCommandId): string | null {
  const { defaultShortcut } = getShortcutCommand(id)
  return defaultShortcut && normalizeShortcut(defaultShortcut)
}

function shortcutFrom(
  overrides: ShortcutOverrides,
  id: ShortcutCommandId,
): string | null {
  const override = overrides[id]
  return override === undefined ? getDefaultShortcut(id) : override
}

/** The action's shortcut now (its default unless changed), or null for none. */
export function getShortcut(id: ShortcutCommandId): string | null {
  return shortcutFrom(shortcutOverrides.get(), id)
}

export const getShortcutOverrides = shortcutOverrides.get
export const subscribeToShortcuts = shortcutOverrides.subscribe

function saveOverrides(overrides: ShortcutOverrides) {
  shortcutOverrides.set(overrides)
  writeStoredValue(STORAGE_KEY, overrides)
}

/** Keeps an override only where it differs from the default. */
function withShortcut(
  overrides: ShortcutOverrides,
  id: ShortcutCommandId,
  shortcut: string | null,
): ShortcutOverrides {
  const others = { ...overrides }
  delete others[id]
  return shortcut === getDefaultShortcut(id)
    ? others
    : { ...others, [id]: shortcut }
}

/**
 * Gives the action a shortcut (normalized), or none with null. An action
 * that had it loses it, so a key does one thing; its id is returned, to say so.
 */
export function assignShortcut(
  id: ShortcutCommandId,
  shortcut: string | null,
): ShortcutCommandId | null {
  let overrides = shortcutOverrides.get()
  const previousOwner =
    shortcut === null
      ? undefined
      : SHORTCUT_COMMANDS.find(
          (command) =>
            command.id !== id &&
            shortcutFrom(overrides, command.id) === shortcut,
        )
  if (previousOwner) overrides = withShortcut(overrides, previousOwner.id, null)
  saveOverrides(withShortcut(overrides, id, shortcut))
  return previousOwner?.id ?? null
}

/** Back to the action's default, taken from any action that has it now. */
export function resetShortcut(id: ShortcutCommandId): ShortcutCommandId | null {
  return assignShortcut(id, getDefaultShortcut(id))
}

export function isShortcutChanged(id: ShortcutCommandId): boolean {
  return id in shortcutOverrides.get()
}

export function resetAllShortcuts(): void {
  saveOverrides({})
}

/** Replaces every change at once, e.g. from an imported settings file. */
export function replaceShortcutOverrides(overrides: ShortcutOverrides): void {
  saveOverrides(overrides)
}
