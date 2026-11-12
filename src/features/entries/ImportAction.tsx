import { Upload } from 'lucide-react'
import { FileMenuItem } from '../../design-system'
import { JOURNAL_FILE_MIME_TYPE } from './entryTransfer'

type ImportActionProps = {
  onImport: (file: File) => void
  /** Closes the menu it's in, if any, before the import runs. */
  closeMenu?: () => void
}

/** Accepts both single-entry and whole-journal exports. */
export function ImportAction({ onImport, closeMenu }: ImportActionProps) {
  return (
    <FileMenuItem
      accept={`.json,${JOURNAL_FILE_MIME_TYPE}`}
      onFileSelected={(file) => {
        closeMenu?.()
        onImport(file)
      }}
    >
      <Upload aria-hidden="true" />
      Import from JSON
    </FileMenuItem>
  )
}
