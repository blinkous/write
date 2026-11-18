import { act, renderHook } from '@testing-library/react'
import { createMemoryEntryStore } from './entryStore'
import type { EntrySort } from './entrySort'
import { openJournal } from './journal'
import {
  createJournalEntry,
  getEntryTitle,
  type JournalEntry,
} from './journalEntry'
import { useEntrySummary, useJournalState } from './useJournalState'

const SELECTED_ENTRY_KEY = 'write.selectedEntryId.v1'
const SORT_KEY = 'write.entrySort.v1'

const words = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
})

function createWrittenEntry(text: string, createdAt: string): JournalEntry {
  return { ...createJournalEntry(new Date(createdAt)), content: words(text) }
}

const olderEntry = createWrittenEntry('older', '2026-01-01T00:00:00.000Z')
const newerEntry = createWrittenEntry('newer', '2026-02-01T00:00:00.000Z')

function openTestJournal(
  entries: JournalEntry[] = [olderEntry, newerEntry],
  {
    selectedEntryId,
    sort,
  }: { selectedEntryId?: string; sort?: EntrySort } = {},
) {
  if (selectedEntryId)
    window.localStorage.setItem(
      SELECTED_ENTRY_KEY,
      JSON.stringify(selectedEntryId),
    )
  if (sort) window.localStorage.setItem(SORT_KEY, JSON.stringify(sort))
  const save = vi.fn<(entries: JournalEntry[]) => void>()
  const entryStore = createMemoryEntryStore(entries, save)
  return openJournal({ entryStore }).then((journal) => ({
    journal,
    entryStore,
    save,
  }))
}

