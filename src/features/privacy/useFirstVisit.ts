import { useEffect, useState } from 'react'
import { hasVisitedBefore, markVisited } from './privacyNoticeStorage'

/** True on this browser's first visit (for this page load), which is then remembered. */
export function useFirstVisit(): boolean {
  const [isFirstVisit] = useState(() => !hasVisitedBefore())
  useEffect(markVisited, [])
  return isFirstVisit
}
