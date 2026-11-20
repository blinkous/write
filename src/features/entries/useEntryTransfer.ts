import type { ToastMessage } from '../../design-system'
import {
  copyRichTextToClipboard,
  type RichClipboardContent,
} from '../../lib/clipboard'
import {
  describeSaveResult,
  saveFile,
  type SaveFileOptions,
} from '../../lib/saveFile'
import {
  describeImport,
  getEntryFileName,
  getJournalFileName,
  JOURNAL_FILE_MIME_TYPE,
  planImport,
  readEntriesFile,
  serializeEntries,
} from './entryTransfer'
import { readEntryImages, restoreEntryImages } from './entryImages'
import type { JournalEntry } from './journalEntry'
import {
  journalMarkdownExport,
  type ContentToMarkdown,
} from './journalMarkdown'

type UseEntryTransferOptions = {
  /** Read from storage when an action runs (see Journal). */
  getEntry: (entryId: string) => Promise<JournalEntry>
  getAllEntries: () => Promise<readonly JournalEntry[]>
  /** Turns entry content into markdown (provided by the editor, which owns the format). */
  contentToMarkdown: ContentToMarkdown
  /** Entry content to copy: markdown, and the same as HTML (also the editor's). */
  contentToClipboard: (
    ...args: Parameters<ContentToMarkdown>
  ) => RichClipboardContent
  addEntries: (newEntries: readonly JournalEntry[]) => void
  onStatus: (message: ToastMessage) => void
}

/**
 * Reads settings found in an imported journal file (opaque to entries):
 * null if there are none it can use; otherwise how to apply them and what to
 * tell the user. Applied only once the whole file has proved valid.
 */
export type AttachedSettingsImporter = (
  rawSettings: unknown,
) => { apply?: () => void; status: string } | null

/** The entries with the pictures they show (read once saving starts), so the file restores them whole. */
function jsonExport(
  entriesToExport: readonly JournalEntry[],
  suggestedName: string,
  settings?: unknown,
): SaveFileOptions {
  return {
    suggestedName,
    contents: async () =>
      serializeEntries(entriesToExport, {
        settings,
        images: await readEntryImages(entriesToExport),
      }),
    mimeType: JOURNAL_FILE_MIME_TYPE,
    description: 'Journal export',
    extension: '.json',
  }
}

/** Reading the journal failed (rather than saving the file). */
class JournalReadError extends Error {}

/** What to save, with any failure to read it told apart from failing to save. */
function readingAsJournal({
  contents,
  ...file
}: SaveFileOptions): SaveFileOptions {
  return {
    ...file,
    contents: async () => {
      try {
        return typeof contents === 'function' ? await contents() : contents
      } catch {
        throw new JournalReadError()
      }
    },
  }
}

export function useEntryTransfer({
  getEntry,
  getAllEntries,
  contentToMarkdown,
  contentToClipboard,
  addEntries,
  onStatus,
}: UseEntryTransferOptions) {
  const READ_FAILED: ToastMessage = {
    text: 'Couldn’t read the journal to export.',
    tone: 'warning',
  }

  /**
   * Called straight from the menu click: the save dialog needs a user action.
   * Reading the entries first is quick enough to still count as one; anything
   * slow (pictures) is read once the dialog is open (see SaveFileOptions).
   */
  async function saveExport(readFile: () => Promise<SaveFileOptions>) {
    let file
    try {
      file = readingAsJournal(await readFile())
    } catch {
      onStatus(READ_FAILED)
      return
    }
    try {
      const message = describeSaveResult(await saveFile(file))
      if (message) onStatus(message)
    } catch (error) {
      onStatus(
        error instanceof JournalReadError
          ? READ_FAILED
          : { text: 'Couldn’t save the file.', tone: 'warning' },
      )
    }
  }

  /** Copies markdown (with its HTML) and says whether it worked. */
  async function copyMarkdown(
    content: RichClipboardContent | Promise<RichClipboardContent>,
  ) {
    const didCopy = await copyRichTextToClipboard(content)
    onStatus(
      didCopy
        ? { text: 'Copied as markdown.', tone: 'neutral' }
        : { text: 'Couldn’t copy to the clipboard.', tone: 'warning' },
    )
  }

  return {
    /** Copies selected writing (null when there's none, which it says). */
    copySelectionAsMarkdown(selection: RichClipboardContent | null) {
      if (selection) return copyMarkdown(selection)
      onStatus({ text: 'Select some writing to copy.', tone: 'neutral' })
    },
    /** Copies the entry as markdown, under its name when it has a custom one. */
    copyEntryAsMarkdown: (entryId: string) =>
      copyMarkdown(
        getEntry(entryId).then(({ content, title }) =>
          contentToClipboard(content, { title }),
        ),
      ),
    exportEntry: (entryId: string) =>
      saveExport(async () => {
        const entry = await getEntry(entryId)
        return jsonExport([entry], getEntryFileName(entry))
      }),
    /** Every entry as JSON, with `settings` in the same file when given (see serializeEntries). */
    exportAllEntries: (settings?: unknown) =>
      saveExport(async () =>
        jsonExport(await getAllEntries(), getJournalFileName(), settings),
      ),
    exportAllAsMarkdown: () =>
      saveExport(async () =>
        journalMarkdownExport(await getAllEntries(), contentToMarkdown),
      ),

    /**
     * Accepts a single-entry or whole-journal export; both use the same
     * format. Settings saved in the file go to `importAttachedSettings`.
     */
    async importEntries(
      file: File,
      importAttachedSettings?: AttachedSettingsImporter,
    ) {
      const parseResult = await readEntriesFile(file)
      if (!parseResult.ok) {
        onStatus({
          text: `Couldn’t import: ${parseResult.reason}`,
          tone: 'warning',
        })
        return
      }
      let existingEntries
      try {
        existingEntries = await getAllEntries()
      } catch {
        onStatus({
          text: 'Couldn’t read the journal to import into.',
          tone: 'warning',
        })
        return
      }
      // Pictures first, so no entry is added showing one that isn't there.
      if (!(await restoreEntryImages(parseResult.images))) {
        onStatus({
          text: 'Couldn’t import: a picture in it is damaged or couldn’t be saved.',
          tone: 'warning',
        })
        return
      }
      const importPlan = planImport(existingEntries, parseResult.entries)
      const settingsImport =
        parseResult.settings === undefined
          ? null
          : (importAttachedSettings?.(parseResult.settings) ?? null)
      settingsImport?.apply?.()
      addEntries(importPlan.entriesToAdd)
      const statusParts = [describeImport(importPlan), settingsImport?.status]
      onStatus({ text: statusParts.filter(Boolean).join(' '), tone: 'neutral' })
    },
  }
}