describe('journal', () => {
  beforeEach(() => window.localStorage.clear())

  it('opens newest first, with the newest entry open, when nothing valid was selected', async () => {
    const { journal } = await openTestJournal()
    expect(journal.getState().entryIds).toEqual([newerEntry.id, olderEntry.id])
    expect(journal.getState().openEntry).toEqual({
      id: newerEntry.id,
      initialContent: newerEntry.content,
    })
  })

  it('reopens the entry selected last time', async () => {
    const { journal } = await openTestJournal(undefined, {
      selectedEntryId: olderEntry.id,
    })
    expect(journal.getState().openEntry.id).toBe(olderEntry.id)
  })

  it('starts an empty journal with a blank entry, and saves it', async () => {
    const entryStore = createMemoryEntryStore([])
    const journal = await openJournal({ entryStore })
    const savedEntries = await entryStore.getAllEntries()
    expect(savedEntries).toHaveLength(1)
    expect(savedEntries[0]).toMatchObject({
      id: journal.getState().openEntry.id,
      title: null,
    })
  })

  it('saves writing to its entry, which actions then read', async () => {
    const { journal } = await openTestJournal()
    journal.updateEntryContent(olderEntry.id, words('Rainy'))
    expect((await journal.getEntry(olderEntry.id)).content).toEqual(
      words('Rainy'),
    )
    expect(journal.getSummary(olderEntry.id)?.firstLine).toBe('Rainy')
  })

  it('opens a selected entry once its writing has loaded', async () => {
    const { journal } = await openTestJournal()
    const opening = journal.selectEntry(olderEntry.id)
    expect(journal.getState().selectedEntryId).toBe(olderEntry.id)
    await opening
    expect(journal.getState().openEntry.id).toBe(olderEntry.id)
    expect(window.localStorage.getItem(SELECTED_ENTRY_KEY)).toBe(
      JSON.stringify(olderEntry.id),
    )
  })

  it('goes back to the open entry when a selected one can’t be read', async () => {
    const { journal, entryStore } = await openTestJournal()
    vi.spyOn(entryStore, 'getEntry').mockRejectedValueOnce(new Error('broken'))
    await expect(journal.selectEntry(olderEntry.id)).rejects.toThrow()
    expect(journal.getState().selectedEntryId).toBe(newerEntry.id)
  })

  it('creates and opens a new entry, reusing a blank one instead of adding another', async () => {
    const { journal } = await openTestJournal()
    await journal.createEntry()
    const { openEntry, entryIds } = journal.getState()
    expect(entryIds).toHaveLength(3)
    await journal.selectEntry(olderEntry.id)
    await journal.createEntry()
    expect(journal.getState().entryIds).toHaveLength(3)
    expect(journal.getState().openEntry.id).toBe(openEntry.id)
  })

  it('opens the entry that moves into a deleted one’s place', async () => {
    const { journal } = await openTestJournal()
    await journal.deleteEntry(newerEntry.id)
    expect(journal.getState().entryIds).toEqual([olderEntry.id])
    expect(journal.getState().openEntry.id).toBe(olderEntry.id)
    expect(await journal.getAllEntries()).toEqual([olderEntry])
  })

  it('replaces the last entry with a blank one when it’s deleted', async () => {
    const { journal } = await openTestJournal([olderEntry])
    await journal.deleteEntry(olderEntry.id)
    const [replacement] = await journal.getAllEntries()
    expect(replacement).toMatchObject({ title: null })
    expect(journal.getState().openEntry.id).toBe(replacement.id)
  })

  it('adds entries in order and opens the newest one added', async () => {
    const { journal } = await openTestJournal([olderEntry])
    journal.addEntries([newerEntry])
    expect(journal.getState().entryIds).toEqual([newerEntry.id, olderEntry.id])
    expect(journal.getState().openEntry.id).toBe(newerEntry.id)
    journal.addEntries([])
    expect(journal.getState().openEntry.id).toBe(newerEntry.id)
  })

  it('renames only when the name changes', async () => {
    const { journal, save } = await openTestJournal()
    journal.renameEntry(olderEntry.id, 'Winter')
    expect(journal.getSummary(olderEntry.id)?.title).toBe('Winter')
    expect((await journal.getEntry(olderEntry.id)).title).toBe('Winter')
    save.mockClear()
    journal.renameEntry(olderEntry.id, 'Winter')
    expect(save).not.toHaveBeenCalled()
  })

  it('keeps entries in the chosen order as they change', async () => {
    const { journal } = await openTestJournal(undefined, {
      sort: 'last-edited',
    })
    journal.updateEntryContent(olderEntry.id, words('edited'))
    expect(journal.getState().entryIds[0]).toBe(olderEntry.id)
    journal.setSort('newest')
    expect(journal.getState().entryIds).toEqual([newerEntry.id, olderEntry.id])
    expect(window.localStorage.getItem(SORT_KEY)).toBe(JSON.stringify('newest'))
  })

  it('reads every entry in the list’s order', async () => {
    const { journal } = await openTestJournal()
    expect((await journal.getAllEntries()).map(({ id }) => id)).toEqual([
      newerEntry.id,
      olderEntry.id,
    ])
  })

  it('re-renders only what shows the part that changed', async () => {
    const { journal } = await openTestJournal()
    const renders = { list: 0, olderRow: 0, newerRow: 0 }
    renderHook(() => {
      renders.list += 1
      return useJournalState(journal, (state) => state.entryIds)
    })
    renderHook(() => {
      renders.olderRow += 1
      return useEntrySummary(journal, olderEntry.id, getEntryTitle)
    })
    renderHook(() => {
      renders.newerRow += 1
      return useEntrySummary(journal, newerEntry.id, getEntryTitle)
    })
    const before = { ...renders }
    const firstLineKept = {
      type: 'doc',
      content: [...words('older').content, ...words('More writing').content],
    }
    act(() => journal.updateEntryContent(olderEntry.id, firstLineKept))
    expect(renders).toEqual(before)
    act(() => journal.renameEntry(olderEntry.id, 'Winter'))
    expect(renders).toEqual({ ...before, olderRow: before.olderRow + 1 })
  })
})
