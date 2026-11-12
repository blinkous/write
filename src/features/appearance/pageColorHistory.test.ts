import {
  beginEdit,
  commitEdit,
  EMPTY_PAGE_COLOR_HISTORY,
  PAGE_COLOR_HISTORY_LIMIT,
  redoPageColors,
  undoPageColors,
  type PageColorHistory,
  type PageColors,
} from './pageColorHistory'

const colors = (backgroundColor: string): PageColors => ({
  backgroundColor,
  textColor: '#111111',
})

/** One committed edit from `from` to `to`, like a finished drag in the picker. */
function edit(history: PageColorHistory, from: PageColors, to: PageColors) {
  return commitEdit(beginEdit(history, from), to)
}

describe('page color history', () => {
  it('records a whole edit as one undo step and redoes it', () => {
    let history = beginEdit(EMPTY_PAGE_COLOR_HISTORY, colors('#aaaaaa'))
    history = beginEdit(history, colors('#bbbbbb')) // mid-drag: still the same edit
    history = commitEdit(history, colors('#cccccc'))
    const undone = undoPageColors(history, colors('#cccccc'))
    expect(undone?.colors).toEqual(colors('#aaaaaa'))
    const redone = undone && redoPageColors(undone.history, undone.colors)
    expect(redone?.colors).toEqual(colors('#cccccc'))
  })

  it('does not record an edit that changed nothing', () => {
    const history = edit(
      EMPTY_PAGE_COLOR_HISTORY,
      colors('#aaaaaa'),
      colors('#aaaaaa'),
    )
    expect(history.past).toEqual([])
  })

  it(`keeps only the last ${PAGE_COLOR_HISTORY_LIMIT} steps`, () => {
    let history = EMPTY_PAGE_COLOR_HISTORY
    for (let step = 0; step < PAGE_COLOR_HISTORY_LIMIT + 5; step++) {
      history = edit(
        history,
        colors(`#0000${step.toString(16).padStart(2, '0')}`),
        colors('#ffffff'),
      )
    }
    expect(history.past).toHaveLength(PAGE_COLOR_HISTORY_LIMIT)
    // The five oldest steps were dropped
    expect(history.past[0]).toEqual(colors('#000005'))
  })

  it('clears redo after a new change', () => {
    let history = edit(
      EMPTY_PAGE_COLOR_HISTORY,
      colors('#aaaaaa'),
      colors('#bbbbbb'),
    )
    const undone = undoPageColors(history, colors('#bbbbbb'))
    history = edit(
      undone?.history ?? history,
      colors('#aaaaaa'),
      colors('#dddddd'),
    )
    expect(redoPageColors(history, colors('#dddddd'))).toBeNull()
  })

  it('undoes an edit still in progress', () => {
    const history = beginEdit(EMPTY_PAGE_COLOR_HISTORY, colors('#aaaaaa'))
    expect(undoPageColors(history, colors('#bbbbbb'))?.colors).toEqual(
      colors('#aaaaaa'),
    )
  })

  it('has nothing to undo or redo at first', () => {
    expect(
      undoPageColors(EMPTY_PAGE_COLOR_HISTORY, colors('#aaaaaa')),
    ).toBeNull()
    expect(
      redoPageColors(EMPTY_PAGE_COLOR_HISTORY, colors('#aaaaaa')),
    ).toBeNull()
  })
})
