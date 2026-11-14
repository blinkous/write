import { act, renderHook } from '@testing-library/react'
import type { EntryStore } from './entryStore'
import { createJournalEntry, type JournalEntry } from './journalEntry'
import { useEntries } from './useEntries'

function createEntryStore(storedEntries: JournalEntry[] = []): EntryStore {
  return { storedEntries, saveEntries: vi.fn() }
}

describe('useEntries', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts from the stored entries', () => {
    const storedEntry = { ...createJournalEntry(), title: 'Monday' }
    const { result } = renderHook(() =>
      useEntries({ entryStore: createEntryStore([storedEntry]) }),
    )
    expect(result.current.entries).toEqual([storedEntry])
  })

  it('saves every change through the entry store', () => {
    const entryStore = createEntryStore()
    const { result } = renderHook(() => useEntries({ entryStore }))
    act(() =>
      result.current.renameEntry(result.current.selectedEntry, 'Tuesday'),
    )
    expect(entryStore.saveEntries).toHaveBeenLastCalledWith([
      expect.objectContaining({ title: 'Tuesday' }),
    ])
  })
})
