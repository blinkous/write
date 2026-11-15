import { useEffect } from 'react'
import { hasVisitedBefore, markVisited } from './privacyNoticeStorage'

/** True until this browser's first visit has been remembered (see useRememberVisit). */
export function isFirstVisit(): boolean {
  return !hasVisitedBefore()
}

/** Remembers the visit once the app has shown, so the next one isn't a first. */
export function useRememberVisit(): void {
  useEffect(markVisited, [])
}
