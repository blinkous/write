import { act, renderHook } from '@testing-library/react'
import { usePrivacyNotice } from './usePrivacyNotice'

describe('usePrivacyNotice', () => {
  beforeEach(() => window.localStorage.clear())

  it('opens on a fresh browser, and not again once closed', () => {
    const { result } = renderHook(() => usePrivacyNotice())
    expect(result.current.isOpen).toBe(true)
    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)
    expect(renderHook(() => usePrivacyNotice()).result.current.isOpen).toBe(
      false,
    )
  })

  it('can be reopened any time', () => {
    window.localStorage.setItem('write.privacyNoticeSeen.v1', 'true')
    const { result } = renderHook(() => usePrivacyNotice())
    expect(result.current.isOpen).toBe(false)
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)
  })
})
