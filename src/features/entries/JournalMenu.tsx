import { Download, Ellipsis } from 'lucide-react'
import { ActionList, Button, Popover } from '../../design-system'
import { ImportAction } from './ImportAction'

type JournalMenuProps = {
  onExportAll: () => void
  onImport: (file: File) => void
}

/** Whole-journal actions, shown in the entries sidebar. */
export function JournalMenu({ onExportAll, onImport }: JournalMenuProps) {
  return (
    <Popover
      label="Journal actions"
      align="start"
      trigger={<Ellipsis aria-hidden="true" />}
    >
      {(closeMenu) => (
        <ActionList>
          <Button
            onClick={() => {
              closeMenu()
              onExportAll()
            }}
          >
            <Download aria-hidden="true" />
            Export all entries as JSON
          </Button>
          <ImportAction onImport={onImport} closeMenu={closeMenu} />
        </ActionList>
      )}
    </Popover>
  )
}
