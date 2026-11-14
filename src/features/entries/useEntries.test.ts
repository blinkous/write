import { act, renderHook } from '@testing-library/react'
import { getSaveFailure } from '../../lib/saveStatus'
import { useEntries } from './useEntries'

const ENTRIES_KEY = 'write.entries.v2'

/** Makes saving entries fail (as when storage is full) while `isFull` is true. */
function simulateFullStorage() {
  const state = { isFull: true }
  const setItem = Storage.prototype.setItem
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
    this: Storage,
    key: string,
    value: string,
  ) {
    if (state.isFull && key === ENTRIES_KEY)
      throw new DOMException('Full', 'QuotaExceededError')
    setItem.call(this, key, value)
  })
  return state
}

type Entries = { current: ReturnType<typeof useEntries> }

/** A change to the writing that has to be saved: the open entry gets a new title. */
function retitle(result: Entries, title: string) {
  act(() => result.current.renameEntry(result.current.selectedEntry, title))
}

describe('useEntries saving', () => {
  // Each test reports its saves to the app-wide save status.
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('reports saves working', () => {
    const { result } = renderHook(() => useEntries())
    retitle(result, 'Monday')
    expect(getSaveFailure()).toBeNull()
  })

  it('reports when saves fail, and when they work again', () => {
    const storage = simulateFullStorage()
    const { result } = renderHook(() => useEntries())
    retitle(result, 'Monday')
    expect(getSaveFailure()).not.toBeNull()

    storage.isFull = false
    retitle(result, 'Tuesday')
    expect(getSaveFailure()).toBeNull()
    expect(window.localStorage.getItem(ENTRIES_KEY)).toContain('Tuesday')
  })
})
