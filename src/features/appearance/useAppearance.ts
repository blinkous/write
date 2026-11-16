import { useEffect, useState } from 'react'
import type { Appearance } from './appearanceOptions'
import { applyAppearance } from './applyAppearance'
import {
  getFirstVisitAppearance,
  loadAppearance,
  saveAppearance,
} from './appearanceStorage'

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(loadAppearance)

  useEffect(() => {
    applyAppearance(appearance)
    saveAppearance(appearance)
  }, [appearance])

  function updateAppearance(changes: Partial<Appearance>) {
    setAppearance((currentAppearance) => ({ ...currentAppearance, ...changes }))
  }

  /** Every setting back to a first visit's (see getFirstVisitAppearance). */
  function resetAppearance() {
    setAppearance(getFirstVisitAppearance())
  }

  return { appearance, updateAppearance, resetAppearance }
}
