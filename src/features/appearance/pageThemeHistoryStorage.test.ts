import { PAGE_THEME_HISTORY_LIMIT } from './pageThemeHistory'
import {
  loadPageThemeHistory,
  savePageThemeHistory,
} from './pageThemeHistoryStorage'

const CURRENT_FONTS = { appFont: 'inter', editorFont: 'lora' } as const
const STORAGE_KEY = 'write.pageThemeHistory.v1'
const colors = (backgroundColor: string) => ({
  appFont: 'inter' as const,
  editorFont: 'lora' as const,
  backgroundColor,
  textColor: '#111111',
})

describe('page theme history storage', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts empty', () => {
    expect(loadPageThemeHistory(CURRENT_FONTS)).toEqual({
      past: [],
      future: [],
      editStart: null,
    })
  })

  it('survives a refresh', () => {
    const history = {
      past: [colors('#aaaaaa')],
      future: [colors('#bbbbbb')],
      editStart: null,
    }
    savePageThemeHistory(history)
    expect(loadPageThemeHistory(CURRENT_FONTS)).toEqual(history)
  })

  it('drops unreadable steps but keeps the rest', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        past: [colors('#aaaaaa'), { backgroundColor: 'red' }],
        future: 'nope',
      }),
    )
    expect(loadPageThemeHistory(CURRENT_FONTS)).toEqual({
      past: [colors('#aaaaaa')],
      future: [],
      editStart: null,
    })
  })

  it(`keeps at most ${PAGE_THEME_HISTORY_LIMIT} steps`, () => {
    const manySteps = Array.from({ length: 80 }, (_, index) =>
      colors(`#0000${index.toString(16).padStart(2, '0')}`),
    )
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ past: manySteps, future: [] }),
    )
    const { past } = loadPageThemeHistory(CURRENT_FONTS)
    expect(past).toHaveLength(PAGE_THEME_HISTORY_LIMIT)
    expect(past.at(-1)).toEqual(manySteps.at(-1))
  })

  it('migrates color-only history once, giving old steps the current fonts', () => {
    const colorOnly = { backgroundColor: '#aaaaaa', textColor: '#111111' }
    const storedColorHistory = JSON.stringify({ past: [colorOnly], future: [] })
    window.localStorage.setItem('write.pageColorHistory.v1', storedColorHistory)
    const history = loadPageThemeHistory({
      appFont: 'inter',
      editorFont: 'literata',
    })
    expect(history.past).toEqual([
      { ...colorOnly, appFont: 'inter', editorFont: 'literata' },
    ])
    savePageThemeHistory(history)
    // The old history stays as a backup and isn't read again.
    expect(window.localStorage.getItem('write.pageColorHistory.v1')).toBe(
      storedColorHistory,
    )
    expect(loadPageThemeHistory(CURRENT_FONTS).past).toEqual([
      { ...colorOnly, appFont: 'inter', editorFont: 'literata' },
    ])
  })

  it('reads a step saved with one font as the entries font', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        past: [
          { font: 'nunito', backgroundColor: '#aaaaaa', textColor: '#111111' },
        ],
        future: [],
      }),
    )
    expect(loadPageThemeHistory(CURRENT_FONTS).past[0]).toMatchObject({
      appFont: 'inter',
      editorFont: 'nunito',
    })
  })
})
