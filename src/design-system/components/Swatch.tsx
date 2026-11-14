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

type SwatchClearButtonProps = {
  /** The slot's name, e.g. "Custom color 2"; the button says "Remove" with it. */
  label: string
  /** Empties the slot; the caller keeps focus on the slot, since this button then disappears. */
  onClear: () => void
}

/** A small × over a filled slot's corner, shown on hover or focus (inside a swatch slot). */
export function SwatchClearButton({ label, onClear }: SwatchClearButtonProps) {
  return (
    <button
      type="button"
      className={styles.clearButton}
      aria-label={`Remove ${label.toLowerCase()}`}
      title="Remove"
      onClick={onClear}
    >
      <X aria-hidden="true" />
    </button>
  )
}

type SwatchColorInputProps = {
  /** The slot's color, or null for an empty slot. */
  value: string | null
  label: string
  isSelected?: boolean
  /** Color the picker opens with when the slot is empty. */
  emptyPickerColor?: string
  /** Runs when the tile is pressed, before the system color picker opens. */
  onClick?: () => void
  onChange: (color: string) => void
  /** Called once a color is picked (native "change"), not on every step of a drag. */
  onCommit?: () => void
  /** Empties the slot; shown as a small × on hover or focus when the slot is filled. */
  onClear?: () => void
}

/** Where the picker starts for an empty slot when no color is given: a neutral mid grey. */
const DEFAULT_EMPTY_PICKER_COLOR = '#808080'

/** Opens a color input's picker; browsers without showPicker() get a click instead. */
function openColorPicker(input: HTMLInputElement) {
  try {
    input.showPicker()
  } catch {
    input.click()
  }
}

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
}: SwatchColorInputProps) {
  const tileRef = useRef<HTMLButtonElement>(null)
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
       * The tile is a button, drawn like SwatchButton, that opens the native
       * color input's picker. The input sits under it, invisible and out of the
       * tab order: WebKit never lets the keyboard reach color inputs, and they
       * can't be styled consistently across browsers anyway.
       */}
      <button
        ref={tileRef}
        type="button"
        className={styles.swatch}
        style={value ? { background: value } : undefined}
        data-empty={value === null}
        data-selected={isSelected}
        aria-label={label}
        title={label}
        onClick={() => {
          onClick?.()
          if (inputRef.current) openColorPicker(inputRef.current)
        }}
      />
      <input
        ref={inputRef}
        type="color"
        className={styles.colorInput}
        value={value ?? emptyPickerColor}
        tabIndex={-1}
        aria-hidden="true"
        onChange={({ target }) => onChange(target.value)}
      />
      {value !== null && onClear && (
        <SwatchClearButton
          label={label}
          onClear={() => {
            onClear()
            // The button disappears with the color; keep focus on the slot.
            tileRef.current?.focus()
          }}
        />
      )}
    </div>
  )
}
