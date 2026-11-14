import { IDBFactory } from 'fake-indexeddb'

/** Swaps in a fresh, empty IndexedDB, so each test starts with no databases. */
export function resetIndexedDb(): void {
  vi.stubGlobal('indexedDB', new IDBFactory())
}
