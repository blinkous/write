import { loadEntries, saveEntries } from './entriesStorage'

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
    expect(loadEntries()).toEqual([
      { ...savedBeforeTitles, title: null, titleContent: null },
    ])
  })

  const formatOneEntry = {
    id: 'titled-by-heading',
    createdAt: '2026-11-02T09:00:00.000Z',
    updatedAt: '2026-11-02T09:00:00.000Z',
    title: null,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Sunday' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Morning' }],
        },
      ],
    },
  }

  it('migrates v1 entries once, leaving the v1 copy untouched as a backup', () => {
    const storedFormatOne = JSON.stringify([formatOneEntry])
    window.localStorage.setItem('write.entries.v1', storedFormatOne)
    const [migrated] = loadEntries()
    expect(migrated.title).toBe('Sunday')
    expect(migrated.content.content?.[0].attrs?.level).toBe(3)
    saveEntries([migrated])
    expect(window.localStorage.getItem('write.entries.v1')).toBe(
      storedFormatOne,
    )
    expect(
      JSON.parse(window.localStorage.getItem('write.entries.v2') ?? '[]'),
    ).toHaveLength(1)
  })

  it('reads only v2 once it exists, so migration never runs twice', () => {
    window.localStorage.setItem(
      'write.entries.v1',
      JSON.stringify([formatOneEntry]),
    )
    window.localStorage.setItem('write.entries.v2', JSON.stringify([]))
    expect(loadEntries()).toEqual([])
  })
})
