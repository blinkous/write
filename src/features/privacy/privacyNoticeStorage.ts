import { z } from 'zod'
import { readStoredValue, writeStoredValue } from '../../lib/localStore'

const PRIVACY_NOTICE_SEEN_STORAGE_KEY = 'write.privacyNoticeSeen.v1'

/** False on a fresh browser (or after its data was cleared), so the notice shows again. */
export function hasSeenPrivacyNotice(): boolean {
  return readStoredValue(PRIVACY_NOTICE_SEEN_STORAGE_KEY, z.boolean(), false)
}

export function markPrivacyNoticeSeen(): void {
  writeStoredValue(PRIVACY_NOTICE_SEEN_STORAGE_KEY, true)
}
