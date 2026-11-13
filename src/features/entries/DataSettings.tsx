import { Download, FileText, Info } from 'lucide-react'
import { ActionList, MenuItem } from '../../design-system'
import { ImportAction } from './ImportAction'

type DataSettingsProps = {
  onExportAll: () => void
  onExportAllAsMarkdown: () => void
  onImport: (file: File) => void
  onShowAbout: () => void
}

/** Whole-journal backups and imports, and About (which is mostly about where data lives). */
export function DataSettings({
  onExportAll,
  onExportAllAsMarkdown,
  onImport,
  onShowAbout,
}: DataSettingsProps) {
  return (
    <ActionList>
      {/* Short labels fit the sidebar; the tooltip (also read as the description) says "all entries". */}
      <MenuItem
        shortcut="Mod-Shift-s"
        title="Export all entries as JSON"
        onClick={onExportAll}
      >
        <Download aria-hidden="true" />
        Export as JSON
      </MenuItem>
      <MenuItem
        title="Export all entries as markdown"
        onClick={onExportAllAsMarkdown}
      >
        <FileText aria-hidden="true" />
        Export as markdown
      </MenuItem>
      <ImportAction onImport={onImport} />
      <MenuItem onClick={onShowAbout}>
        <Info aria-hidden="true" />
        About
      </MenuItem>
    </ActionList>
  )
}
