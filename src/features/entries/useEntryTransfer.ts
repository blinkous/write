import type { ToastMessage } from '../../design-system'
import { saveTextFile, type SaveFileResult } from '../../lib/saveFile'
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
  entries: readonly JournalEntry[]
  /** Turns entry content into markdown (provided by the editor, which owns the format). */
  contentToMarkdown: ContentToMarkdown
  addEntries: (newEntries: readonly JournalEntry[]) => void
  onStatus: (message: ToastMessage) => void
}

const MARKDOWN_MIME_TYPE = 'text/markdown'

function jsonExport(
  entriesToExport: readonly JournalEntry[],
  suggestedName: string,
) {
  return {
    suggestedName,
    text: serializeEntries(entriesToExport),
    mimeType: JOURNAL_FILE_MIME_TYPE,
    description: 'Journal export',
    extension: '.json',
  } as const
}

/** What to tell the user after an export; nothing if they cancelled the dialog. */
function describeSave(result: SaveFileResult): ToastMessage | null {
  switch (result.status) {
    case 'saved':
      return { text: `Saved ${result.fileName}.`, tone: 'neutral' }
    case 'downloaded':
      return {
        text: `This browser can’t ask where to save, so ${result.fileName} went to your Downloads folder.`,
        tone: 'neutral',
      }
    case 'cancelled':
      return null
  }
}

export function useEntryTransfer({
  entries,
  contentToMarkdown,
  addEntries,
  onStatus,
}: UseEntryTransferOptions) {
  // Called straight from the menu click: the save dialog needs a user action.
  async function saveExport(file: Parameters<typeof saveTextFile>[0]) {
    try {
      const result = await saveTextFile(file)
      const message = describeSave(result)
      if (message) onStatus(message)
    } catch {
      onStatus({ text: 'Couldn’t save the file.', tone: 'warning' })
    }
  }

  return {
    exportEntry: (entry: JournalEntry) =>
      saveExport(jsonExport([entry], getEntryFileName(entry))),
    exportAllEntries: () =>
      saveExport(jsonExport(entries, getJournalFileName())),
    exportAllAsMarkdown: () =>
      saveExport({
        suggestedName: getJournalMarkdownFileName(),
        text: journalToMarkdown(entries, contentToMarkdown),
        mimeType: MARKDOWN_MIME_TYPE,
        description: 'Markdown',
        extension: '.md',
      }),

    /** Accepts a single-entry or whole-journal export; both use the same format. */
    async importEntries(file: File) {
      const parseResult = await readEntriesFile(file)
      if (!parseResult.ok) {
        onStatus({
          text: `Couldn’t import: ${parseResult.reason}`,
          tone: 'warning',
        })
        return
      }
      const importPlan = planImport(entries, parseResult.entries)
      addEntries(importPlan.entriesToAdd)
      onStatus({ text: describeImport(importPlan), tone: 'neutral' })
    },
  }
}
