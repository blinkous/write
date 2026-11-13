import { useEffect, useState } from 'react'
import { deriveCozyTextColor } from '../../lib/cozyPalette'
import {
  DEFAULT_TEXT_STYLES,
  type TextStyleName,
  type TextStyleSettings,
} from '../../text-styles'
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

/**
 * The fonts, page colors, text styles, tab title and background blur and
 * opacity, with one shared undo/redo over recent changes (kept across refreshes).
 */
export function usePageTheme(
  {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    textStyles,
    tabTitle,
    backgroundBlur,
    backgroundOpacity,
  }: Appearance,
  updateAppearance: (changes: Partial<Appearance>) => void,
) {
  const current: PageTheme = {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    textStyles,
    tabTitle,
    backgroundBlur,
    backgroundOpacity,
  }
  const [history, setHistory] = useState(() => loadPageThemeHistory(current))

  useEffect(() => savePageThemeHistory(history), [history])

  function applyStep(step: ReturnType<typeof undoPageTheme>) {
    if (!step) return
    setHistory(step.history)
    updateAppearance(step.theme)
  }

  /** Applies a change: one undo step now, or (while dragging a color or typing) when committed. */
  function change(changes: Partial<PageTheme>, isFinal: boolean) {
    setHistory((currentHistory) => {
      const started = beginEdit(currentHistory, current)
      return isFinal ? commitEdit(started, { ...current, ...changes }) : started
    })
    updateAppearance(changes)
  }

  return {
    appFont,
    editorFont,
    backgroundColor,
    textColor,
    textStyles,
    tabTitle,
    backgroundBlur,
    backgroundOpacity,
    /**
     * Changes one text style. Picks are one undo step each; a color drag
     * (isFinal false) becomes one step when committed.
     */
    changeTextStyle(
      name: TextStyleName,
      changes: Partial<TextStyleSettings>,
      isFinal = true,
    ) {
      const nextStyles = {
        ...textStyles,
        [name]: { ...textStyles[name], ...changes },
      }
      change({ textStyles: nextStyles }, isFinal)
    },
    /** A font pick (app or entries) is one undo step on its own. */
    changeFonts(fonts: Partial<Pick<PageTheme, 'appFont' | 'editorFont'>>) {
      change(fonts, true)
    },
    /** Changing the background also picks a matching default text color. */
    changeBackground(nextBackgroundColor: string) {
      change(
        {
          backgroundColor: nextBackgroundColor,
          textColor: deriveCozyTextColor(nextBackgroundColor),
        },
        false,
      )
    },
    changeText(nextTextColor: string) {
      change({ textColor: nextTextColor }, false)
    },
    /** Typing shows in the tab at once; it becomes one undo step when committed (e.g. on leaving the field). */
    changeTabTitle(nextTabTitle: string) {
      change({ tabTitle: nextTabTitle }, false)
    },
    /** Each blur or opacity step (a press or a typed value) is one undo step. */
    changeBackgroundEffects(
      effects: Partial<Pick<PageTheme, 'backgroundBlur' | 'backgroundOpacity'>>,
    ) {
      change(effects, true)
    },
    /** One text style back to its defaults, as one undo step. */
    resetTextStyle(name: TextStyleName) {
      change(
        { textStyles: { ...textStyles, [name]: DEFAULT_TEXT_STYLES[name] } },
        true,
      )
    },
    /** Editor back to its defaults: every text style, and the editor font matching the app's. */
    resetEditor() {
      change({ editorFont: appFont, textStyles: DEFAULT_TEXT_STYLES }, true)
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
