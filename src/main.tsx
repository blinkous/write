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
import {
  FramedNotice,
  getWelcomeEntry,
  isFirstVisit,
  isFramed,
} from './features/privacy'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Missing #root element')

/*
 * Framed by another page, the app shows only a notice and never opens the
 * journal, so nothing in it can be clicked through a disguise (clickjacking).
 *
 * Otherwise the journal opens (from IndexedDB, with the open entry's writing)
 * before the first render, so the app never shows a loading state. A first
 * visit starts with the welcome entry instead of a blank page.
 */
async function openApp() {
  const firstVisit = isFirstVisit()
  return openEntryStore()
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
}

const content = isFramed() ? <FramedNotice /> : await openApp()

createRoot(rootElement).render(<StrictMode>{content}</StrictMode>)
