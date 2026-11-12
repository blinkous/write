import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'

/*
 * Named for the welcome dialog it used to open; kept so returning visitors
 * aren't treated as new. Absent on a fresh browser (or after its data was cleared).
 */
const VISITED_STORAGE_KEY = 'write.privacyNoticeSeen.v1'

export function hasVisitedBefore(): boolean {
  return readStoredValue(VISITED_STORAGE_KEY, z.boolean(), false)
}

export function markVisited(): void {
  writeStoredValue(VISITED_STORAGE_KEY, true)
}
