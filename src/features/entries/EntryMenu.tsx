import { Copy, Download, Ellipsis, Trash2 } from 'lucide-react'
import { ActionList, Button, Popover } from '../../design-system'
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
          <Button
            onClick={() => {
              closeMenu()
              onCopyMarkdown()
            }}
          >
            <Copy aria-hidden="true" />
            Copy as markdown
          </Button>
          <Button
            onClick={() => {
              closeMenu()
              onExport()
            }}
          >
            <Download aria-hidden="true" />
            Export entry as JSON
          </Button>
          <ImportAction onImport={onImport} closeMenu={closeMenu} />
          <Button
            variant="danger"
            onClick={() => {
              closeMenu()
              onDelete()
            }}
          >
            <Trash2 aria-hidden="true" />
            Delete entry
          </Button>
        </ActionList>
      )}
    </Popover>
  )
}
