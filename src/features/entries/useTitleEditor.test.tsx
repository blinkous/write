import { act, renderHook } from '@testing-library/react'
import { createJournal } from './journal'
import { createJournalEntry } from './journalEntry'
import { useTitleEditor } from './useTitleEditor'

describe('useTitleEditor', () => {
  beforeEach(() => window.localStorage.clear())

  const first = { ...createJournalEntry(), title: 'First' }
  const second = { ...createJournalEntry(), title: 'Second' }
  const createTestJournal = () =>
    createJournal({
      entryStore: { storedEntries: [first, second], saveEntries: vi.fn() },
    })

  it('switches to another entry without using the destroyed editor', () => {
    const journal = createTestJournal()
    const { result, rerender } = renderHook(
      ({ entryId }) =>
        useTitleEditor({ journal, entryId, onContinue: () => {} }),
      { initialProps: { entryId: first.id } },
    )
    expect(result.current.getText()).toBe('First')
    act(() => rerender({ entryId: second.id }))
    expect(result.current.isDestroyed).toBe(false)
    expect(result.current.getText()).toBe('Second')
  })

  it('shows a rename from the sidebar, and saves titles typed on the page', () => {
    const journal = createTestJournal()
    const { result } = renderHook(() =>
      useTitleEditor({ journal, entryId: first.id, onContinue: () => {} }),
    )
    act(() => journal.renameEntry(first.id, 'Renamed'))
    expect(result.current.getText()).toBe('Renamed')
    act(() => {
      result.current.commands.setContent('Typed')
    })
    expect(journal.getEntry(first.id).title).toBe('Typed')
  })
})
