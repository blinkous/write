import type { ZodType } from 'zod'

type ReadOptions = {
  /** Called with the raw string when stored data exists but fails to parse or validate. */
  onInvalidValue?: (rawValue: string) => void
}

/**
 * Reads a JSON value from localStorage, returning the fallback when the key is
 * missing, unreadable, or no longer matches the schema (e.g. after a format change).
 */
export function readStoredValue<Value>(
  key: string,
  schema: ZodType<Value>,
  fallback: Value,
  { onInvalidValue }: ReadOptions = {},
): Value {
  const rawValue = readRawValue(key)
  if (rawValue === null) return fallback

  try {
    const parseResult = schema.safeParse(JSON.parse(rawValue))
    if (parseResult.success) return parseResult.data
  } catch {
    // Malformed JSON is handled the same as a schema mismatch below.
  }
  onInvalidValue?.(rawValue)
  return fallback
}

/** Whether anything is stored under the key (even if it wouldn't validate). */
export function hasStoredValue(key: string): boolean {
  return readRawValue(key) !== null
}

/** Overwrites the stored value. Returns false if storage is unavailable or full. */
export function writeStoredValue(key: string, value: unknown): boolean {
  return writeRawValue(key, JSON.stringify(value))
}

/** Keeps a copy of unreadable data under a timestamped key so it is never silently lost. */
export function backUpRawValue(key: string, rawValue: string): boolean {
  return writeRawValue(
    `${getBackupKeyPrefix(key)}${new Date().toISOString()}`,
    rawValue,
  )
}

/** Every backup of `key` made by backUpRawValue starts with this. */
export function getBackupKeyPrefix(key: string): string {
  return `${key}.backup.`
}

/** The stored keys starting with `prefix` (none if storage can't be read). */
export function findStoredKeys(prefix: string): string[] {
  try {
    return Object.keys(window.localStorage).filter((key) =>
      key.startsWith(prefix),
    )
  } catch {
    return []
  }
}

/** The stored string, unparsed, or null if there's none or storage can't be read. */
export function readRawValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Removes the key (nothing happens if it's missing). Returns false if storage is unavailable. */
export function removeStoredValue(key: string): boolean {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

function writeRawValue(key: string, rawValue: string): boolean {
  try {
    window.localStorage.setItem(key, rawValue)
    return true
  } catch {
    return false
  }
}
