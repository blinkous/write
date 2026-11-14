import { useRef, type ReactNode } from 'react'
import { HiddenFileInput } from './HiddenFileInput'
import { MenuItem } from './MenuItem'

type FileMenuItemProps = {
  children: ReactNode
  /** Comma-separated file types, as for <input accept>. */
  accept: string
  onFileSelected: (file: File) => void
  /** Shown at the end of the row, as for MenuItem. */
  shortcut?: string
}

/** A menu row that opens the system file picker. Files are read locally, never uploaded. */
export function FileMenuItem({
  children,
  accept,
  onFileSelected,
  shortcut,
}: FileMenuItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <MenuItem
        shortcut={shortcut}
        onClick={() => fileInputRef.current?.click()}
      >
        {children}
      </MenuItem>
      <HiddenFileInput
        ref={fileInputRef}
        accept={accept}
        onFileSelected={onFileSelected}
      />
    </>
  )
}
