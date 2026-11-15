import { reportSaveResult } from '../../lib/saveStatus'
import { parseStoredEntry, type EntryDatabase } from './entryDatabase'
import type { EntryStore } from './entryStore'
import type { EntryChanges, EntrySummary, JournalEntry } from './journalEntry'
import {
  applyEntryWrite,
  combineEntryWrites,
  type PendingEntryWrite,
} from './pendingEntryWrites'

/**
 * Entries kept in IndexedDB, written one entry at a time as they change.
 *
 * Changes are written straight away, one transaction at a time; changes made
 * meanwhile are combined and written next. A change stays pending until its
 * write is confirmed, and every read applies what's pending, so a read always
 * sees the latest writing, even after a failed write. A failed write is
 * reported (lib/saveStatus) and written again with the next change; saving
 * counts as working again once that write succeeds.
 */
export function createDatabaseEntryStore(
  database: EntryDatabase,
  storedSummaries: EntrySummary[],
): EntryStore {
  const pendingWrites = new Map<string, PendingEntryWrite>()
  let isWriting = false

  function queueWrite(entryId: string, write: PendingEntryWrite) {
    pendingWrites.set(
      entryId,
      combineEntryWrites(pendingWrites.get(entryId), write),
    )
    void writePending()
  }

  async function writePending() {
    if (isWriting || pendingWrites.size === 0) return
    isWriting = true
    const writes = new Map(pendingWrites)
    try {
      await writeEntries(database, writes)
      // Done with, unless changed again while being written.
      for (const [entryId, write] of writes)
        if (pendingWrites.get(entryId) === write) pendingWrites.delete(entryId)
      reportSaveResult('entries', true)
    } catch {
      reportSaveResult('entries', false)
      return
    } finally {
      isWriting = false
    }
    void writePending()
  }

  return {
    storedSummaries,
    async getEntry(entryId) {
      const pendingWrite = pendingWrites.get(entryId)
      // A whole entry or a removal needs nothing from the database.
      if (pendingWrite && pendingWrite.kind !== 'update')
        return applyEntryWrite(null, pendingWrite)
      const record = await database.get('entry', entryId)
      // Read again after the wait: writes still pending then aren't in the record.
      return applyEntryWrite(
        parseStoredEntry(record),
        pendingWrites.get(entryId),
      )
    },
    async getAllEntries() {
      const records = await database.getAll('entry')
      const storedEntries = new Map<string, JournalEntry>()
      for (const record of records) {
        const entry = parseStoredEntry(record)
        if (entry) storedEntries.set(entry.id, entry)
      }
      const entryIds = new Set([
        ...storedEntries.keys(),
        ...pendingWrites.keys(),
      ])
      return [...entryIds].flatMap((entryId) => {
        const entry = applyEntryWrite(
          storedEntries.get(entryId) ?? null,
          pendingWrites.get(entryId),
        )
        return entry ? [entry] : []
      })
    },
    putEntries(entries) {
      for (const entry of entries) queueWrite(entry.id, { kind: 'put', entry })
    },
    updateEntry(entryId: string, changes: EntryChanges) {
      queueWrite(entryId, { kind: 'update', changes })
    },
    deleteEntry(entryId) {
      queueWrite(entryId, { kind: 'delete' })
    },
  }
}

/** Writes them all in one transaction: all saved, or none. */
async function writeEntries(
  database: EntryDatabase,
  writes: ReadonlyMap<string, PendingEntryWrite>,
): Promise<void> {
  const transaction = database.transaction('entry', 'readwrite')
  const { store } = transaction
  async function write(entryId: string, pendingWrite: PendingEntryWrite) {
    if (pendingWrite.kind === 'delete') return store.delete(entryId)
    const storedEntry =
      pendingWrite.kind === 'update'
        ? parseStoredEntry(await store.get(entryId))
        : null
    const entry = applyEntryWrite(storedEntry, pendingWrite)
    if (entry) await store.put(entry)
  }
  await Promise.all([
    ...[...writes].map(([entryId, pendingWrite]) =>
      write(entryId, pendingWrite),
    ),
    transaction.done,
  ])
}
