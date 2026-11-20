import { useState } from 'react'
import type { usePageTheme } from './usePageTheme'

type HistoryAction = 'undo' | 'redo'

/**
 * Undo and redo from their keys, flashing the matching button so it's clear
 * what happened and where; nothing (and no flash) when there's nothing to undo or redo.
 */
export function useThemeHistoryKeys({
  canUndo,
  canRedo,
  undo,
  redo,
}: Pick<
  ReturnType<typeof usePageTheme>,
  'canUndo' | 'canRedo' | 'undo' | 'redo'
>) {
  const [flashCounts, setFlashCounts] = useState<Record<HistoryAction, number>>(
    { undo: 0, redo: 0 },
  )

  function flash(action: HistoryAction) {
    setFlashCounts((counts) => ({ ...counts, [action]: counts[action] + 1 }))
  }

  return {
    /** How many times each button has been flashed (see Button's flashCount). */
    flashCounts,
    undo() {
      if (!canUndo) return
      undo()
      flash('undo')
    },
    redo() {
      if (!canRedo) return
      redo()
      flash('redo')
    },
  }
}
