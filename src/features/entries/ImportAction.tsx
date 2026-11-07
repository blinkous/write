import { Upload } from 'lucide-react'
import { FileInputButton } from '../../design-system'
import { JOURNAL_FILE_MIME_TYPE } from './entryTransfer'

type ImportActionProps = {
  onImport: (file: File) => void
  closeMenu: () => void
}

/** Accepts both single-entry and whole-journal exports. */
export function ImportAction({ onImport, closeMenu }: ImportActionProps) {
  return (
    <FileInputButton
      accept={`.json,${JOURNAL_FILE_MIME_TYPE}`}
      onFileSelected={(file) => {
        closeMenu()
        onImport(file)
      }}
    >
      <Upload aria-hidden="true" />
      Import from JSON
    </FileInputButton>
  )
}
