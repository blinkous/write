import { act, renderHook } from '@testing-library/react'
import { useFirstVisit } from './useFirstVisit'
import { usePrivacyNotice } from './usePrivacyNotice'
import { getWelcomeEntry } from './welcomeEntry'
import { parseDocument } from '../../journal-document'

describe('usePrivacyNotice', () => {
  it('stays closed until opened from About', () => {
    const { result } = renderHook(() => usePrivacyNotice())
    expect(result.current.isOpen).toBe(false)
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)
  })
})

describe('useFirstVisit', () => {
  beforeEach(() => window.localStorage.clear())

  it('is true once per browser', () => {
    expect(renderHook(() => useFirstVisit()).result.current).toBe(true)
    expect(renderHook(() => useFirstVisit()).result.current).toBe(false)
  })

  it('treats visitors who saw the old welcome dialog as returning', () => {
    window.localStorage.setItem('write.privacyNoticeSeen.v1', 'true')
    expect(renderHook(() => useFirstVisit()).result.current).toBe(false)
  })
})

describe('getWelcomeEntry', () => {
  it('is a valid journal document', () => {
    expect(parseDocument(getWelcomeEntry().content)).not.toBeNull()
  })
})
