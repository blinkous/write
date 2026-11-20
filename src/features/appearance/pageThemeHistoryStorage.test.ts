import { DEFAULT_TEXT_STYLES } from '../../text-styles'
import { PAGE_THEME_HISTORY_LIMIT } from './pageThemeHistory'
import {
  loadPageThemeHistory,
  savePageThemeHistory,
} from './pageThemeHistoryStorage'

const CURRENT_SETTINGS = {
  appFont: 'inter',
  editorFont: 'lora',
  textStyles: DEFAULT_TEXT_STYLES,
  tabTitle: 'Notes',
  backgroundBlur: 2,
  backgroundOpacity: 60,
  isBackgroundVideoPaused: true,
  backgroundVideoSpeed: 0.5,
  hasSidebarBorder: false,
  backgroundFileId: 'current-file',
} as const
const STORAGE_KEY = 'write.pageThemeHistory.v1'
const colors = (backgroundColor: string) => ({
  appFont: 'inter' as const,
  editorFont: 'lora' as const,
  textStyles: DEFAULT_TEXT_STYLES,
  backgroundColor,
  textColor: '#111111',
  tabTitle: '',
  backgroundBlur: 0,
  backgroundOpacity: 50,
  isBackgroundVideoPaused: false,
  backgroundVideoSpeed: 1,
  hasSidebarBorder: true,
  backgroundFileId: null,
})

describe('page theme history storage', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts empty', () => {
    expect(loadPageThemeHistory(CURRENT_SETTINGS)).toEqual({
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
    expect(loadPageThemeHistory(CURRENT_SETTINGS)).toEqual(history)
  })

  it('drops unreadable steps but keeps the rest', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        past: [colors('#aaaaaa'), { backgroundColor: 'red' }],
        future: 'nope',
      }),
    )
    expect(loadPageThemeHistory(CURRENT_SETTINGS)).toEqual({
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
    const { past } = loadPageThemeHistory(CURRENT_SETTINGS)
    expect(past).toHaveLength(PAGE_THEME_HISTORY_LIMIT)
    expect(past.at(-1)).toEqual(manySteps.at(-1))
  })

  it('migrates color-only history once, giving old steps the current fonts', () => {
    const colorOnly = { backgroundColor: '#aaaaaa', textColor: '#111111' }
    const storedColorHistory = JSON.stringify({ past: [colorOnly], future: [] })
    window.localStorage.setItem('write.pageColorHistory.v1', storedColorHistory)
    const history = loadPageThemeHistory({
      ...CURRENT_SETTINGS,
      editorFont: 'literata',
    })
    expect(history.past).toEqual([
      { ...CURRENT_SETTINGS, ...colorOnly, editorFont: 'literata' },
    ])
    savePageThemeHistory(history)
    // The old history stays as a backup and isn't read again.
    expect(window.localStorage.getItem('write.pageColorHistory.v1')).toBe(
      storedColorHistory,
    )
    expect(loadPageThemeHistory(CURRENT_SETTINGS).past).toEqual([
      { ...CURRENT_SETTINGS, ...colorOnly, editorFont: 'literata' },
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
    expect(loadPageThemeHistory(CURRENT_SETTINGS).past[0]).toMatchObject({
      appFont: 'inter',
      editorFont: 'nunito',
    })
  })

  it('gives steps saved before or without a setting its current value', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        past: [
          {
            ...colors('#aaaaaa'),
            tabTitle: undefined,
            backgroundBlur: 99,
            isBackgroundVideoPaused: undefined,
            backgroundVideoSpeed: 9,
            hasSidebarBorder: undefined,
            backgroundFileId: undefined,
          },
        ],
        future: [],
      }),
    )
    expect(loadPageThemeHistory(CURRENT_SETTINGS).past[0]).toMatchObject({
      tabTitle: 'Notes',
      backgroundBlur: 2,
      backgroundOpacity: 50,
      isBackgroundVideoPaused: true,
      backgroundVideoSpeed: 0.5,
      hasSidebarBorder: false,
      backgroundFileId: 'current-file',
    })
  })
})
