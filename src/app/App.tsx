import { PanelLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button, Divider, Toast, type ToastMessage } from '../design-system'
import {
  FontPicker,
  MarginsPicker,
  PageColorsPicker,
  SpacingPicker,
  TextSizePicker,
  useAppearance,
} from '../features/appearance'
import {
  CopyMarkdownButton,
  FormattingToolbar,
  JournalPage,
  TextCasePicker,
  TextColorPicker,
  useJournalEditor,
} from '../features/editor'
import {
  EntryList,
  EntryMenu,
  JournalMenu,
  useEntries,
  useEntryTransfer,
} from '../features/entries'
import styles from './App.module.css'

const WIDE_SCREEN_QUERY = '(min-width: 48rem)'

export function App() {
  const { appearance, updateAppearance } = useAppearance()
  const {
    font,
    textSize,
    margins,
    lineSpacing,
    paragraphSpacing,
    backgroundColor,
    textColor,
  } = appearance
  const {
    entries,
    selectedEntry,
    createEntry,
    selectEntry,
    updateEntryContent,
    renameEntry,
    addEntries,
    deleteEntry,
  } = useEntries()
  const editor = useJournalEditor({
    entryId: selectedEntry.id,
    initialContent: selectedEntry.content,
    onChange: updateEntryContent,
  })
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null)
  const dismissToast = useCallback(() => setToastMessage(null), [])
  const { exportEntry, exportAllEntries, importEntries } = useEntryTransfer({
    entries,
    addEntries,
    onStatus: setToastMessage,
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia(WIDE_SCREEN_QUERY).matches,
  )

  function closeSidebarOnNarrowScreens() {
    if (!window.matchMedia(WIDE_SCREEN_QUERY).matches) setIsSidebarOpen(false)
  }

  function confirmAndDeleteEntry() {
    if (window.confirm('Delete this entry? This can’t be undone.'))
      deleteEntry(selectedEntry.id)
  }

  return (
    <div className={styles.layout} data-sidebar-open={isSidebarOpen}>
      {isSidebarOpen && (
        <aside
          id="entries-sidebar"
          className={styles.sidebar}
          onKeyDown={({ key }) => {
            if (key === 'Escape') closeSidebarOnNarrowScreens()
          }}
        >
          <EntryList
            entries={entries}
            selectedEntryId={selectedEntry.id}
            onSelect={(entryId) => {
              selectEntry(entryId)
              closeSidebarOnNarrowScreens()
            }}
            onCreate={() => {
              createEntry()
              closeSidebarOnNarrowScreens()
            }}
            onRename={renameEntry}
            actions={
              <JournalMenu
                onExportAll={exportAllEntries}
                onImport={importEntries}
              />
            }
          />
        </aside>
      )}
      {isSidebarOpen && (
        // Pointer-only dismissal; keyboard users close with Escape or the toggle.
        <div
          className={styles.backdrop}
          aria-hidden="true"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={styles.workspace}>
        <header className={styles.header}>
          <Button
            iconOnly
            aria-label="Entries"
            title="Entries"
            aria-expanded={isSidebarOpen}
            aria-controls="entries-sidebar"
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
          >
            <PanelLeft aria-hidden="true" />
          </Button>

          <div className={styles.toolbar}>
            <div
              role="group"
              aria-label="Text and page style"
              className={styles.toolbarGroup}
            >
              <FontPicker
                font={font}
                onChange={(value) => updateAppearance({ font: value })}
              />
              <TextSizePicker
                textSize={textSize}
                onChange={(value) => updateAppearance({ textSize: value })}
              />
              <TextColorPicker editor={editor} pageTextColor={textColor} />
              <TextCasePicker editor={editor} />
              <PageColorsPicker
                backgroundColor={backgroundColor}
                textColor={textColor}
                onChange={updateAppearance}
              />
              <MarginsPicker
                margins={margins}
                onChange={(value) => updateAppearance({ margins: value })}
              />
              <SpacingPicker
                lineSpacing={lineSpacing}
                paragraphSpacing={paragraphSpacing}
                onChange={updateAppearance}
              />
            </div>
            <Divider />
            <FormattingToolbar editor={editor} />
          </div>

          <div className={styles.headerActions}>
            <CopyMarkdownButton editor={editor} />
            <EntryMenu
              onExport={() => exportEntry(selectedEntry)}
              onImport={importEntries}
              onDelete={confirmAndDeleteEntry}
            />
          </div>
        </header>

        <main className={styles.main}>
          <JournalPage editor={editor} />
        </main>
      </div>

      <Toast message={toastMessage} onDismiss={dismissToast} />
    </div>
  )
}
