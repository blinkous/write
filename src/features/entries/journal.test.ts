import { act, renderHook } from '@testing-library/react'
import { createJournal, useJournalState } from './journal'
import type { EntryStore } from './entryStore'
import { createJournalEntry, type JournalEntry } from './journalEntry'

const SELECTED_ENTRY_KEY = 'write.selectedEntryId.v1'

function createEntryStore(storedEntries: JournalEntry[] = []): EntryStore {
  return { storedEntries, saveEntries: vi.fn() }
}

const monday = { ...createJournalEntry(), title: 'Monday' }
const words = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
})

describe('journal', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts from the stored entries, or a first entry when there are none', () => {
    expect(
      createJournal({ entryStore: createEntryStore([monday]) }).getState()
        .entries,
    ).toEqual([monday])
    const welcome = { ...createJournalEntry(), title: 'Welcome' }
    const entryStore = createEntryStore()
    const journal = createJournal({
      entryStore,
      createFirstEntry: () => welcome,
    })
    expect(journal.getSelectedEntry()).toBe(welcome)
    expect(entryStore.saveEntries).toHaveBeenCalledWith([welcome])
  })

  it('saves every change, and which entry is open', () => {
    const entryStore = createEntryStore([monday])
    const journal = createJournal({ entryStore })
    journal.renameEntry(monday.id, 'Tuesday')
    expect(entryStore.saveEntries).toHaveBeenLastCalledWith([
      expect.objectContaining({ title: 'Tuesday' }),
    ])
    journal.createEntry()
    expect(window.localStorage.getItem(SELECTED_ENTRY_KEY)).toBe(
      JSON.stringify(journal.getSelectedEntry().id),
    )
  })

  it('gives actions the current content', () => {
    const journal = createJournal({ entryStore: createEntryStore([monday]) })
    journal.updateEntryContent(monday.id, words('Rainy'))
    expect(journal.getEntry(monday.id).content).toEqual(words('Rainy'))
  })

  it('re-renders a component only when the part it shows changes', () => {
    const journal = createJournal({ entryStore: createEntryStore([monday]) })
    let renders = 0
    const { result } = renderHook(() => {
      renders += 1
      return useJournalState(journal, ({ selectedEntryId }) => selectedEntryId)
    })
    const rendersBefore = renders
    act(() => journal.updateEntryContent(monday.id, words('Typing')))
    expect(renders).toBe(rendersBefore)
    act(() => journal.createEntry())
    expect(result.current).toBe(journal.getSelectedEntry().id)
    expect(renders).toBe(rendersBefore + 1)
  })

  it('tells no one when nothing changed', () => {
    const journal = createJournal({ entryStore: createEntryStore([monday]) })
    const listener = vi.fn()
    journal.subscribe(listener)
    journal.selectEntry('missing')
    expect(listener).not.toHaveBeenCalled()
  })
})
