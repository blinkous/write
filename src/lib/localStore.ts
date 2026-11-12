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
  let rawValue: string | null
  try {
    rawValue = window.localStorage.getItem(key)
  } catch {
    return fallback
  }
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
  try {
    return window.localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

/** Overwrites the stored value. Returns false if storage is unavailable or full. */
export function writeStoredValue(key: string, value: unknown): boolean {
  return writeRawValue(key, JSON.stringify(value))
}

/** Keeps a copy of unreadable data under a timestamped key so it is never silently lost. */
export function backUpRawValue(key: string, rawValue: string): boolean {
  return writeRawValue(`${key}.backup.${new Date().toISOString()}`, rawValue)
}

function writeRawValue(key: string, rawValue: string): boolean {
  try {
    window.localStorage.setItem(key, rawValue)
    return true
  } catch {
    return false
  }
}
