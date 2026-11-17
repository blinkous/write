import { Download, Info, RotateCcw } from 'lucide-react'
import { ActionList, MenuItem } from '../../design-system'
import { ImportAction } from './ImportAction'

type DataSettingsProps = {
  /** Opens the Export dialog (journal and/or settings, JSON or markdown). */
  onExport: () => void
  /** Opens the import file picker. */
  onChooseImportFile: () => void
  onShowAbout: () => void
  /** Asks before putting every setting back to a first visit's. */
  onResetSettings: () => void
}

/**
 * Export (the journal and/or settings), import, resetting settings (which asks
 * first) and About (which is mostly about where data lives).
 */
export function DataSettings({
  onExport,
  onChooseImportFile,
  onShowAbout,
  onResetSettings,
}: DataSettingsProps) {
  return (
    <ActionList>
      <MenuItem shortcut="Mod-Shift-s" onClick={onExport}>
        <Download aria-hidden="true" />
        Export…
      </MenuItem>
      {/* Takes journal backups and settings files alike. */}
      <ImportAction onChooseFile={onChooseImportFile} />
      <MenuItem onClick={onResetSettings}>
        <RotateCcw aria-hidden="true" />
        Reset all settings and styles…
      </MenuItem>
      <MenuItem onClick={onShowAbout}>
        <Info aria-hidden="true" />
        About
      </MenuItem>
    </ActionList>
  )
}
