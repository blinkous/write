import { act, renderHook } from '@testing-library/react'
import { usePrivacyNotice } from './usePrivacyNotice'

describe('usePrivacyNotice', () => {
  it('stays closed until opened from About', () => {
    const { result } = renderHook(() => usePrivacyNotice())
    expect(result.current.isOpen).toBe(false)
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)
  })
})
