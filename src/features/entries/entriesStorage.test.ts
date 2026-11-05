import { loadEntries } from './entriesStorage'

describe('loadEntries', () => {
  beforeEach(() => window.localStorage.clear())

  it('loads entries saved before titles existed, without a title', () => {
    const savedBeforeTitles = {
      id: 'old-entry',
      createdAt: '2026-11-01T09:00:00.000Z',
      updatedAt: '2026-11-01T09:00:00.000Z',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    }
    window.localStorage.setItem(
      'write.entries.v1',
      JSON.stringify([savedBeforeTitles]),
    )
    expect(loadEntries()).toEqual([{ ...savedBeforeTitles, title: null }])
  })
})
