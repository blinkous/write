import { PAGE_COLOR_HISTORY_LIMIT } from './pageColorHistory'
import {
  loadPageColorHistory,
  savePageColorHistory,
} from './pageColorHistoryStorage'

const STORAGE_KEY = 'write.pageColorHistory.v1'
const colors = (backgroundColor: string) => ({
  backgroundColor,
  textColor: '#111111',
})

describe('page color history storage', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts empty', () => {
    expect(loadPageColorHistory()).toEqual({
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
    savePageColorHistory(history)
    expect(loadPageColorHistory()).toEqual(history)
  })

  it('drops unreadable steps but keeps the rest', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        past: [colors('#aaaaaa'), { backgroundColor: 'red' }],
        future: 'nope',
      }),
    )
    expect(loadPageColorHistory()).toEqual({
      past: [colors('#aaaaaa')],
      future: [],
      editStart: null,
    })
  })

  it(`keeps at most ${PAGE_COLOR_HISTORY_LIMIT} steps`, () => {
    const manySteps = Array.from({ length: 80 }, (_, index) =>
      colors(`#0000${index.toString(16).padStart(2, '0')}`),
    )
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ past: manySteps, future: [] }),
    )
    const { past } = loadPageColorHistory()
    expect(past).toHaveLength(PAGE_COLOR_HISTORY_LIMIT)
    expect(past.at(-1)).toEqual(manySteps.at(-1))
  })
})
