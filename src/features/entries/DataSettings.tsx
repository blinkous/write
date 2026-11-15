import { Download, Info } from 'lucide-react'
import { ActionList, MenuItem } from '../../design-system'
import { ImportAction } from './ImportAction'

type DataSettingsProps = {
  /** Opens the Export dialog (journal and/or settings, JSON or markdown). */
  onExport: () => void
  /** Opens the import file picker. */
  onChooseImportFile: () => void
  onShowAbout: () => void
}

/** Export (the journal and/or settings), import, and About (which is mostly about where data lives). */
export function DataSettings({
  onExport,
  onChooseImportFile,
  onShowAbout,
}: DataSettingsProps) {
  return (
    <ActionList>
      <MenuItem shortcut="Mod-Shift-s" onClick={onExport}>
        <Download aria-hidden="true" />
        Export…
      </MenuItem>
      {/* Takes journal backups and settings files alike. */}
      <ImportAction onChooseFile={onChooseImportFile} />
      <MenuItem onClick={onShowAbout}>
        <Info aria-hidden="true" />
        About
      </MenuItem>
    </ActionList>
  )
}
