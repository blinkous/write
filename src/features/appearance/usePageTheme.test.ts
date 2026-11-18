import { act, renderHook } from '@testing-library/react'
import {
  deriveCozyBackgroundColors,
  deriveCozyTextColors,
} from '../../lib/cozyPalette'
import { DEFAULT_APPEARANCE } from './appearanceOptions'
import { usePageTheme } from './usePageTheme'

const appearance = {
  ...DEFAULT_APPEARANCE,
  backgroundColor: '#ede3d6',
  textColor: '#123456',
}

function renderPageTheme() {
  const updateAppearance = vi.fn()
  const { result } = renderHook(() =>
    usePageTheme(appearance, updateAppearance),
  )
  return { result, updateAppearance }
}

describe('usePageTheme colors', () => {
  beforeEach(() => localStorage.clear())

  it('changes only the background when the background changes', () => {
    const { result, updateAppearance } = renderPageTheme()
    act(() => result.current.changeBackground('#6e2340'))
    expect(updateAppearance).toHaveBeenCalledWith({
      backgroundColor: '#6e2340',
    })
  })

  it('makes a suggested text color one undo step', () => {
    const { result, updateAppearance } = renderPageTheme()
    const [suggestion] = result.current.textColorSuggestions
    act(() => result.current.changeText(suggestion, true))
    expect(updateAppearance).toHaveBeenCalledWith({ textColor: suggestion })
    expect(result.current.canUndo).toBe(true)
  })

  it('suggests text colors for the background, and backgrounds for the text color', () => {
    const { result } = renderPageTheme()
    expect(result.current.textColorSuggestions).toEqual(
      deriveCozyTextColors('#ede3d6'),
    )
    expect(result.current.backgroundColorSuggestions).toEqual(
      deriveCozyBackgroundColors('#123456'),
    )
  })
})
