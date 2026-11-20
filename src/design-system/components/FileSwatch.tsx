import { FileQuestionMark, ImagePlus } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'
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
  /**
   * The chosen file can't be found: the tile shows a filled not-found face
   * instead of a preview (described as "not found" to screen readers), and
   * still changes or removes it as usual.
   */
  isMissing?: boolean
  onFileSelected: (file: File) => void
  /** Removes the file; shown as a small × on hover or focus while there's one. */
  onClear: () => void
}

/**
 * A swatch-sized tile for a file: + and a picture icon while empty, a preview
 * once chosen, a filled not-found face if the chosen file is gone. Clicking it
 * opens the system file picker (to add or change).
 */
export function FileSwatch({
  label,
  accept,
  preview,
  isMissing = false,
  onFileSelected,
  onClear,
}: FileSwatchProps) {
  const tileRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const missingHintId = useId()
  const hasFile = preview !== null || isMissing
  const action = hasFile ? 'Change' : 'Add'
  return (
    <div className={styles.slot}>
      <button
        ref={tileRef}
        type="button"
        className={`${styles.swatch} ${styles.fileSwatch}`}
        data-empty={!hasFile}
        data-missing={isMissing}
        aria-label={`${action} ${label.toLowerCase()}`}
        aria-describedby={isMissing ? missingHintId : undefined}
        title={`${action} ${label.toLowerCase()}`}
        onClick={() => fileInputRef.current?.click()}
      >
        {isMissing ? (
          <FileQuestionMark aria-hidden="true" />
        ) : (
          (preview ?? <ImagePlus aria-hidden="true" />)
        )}
      </button>
      {isMissing && (
        <span id={missingHintId} className="visually-hidden">
          Not found
        </span>
      )}
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
