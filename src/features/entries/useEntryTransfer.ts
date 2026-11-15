import type { ToastMessage } from '../../design-system'
import { copyTextToClipboard } from '../../lib/clipboard'
import { describeSaveResult, saveTextFile } from '../../lib/saveFile'
import {
  describeImport,
  getEntryFileName,
  getJournalFileName,
  JOURNAL_FILE_MIME_TYPE,
  planImport,
  readEntriesFile,
  serializeEntries,
} from './entryTransfer'
import type { JournalEntry } from './journalEntry'
import {
  getJournalMarkdownFileName,
  journalToMarkdown,
  type ContentToMarkdown,
} from './journalMarkdown'

type UseEntryTransferOptions = {
  /** Read from storage when an action runs (see Journal). */
  getEntry: (entryId: string) => Promise<JournalEntry>
  getAllEntries: () => Promise<readonly JournalEntry[]>
  /** Turns entry content into markdown (provided by the editor, which owns the format). */
  contentToMarkdown: ContentToMarkdown
  addEntries: (newEntries: readonly JournalEntry[]) => void
  onStatus: (message: ToastMessage) => void
}

const MARKDOWN_MIME_TYPE = 'text/markdown'

/**
 * Reads settings found in an imported journal file (opaque to entries):
 * null if there are none it can use; otherwise how to apply them and what to
 * tell the user. Applied only once the whole file has proved valid.
 */
export type AttachedSettingsImporter = (
  rawSettings: unknown,
) => { apply?: () => void; status: string } | null

function jsonExport(
  entriesToExport: readonly JournalEntry[],
  suggestedName: string,
  settings?: unknown,
) {
  return {
    suggestedName,
    text: serializeEntries(entriesToExport, { settings }),
    mimeType: JOURNAL_FILE_MIME_TYPE,
    description: 'Journal export',
    extension: '.json',
  } as const
}

export function useEntryTransfer({
  getEntry,
  getAllEntries,
  contentToMarkdown,
  addEntries,
  onStatus,
}: UseEntryTransferOptions) {
  /**
   * Called straight from the menu click: the save dialog needs a user action
   * (reading the entries first is quick enough to still count as one).
   */
  async function saveExport(
    readFile: () => Promise<Parameters<typeof saveTextFile>[0]>,
  ) {
    let file
    try {
      file = await readFile()
    } catch {
      onStatus({
        text: 'Couldn’t read the journal to export.',
        tone: 'warning',
      })
      return
    }
    try {
      const result = await saveTextFile(file)
      const message = describeSaveResult(result)
      if (message) onStatus(message)
    } catch {
      onStatus({ text: 'Couldn’t save the file.', tone: 'warning' })
    }
  }

  return {
    /** Copies the entry as markdown, under its name when it has a custom one. */
    async copyEntryAsMarkdown(entryId: string) {
      const markdown = getEntry(entryId).then(({ content, title }) =>
        contentToMarkdown(content, { title }),
      )
      const didCopy = await copyTextToClipboard(markdown)
      onStatus(
        didCopy
          ? { text: 'Copied as markdown.', tone: 'neutral' }
          : { text: 'Couldn’t copy to the clipboard.', tone: 'warning' },
      )
    },
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
      saveExport(async () => ({
        suggestedName: getJournalMarkdownFileName(),
        text: journalToMarkdown(await getAllEntries(), contentToMarkdown),
        mimeType: MARKDOWN_MIME_TYPE,
        description: 'Markdown',
        extension: '.md',
      })),

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
