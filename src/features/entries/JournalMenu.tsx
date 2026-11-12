import { Download, Ellipsis, FileText, Info } from 'lucide-react'
import { ActionList, MenuItem, Popover } from '../../design-system'
import { ImportAction } from './ImportAction'

type JournalMenuProps = {
  onExportAll: () => void
  onExportAllAsMarkdown: () => void
  onImport: (file: File) => void
  onShowAbout: () => void
}

/** Whole-journal actions, shown in the entries sidebar. */
export function JournalMenu({
  onExportAll,
  onExportAllAsMarkdown,
  onImport,
  onShowAbout,
}: JournalMenuProps) {
  return (
    <Popover
      label="Journal actions"
      align="start"
      trigger={<Ellipsis aria-hidden="true" />}
    >
      {(closeMenu) => (
        <ActionList>
          <MenuItem
            onClick={() => {
              closeMenu()
              onExportAll()
            }}
          >
            <Download aria-hidden="true" />
            Export all entries as JSON
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeMenu()
              onExportAllAsMarkdown()
            }}
          >
            <FileText aria-hidden="true" />
            Export all entries as markdown
          </MenuItem>
          <ImportAction onImport={onImport} closeMenu={closeMenu} />
          <MenuItem
            onClick={() => {
              closeMenu()
              onShowAbout()
            }}
          >
            <Info aria-hidden="true" />
            About
          </MenuItem>
        </ActionList>
      )}
    </Popover>
  )
}
