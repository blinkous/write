import { Copy, Download, Ellipsis, Trash2 } from 'lucide-react'
import { ActionList, MenuItem, Popover } from '../../design-system'
import { ImportAction } from './ImportAction'

type EntryMenuProps = {
  onCopyMarkdown: () => void
  onExport: () => void
  onImport: (file: File) => void
  onDelete: () => void
}

/** Actions for the open entry. */
export function EntryMenu({
  onCopyMarkdown,
  onExport,
  onImport,
  onDelete,
}: EntryMenuProps) {
  return (
    <Popover label="Entry actions" trigger={<Ellipsis aria-hidden="true" />}>
      {(closeMenu) => (
        <ActionList>
          <MenuItem
            onClick={() => {
              closeMenu()
              onCopyMarkdown()
            }}
          >
            <Copy aria-hidden="true" />
            Copy as markdown
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeMenu()
              onExport()
            }}
          >
            <Download aria-hidden="true" />
            Export entry as JSON
          </MenuItem>
          <ImportAction onImport={onImport} closeMenu={closeMenu} />
          <MenuItem
            variant="danger"
            onClick={() => {
              closeMenu()
              onDelete()
            }}
          >
            <Trash2 aria-hidden="true" />
            Delete entry
          </MenuItem>
        </ActionList>
      )}
    </Popover>
  )
}
