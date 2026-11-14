import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './design-system'
import { App } from './app/App'
import { JournalUnavailable, openEntryStore } from './features/entries'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Missing #root element')

// Entries load (from IndexedDB) before the first render, so the app never shows a loading state.
const content = await openEntryStore().then(
  (entryStore) => <App entryStore={entryStore} />,
  () => <JournalUnavailable />,
)

createRoot(rootElement).render(<StrictMode>{content}</StrictMode>)
