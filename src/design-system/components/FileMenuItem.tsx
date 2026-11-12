import { useRef, type ReactNode } from 'react'
import { MenuItem } from './MenuItem'

type FileMenuItemProps = {
  children: ReactNode
  /** Comma-separated file types, as for <input accept>. */
  accept: string
  onFileSelected: (file: File) => void
}

/** A menu row that opens the system file picker. Files are read locally, never uploaded. */
export function FileMenuItem({
  children,
  accept,
  onFileSelected,
}: FileMenuItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <MenuItem onClick={() => fileInputRef.current?.click()}>
        {children}
      </MenuItem>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        hidden
        onChange={({ currentTarget }) => {
          const [selectedFile] = currentTarget.files ?? []
          // Cleared so choosing the same file again still triggers a change.
          currentTarget.value = ''
          if (selectedFile) onFileSelected(selectedFile)
        }}
      />
    </>
  )
}
