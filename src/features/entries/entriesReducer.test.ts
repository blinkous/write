import { createEntriesState, entriesReducer } from './entriesReducer'
import { createJournalEntry, type JournalEntry } from './journalEntry'

function createWrittenEntry(text: string, createdAt: string): JournalEntry {
  return {
    ...createJournalEntry(new Date(createdAt)),
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  }
}

const olderEntry = createWrittenEntry('older', '2026-01-01T00:00:00.000Z')
const newerEntry = createWrittenEntry('newer', '2026-02-01T00:00:00.000Z')

describe('createEntriesState', () => {
  it('sorts newest first and selects the newest when nothing valid is stored', () => {
    const state = createEntriesState(
      [olderEntry, newerEntry],
      'missing-id',
      createJournalEntry(),
    )
    expect(state.entries.map(({ id }) => id)).toEqual([
      newerEntry.id,
      olderEntry.id,
    ])
    expect(state.selectedEntryId).toBe(newerEntry.id)
  })

  it('starts with the fallback entry when the journal is empty', () => {
    const fallbackEntry = createJournalEntry()
    expect(createEntriesState([], null, fallbackEntry).entries).toEqual([
      fallbackEntry,
    ])
  })
})

describe('entriesReducer', () => {
  const state = createEntriesState(
    [olderEntry, newerEntry],
    olderEntry.id,
    createJournalEntry(),
  )

  it('creates and selects a new entry', () => {
    const newEntry = createJournalEntry(new Date('2026-03-01T00:00:00.000Z'))
    const nextState = entriesReducer(state, { type: 'create', newEntry })
    expect(nextState.entries[0]).toBe(newEntry)
    expect(nextState.selectedEntryId).toBe(newEntry.id)
  })

  it('reuses an existing blank entry instead of adding another', () => {
    const withBlank = entriesReducer(state, {
      type: 'create',
      newEntry: createJournalEntry(),
    })
    const afterSecondCreate = entriesReducer(withBlank, {
      type: 'create',
      newEntry: createJournalEntry(),
    })
    expect(afterSecondCreate.entries).toHaveLength(3)
    expect(afterSecondCreate.selectedEntryId).toBe(withBlank.selectedEntryId)
  })

  it('selects the neighbouring entry after deleting the selected one', () => {
    const nextState = entriesReducer(state, {
      type: 'delete',
      entryId: olderEntry.id,
      replacementEntry: createJournalEntry(),
    })
    expect(nextState.entries).toEqual([newerEntry])
    expect(nextState.selectedEntryId).toBe(newerEntry.id)
  })

  it('replaces the last entry with a blank one when it is deleted', () => {
    const singleState = createEntriesState(
      [olderEntry],
      olderEntry.id,
      createJournalEntry(),
    )
    const replacementEntry = createJournalEntry()
    const nextState = entriesReducer(singleState, {
      type: 'delete',
      entryId: olderEntry.id,
      replacementEntry,
    })
    expect(nextState).toEqual({
      entries: [replacementEntry],
      selectedEntryId: replacementEntry.id,
    })
  })
})

describe('entriesReducer add', () => {
  it('adds entries in order and opens the newest one added', () => {
    const state = createEntriesState(
      [olderEntry],
      olderEntry.id,
      createJournalEntry(),
    )
    const nextState = entriesReducer(state, {
      type: 'add',
      newEntries: [newerEntry],
    })
    expect(nextState.entries.map(({ id }) => id)).toEqual([
      newerEntry.id,
      olderEntry.id,
    ])
    expect(nextState.selectedEntryId).toBe(newerEntry.id)
  })

  it('leaves state untouched when nothing is added', () => {
    const state = createEntriesState(
      [olderEntry],
      olderEntry.id,
      createJournalEntry(),
    )
    expect(entriesReducer(state, { type: 'add', newEntries: [] })).toBe(state)
  })
})

describe('entriesReducer rename', () => {
  it('renames only the target entry and bumps its updatedAt', () => {
    const state = createEntriesState(
      [olderEntry, newerEntry],
      olderEntry.id,
      createJournalEntry(),
    )
    const nextState = entriesReducer(state, {
      type: 'rename',
      entryId: olderEntry.id,
      title: 'Winter',
      updatedAt: '2026-12-01T00:00:00.000Z',
    })
    const renamed = nextState.entries.find(({ id }) => id === olderEntry.id)
    expect(renamed).toMatchObject({
      title: 'Winter',
      updatedAt: '2026-12-01T00:00:00.000Z',
    })
    expect(nextState.entries.find(({ id }) => id === newerEntry.id)).toBe(
      newerEntry,
    )
  })

  it('is a no-op when the title is unchanged', () => {
    const state = createEntriesState(
      [olderEntry],
      olderEntry.id,
      createJournalEntry(),
    )
    const nextState = entriesReducer(state, {
      type: 'rename',
      entryId: olderEntry.id,
      title: null,
      updatedAt: '2026-12-01T00:00:00.000Z',
    })
    expect(nextState.entries[0]).toBe(olderEntry)
  })
})
