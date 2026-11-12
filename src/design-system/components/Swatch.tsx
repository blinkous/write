import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Swatch.module.css'

type SwatchRowProps = {
  /** Accessible name for the group; not shown, so menus don't need titles. */
  label: string
  children: ReactNode
}

/** A row of color swatches. */
export function SwatchRow({ label, children }: SwatchRowProps) {
  return (
    <div role="group" aria-label={label} className={styles.row}>
      {children}
    </div>
  )
}

type SwatchButtonProps = {
  /** Any CSS color, including a design token like var(--color-theme-1). */
  color: string
  label: string
  isSelected: boolean
  onClick: () => void
}

export function SwatchButton({
  color,
  label,
  isSelected,
  onClick,
}: SwatchButtonProps) {
  return (
    <button
      type="button"
      className={styles.swatch}
      style={{ background: color }}
      aria-label={label}
      title={label}
      aria-pressed={isSelected}
      onClick={onClick}
    />
  )
}

type SwatchColorInputProps = {
  /** The slot's color, or null for an empty slot. */
  value: string | null
  label: string
  isSelected?: boolean
  /** Color the picker opens with when the slot is empty. */
  emptyPickerColor?: string
  /** Clicking also opens the system color picker. */
  onClick?: () => void
  onChange: (color: string) => void
  /** Called once a color is picked (native "change"), not on every step of a drag. */
  onCommit?: () => void
  /** Empties the slot; shown as a small × on hover or focus when the slot is filled. */
  onClear?: () => void
  /** For pairing with a visible label (see LabeledRow's `controlId`). */
  id?: string
}

/** Where the picker starts for an empty slot when no color is given: a neutral mid grey. */
const DEFAULT_EMPTY_PICKER_COLOR = '#808080'

/** A swatch that opens the system color picker; shown as an empty box until filled. */
export function SwatchColorInput({
  value,
  label,
  isSelected = false,
  emptyPickerColor = DEFAULT_EMPTY_PICKER_COLOR,
  onClick,
  onChange,
  onCommit,
  onClear,
  id,
}: SwatchColorInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const onCommitRef = useRef(onCommit)

  useEffect(() => {
    onCommitRef.current = onCommit
  })

  // React's onChange is the "input" event, so listen for the native "change" directly.
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    const handleChange = () => onCommitRef.current?.()
    input.addEventListener('change', handleChange)
    return () => input.removeEventListener('change', handleChange)
  }, [])
  return (
    <div className={styles.slot}>
      {/*
       * The tile is drawn like SwatchButton; the native color input sits on top,
       * invisible, only to open the picker. Native color inputs can't be styled
       * consistently across browsers (Safari draws its own well).
       */}
      <span
        className={styles.swatch}
        style={value ? { background: value } : undefined}
        data-empty={value === null}
        data-selected={isSelected}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id={id}
        type="color"
        className={styles.colorInput}
        value={value ?? emptyPickerColor}
        aria-label={label}
        title={label}
        onClick={onClick}
        onChange={({ target }) => onChange(target.value)}
      />
      {value !== null && onClear && (
        <button
          type="button"
          className={styles.clearButton}
          aria-label={`Remove ${label.toLowerCase()}`}
          title="Remove"
          onClick={() => {
            onClear()
            // The button disappears with the color; keep focus on the slot.
            inputRef.current?.focus()
          }}
        >
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
