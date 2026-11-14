import { ImagePlus } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { HiddenFileInput } from './HiddenFileInput'
import { SwatchClearButton } from './Swatch'
import styles from './Swatch.module.css'

type FileSwatchProps = {
  /** Names what the file is for, e.g. "Background picture or video". */
  label: string
  /** Comma-separated file types, as for <input accept>. */
  accept: string
  /** A small preview of the chosen file (filling the tile), or null while there's none. */
  preview: ReactNode | null
  onFileSelected: (file: File) => void
  /** Removes the file; shown as a small × on hover or focus while there's one. */
  onClear: () => void
}

/**
 * A swatch-sized tile for a file: + and a picture icon while empty, a preview
 * once chosen. Clicking it opens the system file picker (to add or change).
 */
export function FileSwatch({
  label,
  accept,
  preview,
  onFileSelected,
  onClear,
}: FileSwatchProps) {
  const tileRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasFile = preview !== null
  const action = hasFile ? 'Change' : 'Add'
  return (
    <div className={styles.slot}>
      <button
        ref={tileRef}
        type="button"
        className={`${styles.swatch} ${styles.fileSwatch}`}
        data-empty={!hasFile}
        aria-label={`${action} ${label.toLowerCase()}`}
        title={`${action} ${label.toLowerCase()}`}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ?? <ImagePlus aria-hidden="true" />}
      </button>
      <HiddenFileInput
        ref={fileInputRef}
        accept={accept}
        onFileSelected={onFileSelected}
      />
      {hasFile && (
        <SwatchClearButton
          label={label}
          onClear={() => {
            onClear()
            // The button disappears with the file; keep focus on the tile.
            tileRef.current?.focus()
          }}
        />
      )}
    </div>
  )
}
