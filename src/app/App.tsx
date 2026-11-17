import { PanelLeft } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
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
  BackgroundMediaLayer,
  useBackgroundMedia,
  EditorSettings,
  TextStyleEditButton,
  ThemeHistoryButtons,
  SpacingMenu,
  useAppearance,
  usePageTheme,
} from '../features/appearance'
import {
  documentToMarkdown,
  FormattingButtons,
  JournalPage,
  MARKUP_FORMATTING_ACTIONS,
  TEXT_FORMATTING_ACTIONS,
  TextCasePicker,
  TextFontMenu,
  useActiveEditor,
  TextColorPicker,
  TextGlowPicker,
  TextLetterSpacingPicker,
  TextStyleMenu,
  useJournalEditor,
  useTextStyleBlocks,
} from '../features/editor'
import {
  EntryList,
  type Journal,
  EntryTitleField,
  EntryMenu,
  DataSettings,
  ExportDialog,
  SaveFailedDialog,
  useJournalState,
  useEntryTransfer,
  useTitleEditor,
  useFileShortcuts,
  ImportFilePicker,
} from '../features/entries'
import {
  PrivacyNotice,
  usePrivacyNotice,
  useRememberVisit,
} from '../features/privacy'
import { SettingsDrawer, useSettingsTransfer } from '../features/settings'
import styles from './App.module.css'

/** The opposite of App.module.css's narrow-screen query, so exactly one of them matches at any width. */
const WIDE_SCREEN_QUERY = '(width >= 48rem)'

type AppProps = {
  /** Opened before the app renders, with the open entry's writing loaded (see main.tsx). */
  journal: Journal
}

