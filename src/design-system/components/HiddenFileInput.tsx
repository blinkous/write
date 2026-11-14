import type { Ref } from 'react'

type HiddenFileInputProps = {
  /** Call `.click()` on it to open the system file picker. */
  ref: Ref<HTMLInputElement>
  /** Comma-separated file types, as for <input accept>. */
  accept: string
  onFileSelected: (file: File) => void
}

/** The system file picker, opened by a visible control of its own. Files are read locally, never uploaded. */
export function HiddenFileInput({
  ref,
  accept,
  onFileSelected,
}: HiddenFileInputProps) {
  return (
    <input
      ref={ref}
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
  )
}
