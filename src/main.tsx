import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import './design-system'
import { App } from './app/App'
import { AppCrashed } from './app/AppCrashed'
import {
  JournalUnavailable,
  openEntryStore,
  openJournal,
} from './features/entries'
import { FramedNotice, isFramed } from './features/privacy'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Missing #root element')

/*
 * Framed by another page, the app shows only a notice and never opens the
 * journal, so nothing in it can be clicked through a disguise (clickjacking).
 *
 * Otherwise the journal opens (from IndexedDB, with the open entry's writing)
 * before the first render, so the app never shows a loading state.
 */
async function openApp() {
  return openEntryStore()
    .then((entryStore) => openJournal({ entryStore }))
    .then(
      (journal) => <App journal={journal} />,
      () => <JournalUnavailable />,
    )
}

const content = isFramed() ? <FramedNotice /> : await openApp()

// A crash while drawing shows a message instead of a blank page.
createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={AppCrashed}>{content}</ErrorBoundary>
  </StrictMode>,
)
