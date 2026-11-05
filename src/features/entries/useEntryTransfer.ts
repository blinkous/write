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

type UseEntryTransferOptions = {
  entries: readonly JournalEntry[]
  addEntries: (newEntries: readonly JournalEntry[]) => void
  onStatus: (message: ToastMessage) => void
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
  addEntries,
  onStatus,
}: UseEntryTransferOptions) {
  // Called straight from the menu click: the save dialog needs a user action.
  async function exportEntries(
    entriesToExport: readonly JournalEntry[],
    suggestedName: string,
  ) {
    try {
      const result = await saveTextFile({
        suggestedName,
        text: serializeEntries(entriesToExport),
        mimeType: JOURNAL_FILE_MIME_TYPE,
        description: 'Journal export',
        extension: '.json',
      })
      const message = describeSave(result)
      if (message) onStatus(message)
    } catch {
      onStatus({ text: 'Couldn’t save the file.', tone: 'warning' })
    }
  }

  return {
    exportEntry: (entry: JournalEntry) =>
      exportEntries([entry], getEntryFileName(entry)),
    exportAllEntries: () => exportEntries(entries, getJournalFileName()),

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
