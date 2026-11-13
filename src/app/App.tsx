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
  MarginsMenu,
  ColorSettings,
  FontSettings,
  ThemeHistoryButtons,
  SpacingMenu,
  useAppearance,
  usePageTheme,
} from '../features/appearance'
import {
  copyEditorMarkdown,
  documentToMarkdown,
  FormattingToolbar,
  JournalPage,
  TextCasePicker,
  TextFontMenu,
  useActiveEditor,
  TextColorPicker,
  TextStyleMenu,
  useJournalEditor,
} from '../features/editor'
import {
  createJournalEntry,
  EntryList,
  EntryTitleField,
  EntryMenu,
  DataSettings,
  useEntries,
  useEntryTransfer,
  useTitleEditor,
  useExportShortcuts,
} from '../features/entries'
import {
  getWelcomeEntry,
  PrivacyNotice,
  useFirstVisit,
  usePrivacyNotice,
} from '../features/privacy'
import { SettingsDrawer } from '../features/settings'
import styles from './App.module.css'

const WIDE_SCREEN_QUERY = '(min-width: 48rem)'

export function App() {
  const { appearance, updateAppearance } = useAppearance()
  const pageTheme = usePageTheme(appearance, updateAppearance)
  const privacyNotice = usePrivacyNotice()
  const isFirstVisit = useFirstVisit()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const {
    editorFont,
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
    sort,
    setSort,
    createEntry,
    selectEntry,
    updateEntryContent,
    renameEntry,
    setEntryTitle,
    addEntries,
    deleteEntry,
  } = useEntries({
    // A first visit starts with the welcome entry instead of a blank page.
    createFirstEntry: isFirstVisit
      ? () => ({ ...createJournalEntry(), ...getWelcomeEntry() })
      : undefined,
  })
  const editor = useJournalEditor({
    entryId: selectedEntry.id,
    initialContent: selectedEntry.content,
    onChange: updateEntryContent,
  })
  const titleEditor = useTitleEditor({
    entry: selectedEntry,
    onChange: setEntryTitle,
    onContinue: () => {
      // Focus right away (Tiptap's focus waits a frame), so the next keystroke lands in the writing.
      editor.view.focus()
      editor.commands.focus('start')
    },
  })
  // The toolbar styles whichever was typed in last: the writing or the title.
  const activeEditor = useActiveEditor(editor, titleEditor)
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
  useExportShortcuts({
    exportEntry: () => exportEntry(selectedEntry),
    exportAllEntries,
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
            sort={sort}
            onSortChange={setSort}
          />
          <SettingsDrawer
            headerActions={<ThemeHistoryButtons pageTheme={pageTheme} />}
            sections={[
              {
                id: 'fonts',
                title: 'Fonts',
                content: <FontSettings pageTheme={pageTheme} />,
              },
              {
                id: 'colors',
                title: 'Colors',
                content: <ColorSettings pageTheme={pageTheme} />,
              },
              {
                id: 'data',
                title: 'Data',
                content: (
                  <DataSettings
                    onExportAll={exportAllEntries}
                    onExportAllAsMarkdown={exportAllAsMarkdown}
                    onImport={importEntries}
                    onShowAbout={privacyNotice.open}
                  />
                ),
              },
            ]}
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
              <TextFontMenu editor={activeEditor} editorFont={editorFont} />
              <TextStyleMenu editor={activeEditor} />
              <TextColorPicker
                editor={activeEditor}
                pageTextColor={textColor}
                customTextColors={customTextColors}
                onCustomTextColorsChange={(colors) =>
                  updateAppearance({ customTextColors: colors })
                }
              />
              <TextCasePicker editor={activeEditor} />
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
            <FormattingToolbar editor={activeEditor} />
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
          {/* The page's top heading, for screen reader navigation. */}
          <h1 className="visually-hidden">Write</h1>
          <JournalPage
            editor={editor}
            header={<EntryTitleField editor={titleEditor} />}
          />
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
          // "Write away!": back to the entry, ready to type.
          editor.commands.focus()
        }}
      />
    </div>
  )
}
