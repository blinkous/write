import { act, renderHook } from '@testing-library/react'
import { resetShortcutsShown, setShortcutsShown } from './shortcutVisibility'
import { useShownShortcuts } from './useShortcuts'

afterEach(resetShortcutsShown)

describe('useShownShortcuts', () => {
  it('shows none while shortcuts are hidden, and follows the switch', () => {
    const { result } = renderHook(() => useShownShortcuts())
    expect(result.current('bold')).toBe('Mod-b')
    act(() => setShortcutsShown(false))
    expect(result.current('bold')).toBeNull()
  })
})
