import { act, renderHook } from '@testing-library/react'
import { useThemeHistoryKeys } from './useThemeHistoryKeys'

function renderHistoryKeys(canUndo: boolean, canRedo: boolean) {
  const undo = vi.fn()
  const redo = vi.fn()
  const { result } = renderHook(() =>
    useThemeHistoryKeys({ canUndo, canRedo, undo, redo }),
  )
  return { result, undo, redo }
}

describe('useThemeHistoryKeys', () => {
  it('undoes and flashes the undo button each time', () => {
    const { result, undo } = renderHistoryKeys(true, false)
    act(() => result.current.undo())
    act(() => result.current.undo())
    expect(undo).toHaveBeenCalledTimes(2)
    expect(result.current.flashCounts).toEqual({ undo: 2, redo: 0 })
  })

  it('does nothing, and flashes nothing, with nothing to redo', () => {
    const { result, redo } = renderHistoryKeys(true, false)
    act(() => result.current.redo())
    expect(redo).not.toHaveBeenCalled()
    expect(result.current.flashCounts).toEqual({ undo: 0, redo: 0 })
  })
})
