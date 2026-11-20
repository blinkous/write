import type { ToastMessage } from '../../design-system'
import { describeSaveResult, saveFile } from '../../lib/saveFile'
import {
  getSettingsFileName,
  parseSettingsRecord,
  readSettingsFile,
  serializeSettings,
  toSettingsRecord,
  type Settings,
} from './settingsFile'

type UseSettingsTransferOptions = {
  settings: Settings
  /** Applies imported settings (whatever the file had). */
  onImport: (settings: Partial<Settings>) => void
  onStatus: (message: ToastMessage) => void
}

/** Saving settings to a file, and recognizing settings files among imports. */
export function useSettingsTransfer({
  settings,
  onImport,
  onStatus,
}: UseSettingsTransferOptions) {
  return {
    async exportSettings() {
      try {
        const message = describeSaveResult(
          await saveFile({
            suggestedName: getSettingsFileName(),
            contents: serializeSettings(settings),
            mimeType: 'application/json',
            description: 'Write settings',
            extension: '.json',
          }),
        )
        if (message) onStatus(message)
      } catch {
        onStatus({ text: 'Couldn’t save the file.', tone: 'warning' })
      }
    },

    /** The settings to save inside a journal export, so one file holds both. */
    getSettingsRecord: () => toSettingsRecord(settings),

    /** For settings found inside a journal export: how to apply them, or why they can't be. */
    importAttachedSettings(rawSettings: unknown) {
      const result = parseSettingsRecord(rawSettings)
      if (result.kind === 'other') return null
      if (result.kind === 'invalid')
        return { status: `Settings skipped: ${result.reason}` }
      return {
        apply: () => onImport(result.settings),
        status: 'Settings imported too.',
      }
    },

    /** Imports the file if it's a settings file; false means it's not (e.g. a journal backup). */
    async importIfSettings(file: File): Promise<boolean> {
      const result = await readSettingsFile(file)
      if (result.kind === 'other') return false
      if (result.kind === 'invalid') {
        onStatus({ text: `Couldn’t import: ${result.reason}`, tone: 'warning' })
        return true
      }
      onImport(result.settings)
      onStatus({ text: 'Settings imported.', tone: 'neutral' })
      return true
    },
  }
}
