import { PanelLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import {
  Button,
  ConfirmDialog,
  Divider,
  Toast,
  type ToastMessage,
} from '../design-system'
import {
  FontPicker,
  MarginsMenu,
  PageColorsPicker,
  SpacingMenu,
  useAppearance,
  usePageColors,
} from '../features/appearance'
import {
  copyEditorMarkdown,
  documentToMarkdown,
  FormattingToolbar,
  JournalPage,
  TextCasePicker,
  TextColorPicker,
  TextStyleMenu,
  useJournalEditor,
} from '../features/editor'
import {
  EntryList,
  EntryMenu,
  JournalMenu,
  useEntries,
  useEntryTransfer,
} from '../features/entries'
import { PrivacyNotice, usePrivacyNotice } from '../features/privacy'
import styles from './App.module.css'

const WIDE_SCREEN_QUERY = '(min-width: 48rem)'

export function App() {
  const { appearance, updateAppearance } = useAppearance()
  const pageColors = usePageColors(appearance, updateAppearance)
  const privacyNotice = usePrivacyNotice()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const {
    font,
    margins,
    lineSpacing,
    hasParagraphSpacing,
    hasParagraphIndent,
    textColor,
    customTextColors,
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
  const { exportEntry, exportAllEntries, exportAllAsMarkdown, importEntries } =
    useEntryTransfer({
      entries,
      contentToMarkdown: (content, header) =>
        documentToMarkdown(editor, content, header),
      addEntries,
      onStatus: setToastMessage,
    })
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia(WIDE_SCREEN_QUERY).matches,
  )

  function closeSidebarOnNarrowScreens() {
    if (!window.matchMedia(WIDE_SCREEN_QUERY).matches) setIsSidebarOpen(false)
  }

  async function copyMarkdown() {
    // A custom entry name becomes the markdown title; a name taken from the first line doesn't.
    const didCopy = await copyEditorMarkdown(editor, selectedEntry.title)
    setToastMessage(
      didCopy
        ? { text: 'Copied as markdown.', tone: 'neutral' }
        : { text: 'Couldn’t copy to the clipboard.', tone: 'warning' },
    )
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
              <>
                <PageColorsPicker pageColors={pageColors} />
                <JournalMenu
                  onExportAll={exportAllEntries}
                  onExportAllAsMarkdown={exportAllAsMarkdown}
                  onImport={importEntries}
                  onShowAbout={privacyNotice.open}
                />
              </>
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
              <TextStyleMenu editor={editor} />
              <TextColorPicker
                editor={editor}
                pageTextColor={textColor}
                customTextColors={customTextColors}
                onCustomTextColorsChange={(colors) =>
                  updateAppearance({ customTextColors: colors })
                }
              />
              <TextCasePicker editor={editor} />
              <MarginsMenu
                value={margins}
                onChange={(value) => updateAppearance({ margins: value })}
              />
              <SpacingMenu
                lineSpacing={lineSpacing}
                hasParagraphSpacing={hasParagraphSpacing}
                hasParagraphIndent={hasParagraphIndent}
                onChange={updateAppearance}
              />
            </div>
            <Divider />
            <FormattingToolbar editor={editor} />
          </div>

          <div className={styles.headerActions}>
            <EntryMenu
              onCopyMarkdown={copyMarkdown}
              onExport={() => exportEntry(selectedEntry)}
              onImport={importEntries}
              onDelete={() => setIsConfirmingDelete(true)}
            />
          </div>
        </header>

        <main className={styles.main}>
          <JournalPage editor={editor} />
        </main>
      </div>

      <Toast message={toastMessage} onDismiss={dismissToast} />
      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Delete this entry?"
        message="It’ll be gone for good. Export it first if you might want it back."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => {
          deleteEntry(selectedEntry.id)
          setIsConfirmingDelete(false)
        }}
        onCancel={() => setIsConfirmingDelete(false)}
      />
      <PrivacyNotice
        isOpen={privacyNotice.isOpen}
        onClose={() => {
          privacyNotice.close()
          // "Let's write": land in the entry, ready to type.
          editor.commands.focus()
        }}
      />
    </div>
  )
}
