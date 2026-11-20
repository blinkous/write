import { act, renderHook } from '@testing-library/react'
import {
  suggestBackgroundColors,
  suggestTextColors,
} from '../../lib/pageColorSuggestions'
import { DEFAULT_TEXT_STYLES } from '../../text-styles'
import { DEFAULT_APPEARANCE, type Appearance } from './appearanceOptions'
import { THEME_PACKS } from './themePacks'
import { usePageTheme } from './usePageTheme'

const appearance = {
  ...DEFAULT_APPEARANCE,
  backgroundColor: '#ede3d6',
  textColor: '#123456',
}

function renderPageTheme(changes: Partial<Appearance> = {}) {
  const updateAppearance = vi.fn()
  const { result } = renderHook(() =>
    usePageTheme({ ...appearance, ...changes }, updateAppearance),
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
    // Tests read as light mode: darker text and lighter pages first.
    expect(result.current.textColorSuggestions).toEqual(
      suggestTextColors('#ede3d6', 'darker', 7),
    )
    expect(result.current.backgroundColorSuggestions).toEqual(
      suggestBackgroundColors('#123456', 'lighter', 7),
    )
  })
})

describe('usePageTheme text style resets', () => {
  beforeEach(() => localStorage.clear())

  function getPack(id: string) {
    const pack = THEME_PACKS.find((themePack) => themePack.id === id)
    if (!pack) throw new Error(`No ${id} pack`)
    return pack
  }
  const blinkousStyles = getPack('blinkous').look.textStyles
  const editedStyles = {
    ...DEFAULT_TEXT_STYLES,
    title: { ...DEFAULT_TEXT_STYLES.title, color: '#00ff00' },
  }

  it('resets to the chosen theme pack’s styles, not the app’s defaults', () => {
    const { result, updateAppearance } = renderPageTheme({
      themeTextStyles: blinkousStyles,
      textStyles: editedStyles,
    })
    expect(result.current.canResetTextStyles).toBe(true)
    act(() => result.current.resetTextStyles())
    expect(updateAppearance).toHaveBeenCalledWith({
      textStyles: blinkousStyles,
    })
  })

  it('resets one style to the chosen theme pack’s', () => {
    const { result, updateAppearance } = renderPageTheme({
      themeTextStyles: blinkousStyles,
      textStyles: { ...blinkousStyles, body: editedStyles.title },
    })
    expect(result.current.canResetTextStyle('title')).toBe(false)
    expect(result.current.canResetTextStyle('body')).toBe(true)
    act(() => result.current.resetTextStyle('body'))
    expect(updateAppearance).toHaveBeenCalledWith({
      textStyles: blinkousStyles,
    })
  })

  it('has nothing to reset while the styles are the theme’s', () => {
    const { result } = renderPageTheme({
      themeTextStyles: blinkousStyles,
      textStyles: blinkousStyles,
    })
    expect(result.current.canResetTextStyles).toBe(false)
  })

  it('makes a copy of a chosen pack’s styles what resets go back to, in the same undo step', () => {
    const { result, updateAppearance } = renderPageTheme()
    const unicorn = getPack('unicorn')
    act(() =>
      result.current.applyThemeLook({
        ...unicorn.look,
        backgroundFileId: null,
      }),
    )
    expect(updateAppearance).toHaveBeenCalledWith(
      expect.objectContaining({
        themeTextStyles: unicorn.look.textStyles,
      }),
    )
    expect(result.current.canUndo).toBe(true)
  })
})
