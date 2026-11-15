import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './design-system'
import { App } from './app/App'
import {
  createJournalEntry,
  JournalUnavailable,
  openEntryStore,
  openJournal,
} from './features/entries'
import { getWelcomeEntry, isFirstVisit } from './features/privacy'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Missing #root element')

/*
 * The journal opens (from IndexedDB, with the open entry's writing) before the
 * first render, so the app never shows a loading state. A first visit starts
 * with the welcome entry instead of a blank page.
 */
const firstVisit = isFirstVisit()
const content = await openEntryStore()
  .then((entryStore) =>
    openJournal({
      entryStore,
      createFirstEntry: firstVisit
        ? () => ({ ...createJournalEntry(), ...getWelcomeEntry() })
        : undefined,
    }),
  )
  .then(
    (journal) => <App journal={journal} />,
    () => <JournalUnavailable />,
  )

createRoot(rootElement).render(<StrictMode>{content}</StrictMode>)
