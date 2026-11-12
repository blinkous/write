export type PageColors = { backgroundColor: string; textColor: string }

/** Undo steps kept; older ones are dropped. */
export const PAGE_COLOR_HISTORY_LIMIT = 50

/**
 * Undo/redo for page colors. An "edit" spans everything from the first change
 * until it's committed (e.g. one whole drag in a color picker), so it undoes
 * as one step.
 */
export type PageColorHistory = {
  past: PageColors[]
  future: PageColors[]
  /** Colors before the edit in progress, or null if none is in progress. */
  editStart: PageColors | null
}

export const EMPTY_PAGE_COLOR_HISTORY: PageColorHistory = {
  past: [],
  future: [],
  editStart: null,
}

function isSameColors(first: PageColors, second: PageColors): boolean {
  return (
    first.backgroundColor === second.backgroundColor &&
    first.textColor === second.textColor
  )
}

/** Call before applying a change; remembers where the edit started. */
export function beginEdit(
  history: PageColorHistory,
  current: PageColors,
): PageColorHistory {
  return history.editStart ? history : { ...history, editStart: current }
}

/** Ends the edit in progress, recording it as one undo step if anything changed. */
export function commitEdit(
  history: PageColorHistory,
  current: PageColors,
): PageColorHistory {
  const { editStart } = history
  if (!editStart) return history
  if (isSameColors(editStart, current)) return { ...history, editStart: null }
  return {
    past: [...history.past, editStart].slice(-PAGE_COLOR_HISTORY_LIMIT),
    future: [],
    editStart: null,
  }
}

type HistoryStep = { history: PageColorHistory; colors: PageColors }

export function undoPageColors(
  history: PageColorHistory,
  current: PageColors,
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
    colors: previous,
  }
}

export function redoPageColors(
  history: PageColorHistory,
  current: PageColors,
): HistoryStep | null {
  const committed = commitEdit(history, current)
  // A fresh edit clears redo, so only redo when nothing new was committed.
  if (committed.future.length === 0) return null
  const [next, ...remainingFuture] = committed.future
  return {
    history: {
      past: [...committed.past, current].slice(-PAGE_COLOR_HISTORY_LIMIT),
      future: remainingFuture,
      editStart: null,
    },
    colors: next,
  }
}
