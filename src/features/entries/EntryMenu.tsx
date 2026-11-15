import { Copy, Download, Ellipsis, Trash2 } from 'lucide-react'
import { ActionList, MenuItem, Popover } from '../../design-system'
import { ImportAction } from './ImportAction'

type EntryMenuProps = {
  /** Names the menu, e.g. "Actions for Rainy Sunday" in the list; "Entry actions" for the open entry. */
  label?: string
  onCopyMarkdown: () => void
  onExport: () => void
  /** Opens the import file picker. */
  onChooseImportFile: () => void
  onDelete: () => void
}

/** Actions for one entry: the open one (page header) or any in the list (on hover). */
export function EntryMenu({
  label = 'Entry actions',
  onCopyMarkdown,
  onExport,
  onChooseImportFile,
  onDelete,
}: EntryMenuProps) {
  return (
    <Popover label={label} trigger={<Ellipsis aria-hidden="true" />}>
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
            shortcut="Mod-s"
            onClick={() => {
              closeMenu()
              onExport()
            }}
          >
            <Download aria-hidden="true" />
            Export entry as JSON
          </MenuItem>
          <ImportAction
            onChooseFile={onChooseImportFile}
            closeMenu={closeMenu}
          />
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
