import { createJournalEntry } from './journalEntry'
import { applyEntryWrite, combineEntryWrites } from './pendingEntryWrites'

const monday = { ...createJournalEntry(), title: 'Monday' }

describe('pendingEntryWrites', () => {
  it('combines changes into what came before', () => {
    const put = combineEntryWrites(
      { kind: 'put', entry: monday },
      { kind: 'update', changes: { title: 'Renamed' } },
    )
    expect(applyEntryWrite(null, put)).toEqual({ ...monday, title: 'Renamed' })
    const updates = combineEntryWrites(
      { kind: 'update', changes: { title: 'Renamed' } },
      { kind: 'update', changes: { updatedAt: 'later' } },
    )
    expect(applyEntryWrite(monday, updates)).toEqual({
      ...monday,
      title: 'Renamed',
      updatedAt: 'later',
    })
  })

  it('keeps a deleted entry deleted, until it’s put back', () => {
    const deleted = combineEntryWrites(
      { kind: 'delete' },
      { kind: 'update', changes: { title: 'Late' } },
    )
    expect(applyEntryWrite(monday, deleted)).toBeNull()
    expect(
      applyEntryWrite(
        null,
        combineEntryWrites(deleted, { kind: 'put', entry: monday }),
      ),
    ).toBe(monday)
  })

  it('changes nothing for an entry that isn’t stored', () => {
    expect(
      applyEntryWrite(null, { kind: 'update', changes: { title: 'Lost' } }),
    ).toBeNull()
  })
})
