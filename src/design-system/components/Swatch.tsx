import { X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
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
  /** Any CSS color, including a design token like var(--color-theme-1); null is "no color", drawn crossed out. */
  color: string | null
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
      style={color ? { background: color } : undefined}
      data-no-color={color === null || undefined}
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

type SwatchSlotProps = {
  /** The slot's color, or null for an empty slot. */
  value: string | null
  label: string
  isSelected: boolean
  /** A filled slot is chosen, an empty one filled (the caller decides which). */
  onClick: () => void
  /** Empties the slot; shown as a small × on hover or focus when the slot is filled. */
  onClear: () => void
}

/** A saved color's slot: a tile while filled (with a × to empty it), a dashed box while empty. */
export function SwatchSlot({
  value,
  label,
  isSelected,
  onClick,
  onClear,
}: SwatchSlotProps) {
  const tileRef = useRef<HTMLButtonElement>(null)
  return (
    <div className={styles.slot}>
      <button
        ref={tileRef}
        type="button"
        className={styles.swatch}
        style={value ? { background: value } : undefined}
        data-empty={value === null}
        data-selected={isSelected}
        aria-label={label}
        title={label}
        onClick={onClick}
      />
      {value !== null && (
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

/** A color drawn as a tile inside another control, e.g. a menu trigger showing the current color. */
export function SwatchFace({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className={styles.face}
      style={{ background: color }}
    />
  )
}