export function App({ journal }: AppProps) {
  const { appearance, updateAppearance, resetAppearance } = useAppearance()
  const pageTheme = usePageTheme(appearance, updateAppearance)
  const privacyNotice = usePrivacyNotice()
  useRememberVisit()
  // The entry awaiting delete confirmation, from the page's menu or a list row's.
  const [entryIdToDelete, setEntryIdToDelete] = useState<string | null>(null)
  const {
    editorFont,
    margins,
    lineSpacing,
    hasParagraphSpacing,
    hasParagraphIndent,
    textColor,
    customTextColors,
  } = appearance
  // Custom colors are shared by the text color menus (toolbar and text styles).
  const changeCustomTextColors = (colors: (string | null)[]) =>
    updateAppearance({ customTextColors: colors })
  // The app follows only which entry is open and the sort, never the writing (see Journal).
  const openEntry = useJournalState(journal, (state) => state.openEntry)
  const sort = useJournalState(journal, (state) => state.sort)
  const editor = useJournalEditor({
    entryId: openEntry.id,
    initialContent: openEntry.initialContent,
    onChange: journal.updateEntryContent,
  })
  const titleEditor = useTitleEditor({
    journal,
    entryId: openEntry.id,
    onContinue: () => {
      // Focus right away (Tiptap's focus waits a frame), so the next keystroke lands in the writing.
      editor.view.focus()
      editor.commands.focus('start')
    },
  })
  // The toolbar styles whichever was typed in last: the writing or the title.
  const activeEditor = useActiveEditor(editor, titleEditor)
  // What the toolbar's text controls need to show a text style's values where the text has none.
  const textStyleContext = {
    isTitle: activeEditor === titleEditor,
    textStyles: pageTheme.textStyles,
  }
  useTextStyleBlocks(editor, pageTheme.textStyles, false)
  useTextStyleBlocks(titleEditor, pageTheme.textStyles, true)
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null)
  const dismissToast = useCallback(() => setToastMessage(null), [])
  const backgroundMedia = useBackgroundMedia(setToastMessage)
  const {
    copyEntryAsMarkdown,
    exportEntry,
    exportAllEntries,
    exportAllAsMarkdown,
    importEntries,
  } = useEntryTransfer({
    getEntry: journal.getEntry,
    getAllEntries: journal.getAllEntries,
    contentToMarkdown: (content, header) =>
      documentToMarkdown(editor, content, header),
    addEntries: journal.addEntries,
    onStatus: setToastMessage,
  })
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isResetSettingsOpen, setIsResetSettingsOpen] = useState(false)

  /** Every look back to a first visit's: settings, their undo history and the background file. */
  function resetSettings() {
    resetAppearance()
    pageTheme.clearHistory()
    backgroundMedia.remove()
    setIsResetSettingsOpen(false)
    setToastMessage({ text: 'Settings reset.', tone: 'neutral' })
  }
  const importFilePickerRef = useRef<HTMLInputElement>(null)
  const openImportPicker = () => importFilePickerRef.current?.click()
  useFileShortcuts({
    exportEntry: () => exportEntry(journal.getState().openEntry.id),
    openExport: () => setIsExportOpen(true),
    openImport: openImportPicker,
  })
  const settingsTransfer = useSettingsTransfer({
    settings: { appearance, entrySort: sort },
    onImport: ({ appearance: importedAppearance, entrySort }) => {
      if (importedAppearance) updateAppearance(importedAppearance)
      if (entrySort) journal.setSort(entrySort)
    },
    onStatus: setToastMessage,
  })

  /** One import for everything: settings files apply settings; journal backups add entries, and apply any settings saved with them. */
  async function importFile(file: File) {
    if (!(await settingsTransfer.importIfSettings(file)))
      await importEntries(file, settingsTransfer.importAttachedSettings)
  }
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia(WIDE_SCREEN_QUERY).matches,
  )

  function closeSidebarOnNarrowScreens() {
    if (!window.matchMedia(WIDE_SCREEN_QUERY).matches) setIsSidebarOpen(false)
  }

  /** The same ⋯ menu for the open entry (page header) and each entry in the list. Actions read the entry when clicked. */
  function renderEntryMenu(entryId: string, label?: string) {
    return (
      <EntryMenu
        label={label}
        onCopyMarkdown={() => copyEntryAsMarkdown(entryId)}
        onExport={() => exportEntry(entryId)}
        onChooseImportFile={openImportPicker}
        onDelete={() => setEntryIdToDelete(entryId)}
      />
    )
  }

  return (
    <div className={styles.layout} data-sidebar-open={isSidebarOpen}>
      {backgroundMedia.media && (
        <BackgroundMediaLayer
          {...backgroundMedia.media}
          blur={pageTheme.backgroundBlur}
        />
      )}
      {isSidebarOpen && (
        <aside
          id="entries-sidebar"
          className={styles.sidebar}
          onKeyDown={({ key }) => {
            if (key === 'Escape') closeSidebarOnNarrowScreens()
          }}
        >
          <EntryList
            journal={journal}
            onEntryOpened={closeSidebarOnNarrowScreens}
            onStatus={setToastMessage}
            entryActions={(entryId, title) =>
              renderEntryMenu(entryId, `Actions for ${title ?? 'Untitled'}`)
            }
          />
          <SettingsDrawer
            headerActions={<ThemeHistoryButtons pageTheme={pageTheme} />}
            sections={[
              {
                id: 'app',
                title: 'App',
                content: (
                  <AppSettings
                    pageTheme={pageTheme}
                    backgroundMedia={backgroundMedia}
                  />
                ),
              },
              {
                id: 'editor',
                title: 'Editor',
                content: <EditorSettings pageTheme={pageTheme} />,
              },
              {
                id: 'data',
                title: 'Data',
                content: (
                  <DataSettings
                    onExport={() => setIsExportOpen(true)}
                    onChooseImportFile={openImportPicker}
                    onShowAbout={privacyNotice.open}
                    onResetSettings={() => setIsResetSettingsOpen(true)}
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
            plainWhenExpanded
            aria-label="Entries"
            title="Entries"
            aria-expanded={isSidebarOpen}
            aria-controls="entries-sidebar"
            onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
          >
            <PanelLeft aria-hidden="true" />
          </Button>

          {/*
           * Text, then markup, then page. Text goes from the broadest choice in: paragraph style,
           * font, color, emphasis, then the finer touches (glow, case, letter spacing). Text
           * styles in settings follow the same order.
           */}
          <div className={styles.toolbar}>
            <div role="group" aria-label="Text" className={styles.toolbarGroup}>
              <TextStyleMenu
                editor={activeEditor}
                isTitle={activeEditor === titleEditor}
                renderStyleEdit={(name) => (
                  <TextStyleEditButton
                    name={name}
                    pageTheme={pageTheme}
                    customTextColors={customTextColors}
                    onCustomTextColorsChange={changeCustomTextColors}
                  />
                )}
              />
              <TextFontMenu
                editor={activeEditor}
                editorFont={editorFont}
                {...textStyleContext}
              />
              <TextColorPicker
                editor={activeEditor}
                pageTextColor={textColor}
                customTextColors={customTextColors}
                onCustomTextColorsChange={changeCustomTextColors}
                {...textStyleContext}
              />
              <FormattingButtons
                editor={activeEditor}
                actions={TEXT_FORMATTING_ACTIONS}
              />
              <TextGlowPicker
                editor={activeEditor}
                pageTextColor={textColor}
                customTextColors={customTextColors}
                onCustomTextColorsChange={changeCustomTextColors}
                {...textStyleContext}
              />
              <TextCasePicker editor={activeEditor} {...textStyleContext} />
              <TextLetterSpacingPicker
                editor={activeEditor}
                {...textStyleContext}
              />
            </div>
            <Divider />
            <div
              role="group"
              aria-label="Markup"
              className={styles.toolbarGroup}
            >
              <FormattingButtons
                editor={activeEditor}
                actions={MARKUP_FORMATTING_ACTIONS}
              />
            </div>
            <Divider />
            <div role="group" aria-label="Page" className={styles.toolbarGroup}>
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
          </div>

          <div className={styles.headerActions}>
            {renderEntryMenu(openEntry.id)}
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
      <ImportFilePicker ref={importFilePickerRef} onImport={importFile} />
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExportJournal={({ includesSettings }) =>
          exportAllEntries(
            includesSettings ? settingsTransfer.getSettingsRecord() : undefined,
          )
        }
        onExportMarkdown={exportAllAsMarkdown}
        onExportSettings={settingsTransfer.exportSettings}
      />
      <SaveFailedDialog
        onExportAll={() => exportAllEntries()}
        onExportAllAsMarkdown={exportAllAsMarkdown}
        onExportSettings={settingsTransfer.exportSettings}
        onStatus={setToastMessage}
      />
      <ConfirmDialog
        isOpen={entryIdToDelete !== null}
        title="Delete this entry?"
        message="It’ll be gone for good. Export it first if you might want it back."
        confirmLabel="Delete"
        onConfirm={() => {
          if (entryIdToDelete)
            journal.deleteEntry(entryIdToDelete).catch(() =>
              setToastMessage({
                text: 'Couldn’t open the next entry.',
                tone: 'warning',
              }),
            )
          setEntryIdToDelete(null)
        }}
        onCancel={() => setEntryIdToDelete(null)}
      />
      <ConfirmDialog
        isOpen={isResetSettingsOpen}
        title="Reset settings?"
        message="Fonts, colors, text styles, spacing, the tab title and the background go back to how they were on your first visit. Your entries stay as they are. Export your settings first if you might want them back."
        confirmLabel="Reset settings"
        onConfirm={resetSettings}
        onCancel={() => setIsResetSettingsOpen(false)}
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
