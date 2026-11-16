import { act, renderHook } from '@testing-library/react'
import {
  deriveCozyBackgroundColor,
  deriveCozyTextColor,
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

  it('matches the text color to the background when asked, as one undo step', () => {
    const { result, updateAppearance } = renderPageTheme()
    act(() => result.current.matchText())
    expect(updateAppearance).toHaveBeenCalledWith({
      textColor: deriveCozyTextColor('#ede3d6'),
    })
    expect(result.current.canUndo).toBe(true)
  })

  it('matches the background to the text color when asked, as one undo step', () => {
    const { result, updateAppearance } = renderPageTheme()
    act(() => result.current.matchBackground())
    expect(updateAppearance).toHaveBeenCalledWith({
      backgroundColor: deriveCozyBackgroundColor('#123456'),
    })
    expect(result.current.canUndo).toBe(true)
  })
})
