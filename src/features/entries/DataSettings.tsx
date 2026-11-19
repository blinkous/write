import { Download, Info, Keyboard, RotateCcw } from 'lucide-react'
import { ActionList, MenuItem } from '../../design-system'
import { useShownShortcuts } from '../../keyboard-shortcuts'
import { ImportAction } from './ImportAction'

type DataSettingsProps = {
  /** Opens the Export dialog (journal and/or settings, JSON or markdown). */
  onExport: () => void
  /** Opens the import file picker. */
  onChooseImportFile: () => void
  /** Opens the list of keyboard shortcuts, to see or change them. */
  onShowShortcuts: () => void
  onShowAbout: () => void
  /** Asks before putting every setting back to a first visit's. */
  onResetSettings: () => void
}

/**
 * Export (the journal and/or settings), import, keyboard shortcuts, resetting
 * settings (which asks first) and About (which is mostly about where data lives).
 */
export function DataSettings({
  onExport,
  onChooseImportFile,
  onShowShortcuts,
  onShowAbout,
  onResetSettings,
}: DataSettingsProps) {
  const getShortcut = useShownShortcuts()
  return (
    <ActionList>
      <MenuItem
        icon={Download}
        shortcut={getShortcut('open-export')}
        onClick={onExport}
      >
        Export…
      </MenuItem>
      {/* Takes journal backups and settings files alike. */}
      <ImportAction onChooseFile={onChooseImportFile} />
      <MenuItem icon={Keyboard} onClick={onShowShortcuts}>
        Keyboard shortcuts…
      </MenuItem>
      <MenuItem icon={RotateCcw} onClick={onResetSettings}>
        Reset all settings and styles
      </MenuItem>
      <MenuItem icon={Info} onClick={onShowAbout}>
        About
      </MenuItem>
    </ActionList>
  )
}
