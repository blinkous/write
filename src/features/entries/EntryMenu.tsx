import { Copy, Download, Ellipsis, Trash2 } from 'lucide-react'
import { ActionList, MenuItem, Popover } from '../../design-system'
import { useShownShortcuts } from '../../keyboard-shortcuts'
import { ImportAction } from './ImportAction'

type EntryMenuProps = {
  /** Names the menu, e.g. "Actions for Rainy Sunday" in the list; "Entry actions" for the open entry. */
  label?: string
  onCopyEntry: () => void
  onExport: () => void
  /** Opens the import file picker. */
  onChooseImportFile: () => void
  onDelete: () => void
}

/** Actions for one entry: the open one (page header) or any in the list (on hover). */
export function EntryMenu({
  label = 'Entry actions',
  onCopyEntry,
  onExport,
  onChooseImportFile,
  onDelete,
}: EntryMenuProps) {
  const getShortcut = useShownShortcuts()
  return (
    <Popover label={label} trigger={<Ellipsis aria-hidden="true" />}>
      {(closeMenu) => (
        <ActionList>
          <MenuItem
            icon={Copy}
            shortcut={getShortcut('copy-entry-markdown')}
            onClick={() => {
              closeMenu()
              onCopyEntry()
            }}
          >
            Copy entry as markdown
          </MenuItem>
          <MenuItem
            icon={Download}
            shortcut={getShortcut('export-entry')}
            onClick={() => {
              closeMenu()
              onExport()
            }}
          >
            Export entry as JSON
          </MenuItem>
          <ImportAction
            onChooseFile={onChooseImportFile}
            closeMenu={closeMenu}
          />
          <MenuItem
            icon={Trash2}
            onClick={() => {
              closeMenu()
              onDelete()
            }}
          >
            Delete entry
          </MenuItem>
        </ActionList>
      )}
    </Popover>
  )
}
