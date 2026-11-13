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
  AppSettings,
  EditorSettings,
  ThemeHistoryButtons,
  SpacingMenu,
  useAppearance,
  usePageTheme,
} from '../features/appearance'
import {
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
  getEntryTitle,
  type JournalEntry,
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
import { SettingsDrawer, useSettingsTransfer } from '../features/settings'
import styles from './App.module.css'

const WIDE_SCREEN_QUERY = '(min-width: 48rem)'

export function App() {
  const { appearance, updateAppearance } = useAppearance()
  const pageTheme = usePageTheme(appearance, updateAppearance)
  const privacyNotice = usePrivacyNotice()
  const isFirstVisit = useFirstVisit()
  // The entry awaiting delete confirmation, from the page's menu or a list row's.
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null)
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
  const {
    copyEntryAsMarkdown,
    exportEntry,
    exportAllEntries,
    exportAllAsMarkdown,
    importEntries,
  } = useEntryTransfer({
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
  const settingsTransfer = useSettingsTransfer({
    settings: { appearance, entrySort: sort },
    onImport: ({ appearance: importedAppearance, entrySort }) => {
      if (importedAppearance) updateAppearance(importedAppearance)
      if (entrySort) setSort(entrySort)
    },
    onStatus: setToastMessage,
  })

  /** One import for everything: settings files apply settings, journal backups add entries. */
  async function importFile(file: File) {
    if (!(await settingsTransfer.importIfSettings(file)))
      await importEntries(file)
  }
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia(WIDE_SCREEN_QUERY).matches,
  )

  function closeSidebarOnNarrowScreens() {
    if (!window.matchMedia(WIDE_SCREEN_QUERY).matches) setIsSidebarOpen(false)
  }

  /** The same ⋯ menu for the open entry (page header) and each entry in the list. */
  function renderEntryMenu(entry: JournalEntry, label?: string) {
    return (
      <EntryMenu
        label={label}
        onCopyMarkdown={() => copyEntryAsMarkdown(entry)}
        onExport={() => exportEntry(entry)}
        onImport={importFile}
        onDelete={() => setEntryToDelete(entry)}
      />
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
            entryActions={(entry) =>
              renderEntryMenu(
                entry,
                `Actions for ${getEntryTitle(entry) ?? 'Untitled'}`,
              )
            }
          />
          <SettingsDrawer
            headerActions={<ThemeHistoryButtons pageTheme={pageTheme} />}
            sections={[
              {
                id: 'app',
                title: 'App',
                content: <AppSettings pageTheme={pageTheme} />,
              },
              {
                id: 'editor',
                title: 'Editor',
                content: (
                  <EditorSettings
                    pageTheme={pageTheme}
                    customTextColors={customTextColors}
                    onCustomTextColorsChange={(colors) =>
                      updateAppearance({ customTextColors: colors })
                    }
                  />
                ),
              },
              {
                id: 'data',
                title: 'Data',
                content: (
                  <DataSettings
                    onExportAll={exportAllEntries}
                    onExportAllAsMarkdown={exportAllAsMarkdown}
                    onExportSettings={settingsTransfer.exportSettings}
                    onImport={importFile}
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
            {renderEntryMenu(selectedEntry)}
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
        isOpen={entryToDelete !== null}
        title="Delete this entry?"
        message="It’ll be gone for good. Export it first if you might want it back."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => {
          if (entryToDelete) deleteEntry(entryToDelete.id)
          setEntryToDelete(null)
        }}
        onCancel={() => setEntryToDelete(null)}
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
