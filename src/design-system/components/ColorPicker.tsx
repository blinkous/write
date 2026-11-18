import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful'
import { DropperOrSystemPicker } from './DropperOrSystemPicker'
import styles from './ColorPicker.module.css'
import { TypedColorField } from './TypedColorField'

type ColorPickerProps = {
  /** What the color is for, e.g. "Text color"; names the picker's controls. */
  label: string
  /** The color shown: #rrggbb, or #rrggbbaa when transparency is allowed. */
  color: string
  /** Adds an opacity slider; off where nothing shows through (the page background). */
  allowsTransparency: boolean
  /** Every step of a drag, a typed color, or a dropped one. */
  onChange: (color: string) => void
  /** A drag, key press, typed color or dropped color is done: one undo step. */
  onChangeEnd?: () => void
}

/**
 * The in-app color picker, the same on every platform: a color square, hue
 * and opacity sliders (all keyboard-operable), the color as text to read or
 * type (hex, rgb(), hsl() …) and a dropper (or, where the browser has
 * none, the system color picker).
 */
export function ColorPicker({
  label,
  color,
  allowsTransparency,
  onChange,
  onChangeEnd,
}: ColorPickerProps) {
  const SliderPicker = allowsTransparency ? HexAlphaColorPicker : HexColorPicker
  return (
    <div role="group" aria-label={`${label} picker`} className={styles.picker}>
      <SliderPicker
        color={color}
        onChange={onChange}
        onChangeEnd={() => onChangeEnd?.()}
      />
      <div className={styles.fields}>
        <TypedColorField
          label={label}
          color={color}
          allowsTransparency={allowsTransparency}
          onChange={(typedColor) => {
            onChange(typedColor)
            onChangeEnd?.()
          }}
        />
        <DropperOrSystemPicker
          color={color}
          allowsTransparency={allowsTransparency}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
        />
      </div>
    </div>
  )
}
