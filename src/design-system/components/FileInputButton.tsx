import { useRef, type ReactNode } from 'react'
import { Button } from './Button'

type FileInputButtonProps = {
  children: ReactNode
  /** Comma-separated file types, as for <input accept>. */
  accept: string
  onFileSelected: (file: File) => void
  variant?: 'ghost' | 'subtle'
}

/** A Button that opens the system file picker. Files are read locally, never uploaded. */
export function FileInputButton({
  children,
  accept,
  onFileSelected,
  variant = 'ghost',
}: FileInputButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button variant={variant} onClick={() => fileInputRef.current?.click()}>
        {children}
      </Button>
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
