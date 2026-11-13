import type { ToastMessage } from '../../design-system'
import { describeSaveResult, saveTextFile } from '../../lib/saveFile'
import {
  getSettingsFileName,
  readSettingsFile,
  serializeSettings,
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
          await saveTextFile({
            suggestedName: getSettingsFileName(),
            text: serializeSettings(settings),
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
