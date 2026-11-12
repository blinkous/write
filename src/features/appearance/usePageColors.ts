import { useEffect, useState } from 'react'
import { deriveCozyTextColor } from '../../lib/cozyPalette'
import type { Appearance } from './appearanceOptions'
import {
  beginEdit,
  commitEdit,
  redoPageColors,
  undoPageColors,
  type PageColors,
} from './pageColorHistory'
import {
  loadPageColorHistory,
  savePageColorHistory,
} from './pageColorHistoryStorage'

/** Page background and text colors, with undo/redo over recent changes (kept across refreshes). */
export function usePageColors(
  { backgroundColor, textColor }: Appearance,
  updateAppearance: (changes: Partial<Appearance>) => void,
) {
  const [history, setHistory] = useState(loadPageColorHistory)

  useEffect(() => savePageColorHistory(history), [history])
  const current: PageColors = { backgroundColor, textColor }

  function applyStep(step: ReturnType<typeof undoPageColors>) {
    if (!step) return
    setHistory(step.history)
    updateAppearance(step.colors)
  }

  return {
    backgroundColor,
    textColor,
    /** Changing the background also picks a matching default text color. */
    changeBackground(nextBackgroundColor: string) {
      setHistory((currentHistory) => beginEdit(currentHistory, current))
      updateAppearance({
        backgroundColor: nextBackgroundColor,
        textColor: deriveCozyTextColor(nextBackgroundColor),
      })
    },
    changeText(nextTextColor: string) {
      setHistory((currentHistory) => beginEdit(currentHistory, current))
      updateAppearance({ textColor: nextTextColor })
    },
    /** Ends the current edit (e.g. a finished drag) as one undo step. */
    commit() {
      setHistory((currentHistory) => commitEdit(currentHistory, current))
    },
    canUndo: history.past.length > 0 || history.editStart !== null,
    canRedo: history.future.length > 0 && history.editStart === null,
    undo: () => applyStep(undoPageColors(history, current)),
    redo: () => applyStep(redoPageColors(history, current)),
  }
}
