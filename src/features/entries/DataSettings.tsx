import { Download, FileText, Info, SlidersHorizontal } from 'lucide-react'
import { ActionList, MenuItem } from '../../design-system'
import { ImportAction } from './ImportAction'

type DataSettingsProps = {
  onExportAll: () => void
  onExportAllAsMarkdown: () => void
  onExportSettings: () => void
  onImport: (file: File) => void
  onShowAbout: () => void
}

/** Backups of the whole journal and of settings, imports, and About (which is mostly about where data lives). */
export function DataSettings({
  onExportAll,
  onExportAllAsMarkdown,
  onExportSettings,
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
      <MenuItem onClick={onExportSettings}>
        <SlidersHorizontal aria-hidden="true" />
        Export settings
      </MenuItem>
      {/* Takes journal backups and settings files alike. */}
      <ImportAction onImport={onImport} />
      <MenuItem onClick={onShowAbout}>
        <Info aria-hidden="true" />
        About
      </MenuItem>
    </ActionList>
  )
}
