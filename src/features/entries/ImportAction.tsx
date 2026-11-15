import { Upload } from 'lucide-react'
import type { Ref } from 'react'
import { HiddenFileInput, MenuItem } from '../../design-system'
import { JOURNAL_FILE_MIME_TYPE } from './entryTransfer'

/** Journal backups (one entry or all) and settings files: both are JSON. */
const IMPORT_FILE_TYPES = `.json,${JOURNAL_FILE_MIME_TYPE}`

type ImportActionProps = {
  /** Opens the app's one import picker (ImportFilePicker). */
  onChooseFile: () => void
  /** Closes the menu it's in, if any, as the picker opens. */
  closeMenu?: () => void
}

/** The Import row of a menu. */
export function ImportAction({ onChooseFile, closeMenu }: ImportActionProps) {
  return (
    <MenuItem
      shortcut="Mod-o"
      onClick={() => {
        closeMenu?.()
        onChooseFile()
      }}
    >
      <Upload aria-hidden="true" />
      Import from JSON
    </MenuItem>
  )
}

type ImportFilePickerProps = {
  /** Call `.click()` on it to open the picker (Import rows, ⌘O). */
  ref: Ref<HTMLInputElement>
  onImport: (file: File) => void
}

/**
 * The app's one import picker, always mounted: menus render nothing once
 * closed, so a picker inside one could vanish (and drop its file) if the menu
 * closed while the system picker was up.
 */
export function ImportFilePicker({ ref, onImport }: ImportFilePickerProps) {
  return (
    <HiddenFileInput
      ref={ref}
      accept={IMPORT_FILE_TYPES}
      onFileSelected={onImport}
    />
  )
}
