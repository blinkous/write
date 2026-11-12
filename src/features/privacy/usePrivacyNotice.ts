import { useState } from 'react'
import {
  hasSeenPrivacyNotice,
  markPrivacyNoticeSeen,
} from './privacyNoticeStorage'

/** Opens by itself on a fresh browser; can be reopened any time from About. */
export function usePrivacyNotice() {
  const [isOpen, setIsOpen] = useState(() => !hasSeenPrivacyNotice())
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => {
      markPrivacyNoticeSeen()
      setIsOpen(false)
    },
  }
}
