import { Upload } from 'lucide-react'
import type { Ref } from 'react'
import { FileMenuItem, HiddenFileInput } from '../../design-system'
import { JOURNAL_FILE_MIME_TYPE } from './entryTransfer'

/** Journal backups (one entry or all) and settings files: both are JSON. */
const IMPORT_FILE_TYPES = `.json,${JOURNAL_FILE_MIME_TYPE}`
/** Opens Import from anywhere (see useFileShortcuts). */
const IMPORT_SHORTCUT = 'Mod-o'

type ImportActionProps = {
  onImport: (file: File) => void
  /** Closes the menu it's in, if any, before the import runs. */
  closeMenu?: () => void
}

/** The Import row of a menu. */
export function ImportAction({ onImport, closeMenu }: ImportActionProps) {
  return (
    <FileMenuItem
      accept={IMPORT_FILE_TYPES}
      shortcut={IMPORT_SHORTCUT}
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

type ImportFilePickerProps = {
  /** Call `.click()` on it to open the picker (⌘O). */
  ref: Ref<HTMLInputElement>
  onImport: (file: File) => void
}

/** Import's file picker, always mounted (unlike menus), for the shortcut to open. */
export function ImportFilePicker({ ref, onImport }: ImportFilePickerProps) {
  return (
    <HiddenFileInput
      ref={ref}
      accept={IMPORT_FILE_TYPES}
      onFileSelected={onImport}
    />
  )
}
