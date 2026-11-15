import { act, renderHook } from '@testing-library/react'
import { isFirstVisit, useRememberVisit } from './firstVisit'
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

describe('isFirstVisit', () => {
  beforeEach(() => window.localStorage.clear())

  it('is true until the visit is remembered', () => {
    expect(isFirstVisit()).toBe(true)
    renderHook(() => useRememberVisit())
    expect(isFirstVisit()).toBe(false)
  })

  it('treats visitors who saw the old welcome dialog as returning', () => {
    window.localStorage.setItem('write.privacyNoticeSeen.v1', 'true')
    expect(isFirstVisit()).toBe(false)
  })
})

describe('getWelcomeEntry', () => {
  it('is a valid journal document', () => {
    expect(parseDocument(getWelcomeEntry().content)).not.toBeNull()
  })
})
