import type { FontValue } from '../../fonts'
import type { TextStyles } from '../../text-styles'

/**
 * The settings that share one undo/redo: fonts, colors, text styles, the tab
 * title and the background's blur, opacity and video playback. The background file itself
 * isn't kept, so choosing or removing one isn't undoable.
 */
export type PageTheme = {
  appFont: FontValue
  editorFont: FontValue
  textStyles: TextStyles
  backgroundColor: string
  textColor: string
  tabTitle: string
  backgroundBlur: number
  backgroundOpacity: number
  isBackgroundVideoPaused: boolean
  backgroundVideoSpeed: number
}

/** Undo steps kept; older ones are dropped. */
export const PAGE_THEME_HISTORY_LIMIT = 50

/**
 * Undo/redo for the page theme. An "edit" spans everything from the first change
 * until it's committed (e.g. one whole drag in a color picker), so it undoes
 * as one step.
 */
export type PageThemeHistory = {
  past: PageTheme[]
  future: PageTheme[]
  /** Settings before the edit in progress, or null if none is in progress. */
  editStart: PageTheme | null
}

export const EMPTY_PAGE_THEME_HISTORY: PageThemeHistory = {
  past: [],
  future: [],
  editStart: null,
}

function isSameTheme(first: PageTheme, second: PageTheme): boolean {
  return (
    first.appFont === second.appFont &&
    first.editorFont === second.editorFont &&
    first.backgroundColor === second.backgroundColor &&
    first.textColor === second.textColor &&
    first.tabTitle === second.tabTitle &&
    first.backgroundBlur === second.backgroundBlur &&
    first.backgroundOpacity === second.backgroundOpacity &&
    first.isBackgroundVideoPaused === second.isBackgroundVideoPaused &&
    first.backgroundVideoSpeed === second.backgroundVideoSpeed &&
    JSON.stringify(first.textStyles) === JSON.stringify(second.textStyles)
  )
}

/** Call before applying a change; remembers where the edit started. */
export function beginEdit(
  history: PageThemeHistory,
  current: PageTheme,
): PageThemeHistory {
  return history.editStart ? history : { ...history, editStart: current }
}

/** Ends the edit in progress, recording it as one undo step if anything changed. */
export function commitEdit(
  history: PageThemeHistory,
  current: PageTheme,
): PageThemeHistory {
  const { editStart } = history
  if (!editStart) return history
  if (isSameTheme(editStart, current)) return { ...history, editStart: null }
  return {
    past: [...history.past, editStart].slice(-PAGE_THEME_HISTORY_LIMIT),
    future: [],
    editStart: null,
  }
}

type HistoryStep = { history: PageThemeHistory; theme: PageTheme }

export function undoPageTheme(
  history: PageThemeHistory,
  current: PageTheme,
): HistoryStep | null {
  const { past, future } = commitEdit(history, current)
  const previous = past.at(-1)
  if (!previous) return null
  return {
    history: {
      past: past.slice(0, -1),
      future: [current, ...future],
      editStart: null,
    },
    theme: previous,
  }
}

export function redoPageTheme(
  history: PageThemeHistory,
  current: PageTheme,
): HistoryStep | null {
  const committed = commitEdit(history, current)
  // A fresh edit clears redo, so only redo when nothing new was committed.
  if (committed.future.length === 0) return null
  const [next, ...remainingFuture] = committed.future
  return {
    history: {
      past: [...committed.past, current].slice(-PAGE_THEME_HISTORY_LIMIT),
      future: remainingFuture,
      editStart: null,
    },
    theme: next,
  }
}
