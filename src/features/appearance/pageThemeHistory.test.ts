import { DEFAULT_TEXT_STYLES } from '../../text-styles'
import {
  beginEdit,
  commitEdit,
  EMPTY_PAGE_THEME_HISTORY,
  PAGE_THEME_HISTORY_LIMIT,
  redoPageTheme,
  undoPageTheme,
  type PageThemeHistory,
  type PageTheme,
} from './pageThemeHistory'

const colors = (backgroundColor: string): PageTheme => ({
  appFont: 'inter',
  editorFont: 'lora',
  textStyles: DEFAULT_TEXT_STYLES,
  themeTextStyles: DEFAULT_TEXT_STYLES,
  backgroundColor,
  textColor: '#111111',
  tabTitle: '',
  backgroundBlur: 0,
  backgroundOpacity: 50,
  isBackgroundVideoPaused: false,
  backgroundVideoSpeed: 1,
  backgroundFileId: null,
})

/** One committed edit from `from` to `to`, like a finished drag in the picker. */
function edit(history: PageThemeHistory, from: PageTheme, to: PageTheme) {
  return commitEdit(beginEdit(history, from), to)
}

describe('page theme history', () => {
  it('records a whole edit as one undo step and redoes it', () => {
    let history = beginEdit(EMPTY_PAGE_THEME_HISTORY, colors('#aaaaaa'))
    history = beginEdit(history, colors('#bbbbbb')) // mid-drag: still the same edit
    history = commitEdit(history, colors('#cccccc'))
    const undone = undoPageTheme(history, colors('#cccccc'))
    expect(undone?.theme).toEqual(colors('#aaaaaa'))
    const redone = undone && redoPageTheme(undone.history, undone.theme)
    expect(redone?.theme).toEqual(colors('#cccccc'))
  })

  it('does not record an edit that changed nothing', () => {
    const history = edit(
      EMPTY_PAGE_THEME_HISTORY,
      colors('#aaaaaa'),
      colors('#aaaaaa'),
    )
    expect(history.past).toEqual([])
  })

  it(`keeps only the last ${PAGE_THEME_HISTORY_LIMIT} steps`, () => {
    let history = EMPTY_PAGE_THEME_HISTORY
    for (let step = 0; step < PAGE_THEME_HISTORY_LIMIT + 5; step++) {
      history = edit(
        history,
        colors(`#0000${step.toString(16).padStart(2, '0')}`),
        colors('#ffffff'),
      )
    }
    expect(history.past).toHaveLength(PAGE_THEME_HISTORY_LIMIT)
    // The five oldest steps were dropped
    expect(history.past[0]).toEqual(colors('#000005'))
  })

  it('clears redo after a new change', () => {
    let history = edit(
      EMPTY_PAGE_THEME_HISTORY,
      colors('#aaaaaa'),
      colors('#bbbbbb'),
    )
    const undone = undoPageTheme(history, colors('#bbbbbb'))
    history = edit(
      undone?.history ?? history,
      colors('#aaaaaa'),
      colors('#dddddd'),
    )
    expect(redoPageTheme(history, colors('#dddddd'))).toBeNull()
  })

  it('undoes an edit still in progress', () => {
    const history = beginEdit(EMPTY_PAGE_THEME_HISTORY, colors('#aaaaaa'))
    expect(undoPageTheme(history, colors('#bbbbbb'))?.theme).toEqual(
      colors('#aaaaaa'),
    )
  })

  it('has nothing to undo or redo at first', () => {
    expect(
      undoPageTheme(EMPTY_PAGE_THEME_HISTORY, colors('#aaaaaa')),
    ).toBeNull()
    expect(
      redoPageTheme(EMPTY_PAGE_THEME_HISTORY, colors('#aaaaaa')),
    ).toBeNull()
  })

  it('undoes a font change like a color change', () => {
    const before = colors('#aaaaaa')
    const after = { ...before, editorFont: 'nunito' as const }
    const undone = undoPageTheme(
      edit(EMPTY_PAGE_THEME_HISTORY, before, after),
      after,
    )
    expect(undone?.theme.editorFont).toBe('lora')
  })

  it.each([
    ['tab title', { tabTitle: 'Notes' }],
    ['background blur', { backgroundBlur: 0.2 }],
    ['background opacity', { backgroundOpacity: 70 }],
    ['background video pause', { isBackgroundVideoPaused: true }],
    ['background video speed', { backgroundVideoSpeed: 1.5 }],
  ])('undoes a %s change', (_name, changes) => {
    const before = colors('#aaaaaa')
    const after = { ...before, ...changes }
    const undone = undoPageTheme(
      edit(EMPTY_PAGE_THEME_HISTORY, before, after),
      after,
    )
    expect(undone?.theme).toEqual(before)
  })
})
