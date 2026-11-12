import { act, renderHook } from '@testing-library/react'
import { createJournalEntry } from './journalEntry'
import { useTitleEditor } from './useTitleEditor'

describe('useTitleEditor', () => {
  it('switches to another entry without using the destroyed editor', () => {
    const first = { ...createJournalEntry(), title: 'First' }
    const second = { ...createJournalEntry(), title: 'Second' }
    const { result, rerender } = renderHook(
      ({ entry }) =>
        useTitleEditor({ entry, onChange: () => {}, onContinue: () => {} }),
      { initialProps: { entry: first } },
    )
    expect(result.current.getText()).toBe('First')
    act(() => rerender({ entry: second }))
    expect(result.current.isDestroyed).toBe(false)
    expect(result.current.getText()).toBe('Second')
  })
})
