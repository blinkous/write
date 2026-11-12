import { useEffect, useState } from 'react'
import { deriveCozyTextColor } from '../../lib/cozyPalette'
import type { Appearance } from './appearanceOptions'
import {
  beginEdit,
  commitEdit,
  redoPageTheme,
  undoPageTheme,
  type PageTheme,
} from './pageThemeHistory'
import {
  loadPageThemeHistory,
  savePageThemeHistory,
} from './pageThemeHistoryStorage'

/** The app and entry fonts and page colors, with one shared undo/redo over recent changes (kept across refreshes). */
export function usePageTheme(
  { appFont, editorFont, backgroundColor, textColor }: Appearance,
  updateAppearance: (changes: Partial<Appearance>) => void,
) {
  const [history, setHistory] = useState(() =>
    loadPageThemeHistory({ appFont, editorFont }),
  )

  useEffect(() => savePageThemeHistory(history), [history])
  const current: PageTheme = { appFont, editorFont, backgroundColor, textColor }

  function applyStep(step: ReturnType<typeof undoPageTheme>) {
    if (!step) return
    setHistory(step.history)
    updateAppearance(step.theme)
  }

  return {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    /** A font pick (app or entries) is one undo step on its own. */
    changeFonts(fonts: Partial<Pick<PageTheme, 'appFont' | 'editorFont'>>) {
      setHistory((currentHistory) =>
        commitEdit(beginEdit(currentHistory, current), {
          ...current,
          ...fonts,
        }),
      )
      updateAppearance(fonts)
    },
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
    undo: () => applyStep(undoPageTheme(history, current)),
    redo: () => applyStep(redoPageTheme(history, current)),
  }
}
